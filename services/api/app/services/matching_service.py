from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from app.models.youth_profile import YouthProfile
from app.models.opportunity import Opportunity
from app.models.match import Match
from app.core.geo import calculate_haversine_distance_km


def calculate_match_score(
    youth: YouthProfile,
    opportunity: Opportunity,
) -> Tuple[float, Dict[str, Any]]:
    """
    Calculate deterministic compatibility score (0 to 100) between a youth profile and an opportunity.
    """
    # 1. Gatekeeper: Status must be published
    if opportunity.status != "published":
        return 0.0, {
            "total_score": 0.0,
            "reason": "Opportunity is not published",
            "type_score": 0.0,
            "skills_score": 0.0,
            "location_score": 0.0,
            "availability_score": 0.0,
            "qualification_score": 0.0,
            "distance_km": None,
            "matched_skills": [],
            "missing_skills": opportunity.required_skills or [],
        }

    # 2. Preferred Opportunity Type Score (Max 25 pts)
    type_score = 0.0
    preferred_types = [t.lower() for t in (youth.preferred_opportunity_types or [])]
    opp_type = (opportunity.opportunity_type or "").lower()

    if not preferred_types:
        type_score = 15.0  # Flexible/neutral
    elif opp_type in preferred_types:
        type_score = 25.0
    else:
        type_score = 5.0  # Slight cross-exposure partial

    # 3. Skills Overlap Score (Max 35 pts: 25 required + 10 preferred)
    youth_skills = set(s.strip().lower() for s in (youth.skills or []))
    req_skills = [s.strip() for s in (opportunity.required_skills or [])]
    pref_skills = [s.strip() for s in (opportunity.preferred_skills or [])]

    matched_skills = []
    missing_skills = []

    req_score = 0.0
    if not req_skills:
        req_score = 25.0
    else:
        matched_req = 0
        for s in req_skills:
            if s.lower() in youth_skills:
                matched_req += 1
                matched_skills.append(s)
            else:
                missing_skills.append(s)
        req_score = (matched_req / len(req_skills)) * 25.0

    pref_score = 0.0
    if pref_skills:
        matched_pref = 0
        for s in pref_skills:
            if s.lower() in youth_skills:
                matched_pref += 1
                if s not in matched_skills:
                    matched_skills.append(s)
        pref_score = (matched_pref / len(pref_skills)) * 10.0
    else:
        pref_score = 10.0  # Full bonus if no preferred skills requested

    skills_score = round(req_score + pref_score, 1)

    # 4. Location & Travel Distance Score (Max 25 pts)
    location_score = 0.0
    distance_km = None

    if opportunity.workplace_type == "remote":
        location_score = 25.0
        distance_km = 0.0
    else:
        # Calculate distance
        if (
            youth.latitude is not None
            and youth.longitude is not None
            and opportunity.latitude is not None
            and opportunity.longitude is not None
        ):
            distance_km = calculate_haversine_distance_km(
                youth.latitude, youth.longitude,
                opportunity.latitude, opportunity.longitude,
            )
            max_km = float(youth.max_travel_km or 15)
            if distance_km is not None:
                if distance_km <= max_km:
                    # Scaled score: closer is higher
                    ratio = distance_km / (max_km * 1.2)
                    location_score = max(5.0, 25.0 * (1.0 - ratio))
                else:
                    location_score = 0.0  # Beyond max travel distance limit
        else:
            # Fallback if coordinates are not available
            if youth.postcode and opportunity.postcode:
                if youth.postcode[:3].upper() == opportunity.postcode[:3].upper():
                    location_score = 20.0
                else:
                    location_score = 10.0
            else:
                location_score = 15.0

    location_score = round(location_score, 1)

    # 5. Availability & Commitment Score (Max 10 pts)
    avail_score = 10.0
    youth_avail = youth.availability or {}
    youth_days = [d.lower() for d in youth_avail.get("days", [])]

    if youth_days:
        opp_commitment = (opportunity.hours_or_commitment or "").lower()
        if any(day in opp_commitment for day in youth_days):
            avail_score = 10.0
        else:
            avail_score = 8.0  # Moderate default

    # 6. Qualification Bonus (Max 5 pts)
    qual_score = 0.0
    if youth.qualifications:
        qual_score = 5.0

    # Total Score computation
    raw_total = type_score + skills_score + location_score + avail_score + qual_score
    total_score = min(100.0, max(0.0, round(raw_total, 1)))

    factors = {
        "total_score": total_score,
        "type_score": round(type_score, 1),
        "skills_score": round(skills_score, 1),
        "location_score": round(location_score, 1),
        "availability_score": round(avail_score, 1),
        "qualification_score": round(qual_score, 1),
        "distance_km": distance_km,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
    }

    return total_score, factors


def generate_matches_for_youth(
    db: Session,
    youth_profile_id: Any,
) -> List[Match]:
    """
    Generate or update matches for a youth profile across all published opportunities.
    """
    youth = db.query(YouthProfile).filter(YouthProfile.id == youth_profile_id).first()
    if not youth:
        return []

    published_opps = db.query(Opportunity).filter(Opportunity.status == "published").all()
    results = []

    for opp in published_opps:
        score, factors = calculate_match_score(youth, opp)

        # Upsert match record
        existing_match = db.query(Match).filter(
            Match.youth_profile_id == youth.id,
            Match.opportunity_id == opp.id,
        ).first()

        if existing_match:
            existing_match.score = score
            existing_match.factors = factors
            match_obj = existing_match
        else:
            match_obj = Match(
                youth_profile_id=youth.id,
                opportunity_id=opp.id,
                score=score,
                factors=factors,
            )
            db.add(match_obj)

        results.append(match_obj)

    db.commit()
    return sorted(results, key=lambda m: m.score, reverse=True)


def get_or_generate_matches_for_youth(
    db: Session,
    youth: YouthProfile,
) -> List[Match]:
    """
    Retrieve stored matches or compute them on demand for a youth profile.
    """
    matches = db.query(Match).filter(Match.youth_profile_id == youth.id).all()
    if not matches:
        matches = generate_matches_for_youth(db, youth.id)
    return sorted(matches, key=lambda m: m.score, reverse=True)


def get_matches_for_opportunity(
    db: Session,
    opportunity: Opportunity,
) -> List[Match]:
    """
    Retrieve or compute matches for an opportunity across all youth candidates.
    """
    youths = db.query(YouthProfile).all()
    results = []

    for y in youths:
        score, factors = calculate_match_score(y, opportunity)
        existing = db.query(Match).filter(
            Match.youth_profile_id == y.id,
            Match.opportunity_id == opportunity.id,
        ).first()

        if existing:
            existing.score = score
            existing.factors = factors
            match_obj = existing
        else:
            match_obj = Match(
                youth_profile_id=y.id,
                opportunity_id=opportunity.id,
                score=score,
                factors=factors,
            )
            db.add(match_obj)

        results.append(match_obj)

    db.commit()
    return sorted(results, key=lambda m: m.score, reverse=True)
