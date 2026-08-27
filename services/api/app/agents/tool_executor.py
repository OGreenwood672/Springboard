import uuid
from datetime import timedelta
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.time import utc_now, is_expired
from app.core.geo import geocode_uk_postcode, create_point_geom
from app.models import (
    User,
    YouthProfile,
    Business,
    Opportunity,
    Application,
    PendingAction,
    YouthQualification,
    Qualification,
)
from app.services.matching_service import (
    calculate_match_score,
    get_or_generate_matches_for_youth,
    get_matches_for_opportunity,
)
from app.agents.schemas import (
    YouthProfilePatchSchema,
    BusinessProfilePatchSchema,
    OpportunityDraftExtractionSchema,
    OpportunitySearchFiltersSchema,
    CandidateSearchFiltersSchema,
    ApplicationDraftSchema,
    UICardPayload,
)


class ToolExecutor:
    """Secure, allow-listed execution engine for Agent tools.
    Validates Pydantic inputs, enforces user roles and resource ownership,
    and manages the pending-action confirmation state machine.
    """

    def __init__(self, db: Session, user: User, conversation_id: uuid.UUID):
        self.db = db
        self.user = user
        self.conversation_id = conversation_id
        self.is_postgres = (db.bind.dialect.name == "postgresql") if db.bind else False

    # =========================================================================
    # Youth Tools
    # =========================================================================

    def get_my_youth_profile(self, **kwargs) -> Tuple[Dict[str, Any], List[UICardPayload]]:
        if self.user.role != "youth":
            raise HTTPException(status_code=403, detail="Only youth users can access youth profiles.")

        profile = self.db.query(YouthProfile).filter(YouthProfile.user_id == self.user.id).first()
        if not profile:
            return {"error": "Youth profile not found. Let's create one!"}, []

        data = {
            "id": str(profile.id),
            "full_name": profile.full_name,
            "postcode": profile.postcode,
            "max_travel_km": profile.max_travel_km,
            "education_stage": profile.education_stage,
            "skills": profile.skills or [],
            "interests": profile.interests or [],
            "availability": profile.availability or {},
            "bio": profile.bio,
            "preferred_opportunity_types": profile.preferred_opportunity_types or [],
            "qualifications": [
                {"name": q.name, "grade": q.grade, "year_obtained": q.year_obtained}
                for q in (profile.qualifications or [])
            ],
        }

        cards = [
            UICardPayload(
                id=str(uuid.uuid4()),
                card_type="profile_summary",
                data=data,
            )
        ]
        return data, cards

    def propose_youth_profile_update(self, **kwargs) -> Tuple[Dict[str, Any], List[UICardPayload]]:
        if self.user.role != "youth":
            raise HTTPException(status_code=403, detail="Only youth users can update youth profiles.")

        patch = YouthProfilePatchSchema(**kwargs)
        payload = patch.model_dump(exclude_unset=True)

        if not payload:
            return {"message": "No profile updates were provided."}, []

        # Create pending action record
        pending = PendingAction(
            id=uuid.uuid4(),
            user_id=self.user.id,
            conversation_id=self.conversation_id,
            action_type="update_youth_profile",
            payload=payload,
            status="pending",
            expires_at=utc_now() + timedelta(hours=24),
        )
        self.db.add(pending)
        self.db.commit()
        self.db.refresh(pending)

        # Build summary of changes for confirmation card
        diff_summary = {}
        for k, v in payload.items():
            if v is not None:
                diff_summary[k.replace("_", " ").title()] = v

        cards = [
            UICardPayload(
                id=str(uuid.uuid4()),
                card_type="confirmation_card",
                data={
                    "pending_action_id": str(pending.id),
                    "action_type": "update_youth_profile",
                    "title": "Review Profile Updates",
                    "description": "Please review the proposed updates to your profile. Click Confirm to save changes.",
                    "diff_summary": diff_summary,
                    "preview_data": payload,
                    "expires_at": pending.expires_at.isoformat(),
                    "status": "pending",
                },
            )
        ]

        return {
            "status": "pending_confirmation",
            "pending_action_id": str(pending.id),
            "summary": "Profile update proposed. Awaiting user confirmation.",
            "changes": payload,
        }, cards

    def confirm_youth_profile_update(self, pending_action_id: str) -> Dict[str, Any]:
        if self.user.role != "youth":
            raise HTTPException(status_code=403, detail="Unauthorized role.")

        action = self.db.query(PendingAction).filter(
            PendingAction.id == uuid.UUID(pending_action_id),
            PendingAction.user_id == self.user.id,
        ).first()

        if not action or action.status != "pending":
            raise HTTPException(status_code=400, detail="Invalid, cancelled, or already confirmed action.")

        if is_expired(action.expires_at):
            action.status = "expired"
            self.db.commit()
            raise HTTPException(status_code=400, detail="This proposal has expired.")

        profile = self.db.query(YouthProfile).filter(YouthProfile.user_id == self.user.id).first()
        if not profile:
            profile = YouthProfile(
                user_id=self.user.id,
                full_name=self.user.email.split("@")[0].title(),
            )
            self.db.add(profile)
            self.db.flush()

        payload = action.payload
        for field in ["full_name", "max_travel_km", "education_stage", "bio", "skills", "interests", "availability", "preferred_opportunity_types"]:
            if field in payload and payload[field] is not None:
                setattr(profile, field, payload[field])

        if "postcode" in payload and payload["postcode"]:
            pc = payload["postcode"]
            profile.postcode = pc
            lat, lon = geocode_uk_postcode(pc)
            profile.latitude = lat
            profile.longitude = lon
            profile.location_geom = create_point_geom(lat, lon, is_postgres=self.is_postgres)

        if "qualifications" in payload and payload["qualifications"]:
            # Sync qualifications
            for q_item in payload["qualifications"]:
                q_name = q_item.get("name")
                if q_name:
                    qual = self.db.query(Qualification).filter(Qualification.name == q_name).first()
                    if not qual:
                        qual = Qualification(name=q_name, category="Other")
                        self.db.add(qual)
                        self.db.flush()

                    existing_yq = self.db.query(YouthQualification).filter(
                        YouthQualification.youth_profile_id == profile.id,
                        YouthQualification.name == q_name,
                    ).first()

                    if existing_yq:
                        existing_yq.grade = q_item.get("grade", existing_yq.grade)
                        existing_yq.year_obtained = q_item.get("year_obtained", existing_yq.year_obtained)
                    else:
                        yq = YouthQualification(
                            youth_profile_id=profile.id,
                            qualification_id=qual.id,
                            name=q_name,
                            grade=q_item.get("grade"),
                            year_obtained=q_item.get("year_obtained"),
                        )
                        self.db.add(yq)

        action.status = "confirmed"
        action.confirmed_at = utc_now()
        self.db.commit()

        return {
            "status": "confirmed",
            "message": "Your profile has been updated successfully!",
            "profile_id": str(profile.id),
        }

    def search_published_opportunities(self, **kwargs) -> Tuple[Dict[str, Any], List[UICardPayload]]:
        filters = OpportunitySearchFiltersSchema(**kwargs)
        query = self.db.query(Opportunity).filter(Opportunity.status == "published")

        if filters.opportunity_type:
            query = query.filter(Opportunity.opportunity_type == filters.opportunity_type)
        if filters.workplace_type:
            query = query.filter(Opportunity.workplace_type == filters.workplace_type)
        if filters.keyword:
            kw = f"%{filters.keyword}%"
            query = query.filter(
                (Opportunity.title.ilike(kw)) |
                (Opportunity.description.ilike(kw)) |
                (Opportunity.location_name.ilike(kw))
            )

        results = query.limit(5).all()

        cards = []
        out_list = []
        for opp in results:
            opp_dict = {
                "id": str(opp.id),
                "title": opp.title,
                "opportunity_type": opp.opportunity_type,
                "business_name": opp.business.name if opp.business else "Verified Employer",
                "organisation_type": opp.business.organisation_type if opp.business else None,
                "description": opp.description,
                "location_name": opp.location_name or opp.postcode or "UK",
                "postcode": opp.postcode,
                "workplace_type": opp.workplace_type,
                "pay_info": opp.pay_info,
                "hours_or_commitment": opp.hours_or_commitment,
                "required_skills": opp.required_skills or [],
                "preferred_skills": opp.preferred_skills or [],
                "status": opp.status,
                "created_at": opp.created_at.isoformat(),
                "updated_at": opp.updated_at.isoformat(),
            }
            out_list.append(opp_dict)
            cards.append(
                UICardPayload(
                    id=str(uuid.uuid4()),
                    card_type="opportunity_recommendation",
                    data={"opportunity": opp_dict},
                )
            )

        return {"count": len(out_list), "opportunities": out_list}, cards

    def get_my_recommended_opportunities(self, **kwargs) -> Tuple[Dict[str, Any], List[UICardPayload]]:
        if self.user.role != "youth":
            raise HTTPException(status_code=403, detail="Only youth users can view personalized recommendations.")

        profile = self.db.query(YouthProfile).filter(YouthProfile.user_id == self.user.id).first()
        if not profile:
            return {"error": "Please set up your profile first to view personalized matches."}, []

        matches = get_or_generate_matches_for_youth(self.db, profile)
        top_matches = matches[:5]

        cards = []
        out_list = []
        for match in top_matches:
            opp = match.opportunity
            if not opp or opp.status != "published":
                continue

            factors = match.factors or {}
            explanation_points = []
            if factors.get("distance_km") is not None:
                explanation_points.append(f"Located {factors['distance_km']} km from you (within your {profile.max_travel_km} km travel preference).")
            if factors.get("matched_skills"):
                explanation_points.append(f"Matches your skills in: {', '.join(factors['matched_skills'])}.")
            if opp.pay_info:
                explanation_points.append(f"Compensation: {opp.pay_info}.")

            opp_dict = {
                "id": str(opp.id),
                "title": opp.title,
                "opportunity_type": opp.opportunity_type,
                "business_name": opp.business.name if opp.business else "Verified Employer",
                "organisation_type": opp.business.organisation_type if opp.business else None,
                "description": opp.description,
                "location_name": opp.location_name or opp.postcode or "UK",
                "postcode": opp.postcode,
                "workplace_type": opp.workplace_type,
                "pay_info": opp.pay_info,
                "hours_or_commitment": opp.hours_or_commitment,
                "required_skills": opp.required_skills or [],
                "preferred_skills": opp.preferred_skills or [],
                "status": opp.status,
                "created_at": opp.created_at.isoformat(),
                "updated_at": opp.updated_at.isoformat(),
            }

            out_list.append({
                "opportunity": opp_dict,
                "match_score": round(match.score),
                "factors": factors,
                "explanation_points": explanation_points,
            })

            cards.append(
                UICardPayload(
                    id=str(uuid.uuid4()),
                    card_type="opportunity_recommendation",
                    data={
                        "opportunity": opp_dict,
                        "match_score": round(match.score),
                        "factors": factors,
                        "explanation_points": explanation_points,
                    },
                )
            )

        return {"count": len(out_list), "recommendations": out_list}, cards

    def get_opportunity_details(self, opportunity_id: str, **kwargs) -> Tuple[Dict[str, Any], List[UICardPayload]]:
        opp = self.db.query(Opportunity).filter(
            Opportunity.id == uuid.UUID(opportunity_id),
            Opportunity.status == "published",
        ).first()

        if not opp:
            return {"error": "Opportunity not found or no longer active."}, []

        opp_dict = {
            "id": str(opp.id),
            "title": opp.title,
            "opportunity_type": opp.opportunity_type,
            "business_name": opp.business.name if opp.business else "Verified Employer",
            "organisation_type": opp.business.organisation_type if opp.business else None,
            "description": opp.description,
            "location_name": opp.location_name or opp.postcode or "UK",
            "postcode": opp.postcode,
            "workplace_type": opp.workplace_type,
            "pay_info": opp.pay_info,
            "hours_or_commitment": opp.hours_or_commitment,
            "required_skills": opp.required_skills or [],
            "preferred_skills": opp.preferred_skills or [],
            "status": opp.status,
            "created_at": opp.created_at.isoformat(),
            "updated_at": opp.updated_at.isoformat(),
        }

        cards = [
            UICardPayload(
                id=str(uuid.uuid4()),
                card_type="opportunity_recommendation",
                data={"opportunity": opp_dict},
            )
        ]
        return opp_dict, cards

    def explain_opportunity_match(self, opportunity_id: str, **kwargs) -> Tuple[Dict[str, Any], List[UICardPayload]]:
        if self.user.role != "youth":
            raise HTTPException(status_code=403, detail="Only youth users can request match explanations.")

        profile = self.db.query(YouthProfile).filter(YouthProfile.user_id == self.user.id).first()
        if not profile:
            return {"error": "Please set up your profile first."}, []

        opp = self.db.query(Opportunity).filter(
            Opportunity.id == uuid.UUID(opportunity_id),
            Opportunity.status == "published",
        ).first()

        if not opp:
            return {"error": "Opportunity not found."}, []

        score, factors = calculate_match_score(profile, opp)

        explanation_points = []
        explanation_points.append(f"Opportunity Type alignment: {factors['type_score']}/25 pts ({opp.opportunity_type.replace('_', ' ')}).")
        explanation_points.append(f"Skills alignment: {factors['skills_score']}/35 pts (Matching: {', '.join(factors.get('matched_skills', [])) or 'None yet'}).")
        if factors.get("distance_km") is not None:
            explanation_points.append(f"Location proximity: {factors['location_score']}/25 pts ({factors['distance_km']} km away, max travel {profile.max_travel_km} km).")
        else:
            explanation_points.append(f"Location score: {factors['location_score']}/25 pts ({opp.workplace_type}).")
        explanation_points.append(f"Schedule & availability: {factors['availability_score']}/10 pts.")

        result = {
            "opportunity_title": opp.title,
            "total_score": round(score),
            "factors": factors,
            "explanation_points": explanation_points,
        }

        return result, []

    def create_application_draft(self, opportunity_id: str, cover_note: Optional[str] = None, **kwargs) -> Tuple[Dict[str, Any], List[UICardPayload]]:
        if self.user.role != "youth":
            raise HTTPException(status_code=403, detail="Only youth users can apply for opportunities.")

        profile = self.db.query(YouthProfile).filter(YouthProfile.user_id == self.user.id).first()
        if not profile:
            return {"error": "Please complete your youth profile before applying."}, []

        opp = self.db.query(Opportunity).filter(
            Opportunity.id == uuid.UUID(opportunity_id),
            Opportunity.status == "published",
        ).first()

        if not opp:
            return {"error": "Opportunity is not published or no longer available."}, []

        # Check existing application
        existing = self.db.query(Application).filter(
            Application.youth_profile_id == profile.id,
            Application.opportunity_id == opp.id,
        ).first()

        if existing and existing.status not in ["withdrawn", "rejected"]:
            return {"error": f"You have already applied for this opportunity (Status: {existing.status})."}, []

        payload = {
            "opportunity_id": str(opp.id),
            "opportunity_title": opp.title,
            "business_name": opp.business.name if opp.business else "Employer",
            "cover_note": cover_note or "",
        }

        pending = PendingAction(
            id=uuid.uuid4(),
            user_id=self.user.id,
            conversation_id=self.conversation_id,
            action_type="submit_application",
            payload=payload,
            status="pending",
            expires_at=utc_now() + timedelta(hours=24),
        )
        self.db.add(pending)
        self.db.commit()
        self.db.refresh(pending)

        cards = [
            UICardPayload(
                id=str(uuid.uuid4()),
                card_type="confirmation_card",
                data={
                    "pending_action_id": str(pending.id),
                    "action_type": "submit_application",
                    "title": f"Confirm Application: {opp.title}",
                    "description": f"Ready to apply to {opp.business.name if opp.business else 'Organisation'}? Your profile and qualifications will be submitted.",
                    "diff_summary": {
                        "Opportunity": opp.title,
                        "Employer": opp.business.name if opp.business else "Organisation",
                        "Type": opp.opportunity_type.replace("_", " ").title(),
                        "Cover Note": cover_note or "(None provided)",
                    },
                    "preview_data": payload,
                    "expires_at": pending.expires_at.isoformat(),
                    "status": "pending",
                },
            )
        ]

        return {
            "status": "pending_confirmation",
            "pending_action_id": str(pending.id),
            "summary": f"Application draft for '{opp.title}' created. Awaiting confirmation.",
        }, cards

    def confirm_application(self, pending_action_id: str) -> Dict[str, Any]:
        if self.user.role != "youth":
            raise HTTPException(status_code=403, detail="Unauthorized role.")

        action = self.db.query(PendingAction).filter(
            PendingAction.id == uuid.UUID(pending_action_id),
            PendingAction.user_id == self.user.id,
        ).first()

        if not action or action.status != "pending" or is_expired(action.expires_at):
            raise HTTPException(status_code=400, detail="Invalid or expired action.")

        profile = self.db.query(YouthProfile).filter(YouthProfile.user_id == self.user.id).first()
        opp_id = uuid.UUID(action.payload["opportunity_id"])

        opp = self.db.query(Opportunity).filter(Opportunity.id == opp_id).first()
        if not opp or opp.status != "published":
            action.status = "cancelled"
            self.db.commit()
            raise HTTPException(status_code=400, detail="This listing is no longer open.")

        app = Application(
            youth_profile_id=profile.id,
            opportunity_id=opp.id,
            status="submitted",
            cover_note=action.payload.get("cover_note"),
        )
        self.db.add(app)
        action.status = "confirmed"
        action.confirmed_at = utc_now()
        self.db.commit()

        return {
            "status": "confirmed",
            "message": f"Your application for '{opp.title}' has been officially submitted!",
            "application_id": str(app.id),
        }

    # =========================================================================
    # Business Tools
    # =========================================================================

    def get_my_business_profile(self, **kwargs) -> Tuple[Dict[str, Any], List[UICardPayload]]:
        if self.user.role != "business":
            raise HTTPException(status_code=403, detail="Only employers can access business profiles.")

        biz = self.db.query(Business).filter(Business.user_id == self.user.id).first()
        if not biz:
            return {"error": "Business profile not found. Let's register your organisation!"}, []

        data = {
            "id": str(biz.id),
            "name": biz.name,
            "organisation_type": biz.organisation_type,
            "contact_name": biz.contact_name,
            "contact_email": biz.contact_email,
            "description": biz.description,
            "address": biz.address,
            "postcode": biz.postcode,
            "website": biz.website,
        }
        return data, []

    def propose_business_profile_update(self, **kwargs) -> Tuple[Dict[str, Any], List[UICardPayload]]:
        if self.user.role != "business":
            raise HTTPException(status_code=403, detail="Only employers can update organisation profiles.")

        patch = BusinessProfilePatchSchema(**kwargs)
        payload = patch.model_dump(exclude_unset=True)

        if not payload:
            return {"message": "No organisation profile changes provided."}, []

        pending = PendingAction(
            id=uuid.uuid4(),
            user_id=self.user.id,
            conversation_id=self.conversation_id,
            action_type="update_business_profile",
            payload=payload,
            status="pending",
            expires_at=utc_now() + timedelta(hours=24),
        )
        self.db.add(pending)
        self.db.commit()
        self.db.refresh(pending)

        diff_summary = {k.replace("_", " ").title(): v for k, v in payload.items() if v is not None}

        cards = [
            UICardPayload(
                id=str(uuid.uuid4()),
                card_type="confirmation_card",
                data={
                    "pending_action_id": str(pending.id),
                    "action_type": "update_business_profile",
                    "title": "Review Organisation Details",
                    "description": "Please confirm the updates to your organisation profile.",
                    "diff_summary": diff_summary,
                    "preview_data": payload,
                    "expires_at": pending.expires_at.isoformat(),
                    "status": "pending",
                },
            )
        ]

        return {
            "status": "pending_confirmation",
            "pending_action_id": str(pending.id),
            "summary": "Organisation profile update proposed. Awaiting confirmation.",
            "changes": payload,
        }, cards

    def confirm_business_profile_update(self, pending_action_id: str) -> Dict[str, Any]:
        if self.user.role != "business":
            raise HTTPException(status_code=403, detail="Unauthorized role.")

        action = self.db.query(PendingAction).filter(
            PendingAction.id == uuid.UUID(pending_action_id),
            PendingAction.user_id == self.user.id,
        ).first()

        if not action or action.status != "pending" or is_expired(action.expires_at):
            raise HTTPException(status_code=400, detail="Invalid or expired action.")

        biz = self.db.query(Business).filter(Business.user_id == self.user.id).first()
        if not biz:
            biz = Business(
                user_id=self.user.id,
                name="My Organisation",
                organisation_type="Technology",
                contact_name="Lead Contact",
                contact_email=self.user.email,
            )
            self.db.add(biz)
            self.db.flush()

        payload = action.payload
        for field in ["name", "organisation_type", "contact_name", "contact_email", "description", "address", "website"]:
            if field in payload and payload[field] is not None:
                setattr(biz, field, payload[field])

        if "postcode" in payload and payload["postcode"]:
            pc = payload["postcode"]
            biz.postcode = pc
            lat, lon = geocode_uk_postcode(pc)
            biz.latitude = lat
            biz.longitude = lon
            biz.location_geom = create_point_geom(lat, lon, is_postgres=self.is_postgres)

        action.status = "confirmed"
        action.confirmed_at = utc_now()
        self.db.commit()

        return {
            "status": "confirmed",
            "message": "Organisation profile updated successfully!",
            "business_id": str(biz.id),
        }

    def propose_opportunity(self, **kwargs) -> Tuple[Dict[str, Any], List[UICardPayload]]:
        if self.user.role != "business":
            raise HTTPException(status_code=403, detail="Only employers can create opportunities.")

        biz = self.db.query(Business).filter(Business.user_id == self.user.id).first()
        if not biz:
            return {"error": "Please set up your organisation profile before posting opportunities."}, []

        draft = OpportunityDraftExtractionSchema(**kwargs)
        payload = draft.model_dump(exclude_unset=True)
        # Default postcode to business postcode if not specified
        if not payload.get("postcode") and biz.postcode:
            payload["postcode"] = biz.postcode
        if not payload.get("location_name") and biz.address:
            payload["location_name"] = biz.address

        pending = PendingAction(
            id=uuid.uuid4(),
            user_id=self.user.id,
            conversation_id=self.conversation_id,
            action_type="create_opportunity_draft",
            payload=payload,
            status="pending",
            expires_at=utc_now() + timedelta(hours=24),
        )
        self.db.add(pending)
        self.db.commit()
        self.db.refresh(pending)

        missing_fields = []
        if not payload.get("postcode"):
            missing_fields.append("UK Postcode")
        if not payload.get("pay_info") and payload.get("opportunity_type") == "part_time_job":
            missing_fields.append("Pay rate (£/hr)")

        cards = [
            UICardPayload(
                id=str(uuid.uuid4()),
                card_type="opportunity_draft",
                data={
                    "draft": payload,
                    "missing_required_fields": missing_fields,
                    "is_publish_ready": len(missing_fields) == 0,
                },
            ),
            UICardPayload(
                id=str(uuid.uuid4()),
                card_type="confirmation_card",
                data={
                    "pending_action_id": str(pending.id),
                    "action_type": "create_opportunity_draft",
                    "title": f"Review Opportunity: {payload['title']}",
                    "description": "Please review this opportunity vacancy. Click Confirm to save as draft or publish to candidates.",
                    "diff_summary": {
                        "Title": payload["title"],
                        "Type": payload["opportunity_type"].replace("_", " ").title(),
                        "Workplace": payload.get("workplace_type", "In-person").capitalize(),
                        "Pay": payload.get("pay_info", "Unpaid / Voluntary"),
                        "Hours": payload.get("hours_or_commitment", "Flexible"),
                        "Status": payload.get("status", "draft").capitalize(),
                    },
                    "preview_data": payload,
                    "expires_at": pending.expires_at.isoformat(),
                    "status": "pending",
                },
            ),
        ]

        return {
            "status": "pending_confirmation",
            "pending_action_id": str(pending.id),
            "summary": f"Opportunity draft for '{payload['title']}' created. Awaiting confirmation.",
            "draft": payload,
        }, cards

    def confirm_opportunity_creation(self, pending_action_id: str, publish_now: bool = False) -> Dict[str, Any]:
        if self.user.role != "business":
            raise HTTPException(status_code=403, detail="Unauthorized role.")

        action = self.db.query(PendingAction).filter(
            PendingAction.id == uuid.UUID(pending_action_id),
            PendingAction.user_id == self.user.id,
        ).first()

        if not action or action.status != "pending" or is_expired(action.expires_at):
            raise HTTPException(status_code=400, detail="Invalid or expired action.")

        biz = self.db.query(Business).filter(Business.user_id == self.user.id).first()
        payload = action.payload

        target_status = "published" if publish_now else payload.get("status", "draft")

        lat, lon = None, None
        loc_geom = None
        if payload.get("postcode"):
            lat, lon = geocode_uk_postcode(payload["postcode"])
            loc_geom = create_point_geom(lat, lon, is_postgres=self.is_postgres)

        opp = Opportunity(
            business_id=biz.id,
            title=payload["title"],
            opportunity_type=payload["opportunity_type"],
            description=payload["description"],
            required_skills=payload.get("required_skills", []),
            preferred_skills=payload.get("preferred_skills", []),
            location_name=payload.get("location_name"),
            postcode=payload.get("postcode"),
            workplace_type=payload.get("workplace_type", "in_person"),
            pay_info=payload.get("pay_info"),
            hours_or_commitment=payload.get("hours_or_commitment"),
            status=target_status,
            latitude=lat,
            longitude=lon,
            location_geom=loc_geom,
        )
        self.db.add(opp)
        action.status = "confirmed"
        action.confirmed_at = utc_now()
        self.db.commit()
        self.db.refresh(opp)

        return {
            "status": "confirmed",
            "message": f"Opportunity '{opp.title}' has been successfully {target_status}!",
            "opportunity_id": str(opp.id),
            "listing_status": opp.status,
        }

    def list_my_opportunities(self, status: Optional[str] = None, **kwargs) -> Tuple[Dict[str, Any], List[UICardPayload]]:
        if self.user.role != "business":
            raise HTTPException(status_code=403, detail="Only employers can list their opportunities.")

        biz = self.db.query(Business).filter(Business.user_id == self.user.id).first()
        if not biz:
            return {"count": 0, "opportunities": []}, []

        query = self.db.query(Opportunity).filter(Opportunity.business_id == biz.id)
        if status and status != "all":
            query = query.filter(Opportunity.status == status)

        opps = query.order_by(Opportunity.created_at.desc()).all()

        out = []
        for o in opps:
            out.append({
                "id": str(o.id),
                "title": o.title,
                "opportunity_type": o.opportunity_type,
                "status": o.status,
                "pay_info": o.pay_info,
                "applications_count": len(o.applications),
            })

        return {"count": len(out), "opportunities": out}, []

    def get_my_opportunity_details(self, opportunity_id: str, **kwargs) -> Tuple[Dict[str, Any], List[UICardPayload]]:
        if self.user.role != "business":
            raise HTTPException(status_code=403, detail="Unauthorized role.")

        biz = self.db.query(Business).filter(Business.user_id == self.user.id).first()
        opp = self.db.query(Opportunity).filter(
            Opportunity.id == uuid.UUID(opportunity_id),
            Opportunity.business_id == biz.id,
        ).first()

        if not opp:
            return {"error": "Opportunity not found under your organisation."}, []

        opp_dict = {
            "id": str(opp.id),
            "title": opp.title,
            "opportunity_type": opp.opportunity_type,
            "description": opp.description,
            "required_skills": opp.required_skills or [],
            "preferred_skills": opp.preferred_skills or [],
            "status": opp.status,
            "workplace_type": opp.workplace_type,
            "pay_info": opp.pay_info,
            "hours_or_commitment": opp.hours_or_commitment,
            "postcode": opp.postcode,
            "applications_count": len(opp.applications),
        }
        return opp_dict, []

    def search_candidates_for_my_opportunity(self, opportunity_id: str, min_score: float = 0.0, **kwargs) -> Tuple[Dict[str, Any], List[UICardPayload]]:
        if self.user.role != "business":
            raise HTTPException(status_code=403, detail="Only employers can search candidates for their opportunities.")

        biz = self.db.query(Business).filter(Business.user_id == self.user.id).first()
        opp = self.db.query(Opportunity).filter(
            Opportunity.id == uuid.UUID(opportunity_id),
            Opportunity.business_id == biz.id,
        ).first()

        if not opp:
            return {"error": "Opportunity not found under your organisation."}, []

        matches = get_matches_for_opportunity(self.db, opp)
        filtered = [m for m in matches if m.score >= min_score][:5]

        out_list = []
        cards = []
        for match in filtered:
            youth = match.youth_profile
            if not youth:
                continue

            factors = match.factors or {}
            explanation_points = []
            if factors.get("distance_km") is not None:
                explanation_points.append(f"Located {factors['distance_km']} km away.")
            if factors.get("matched_skills"):
                explanation_points.append(f"Possesses matching skills: {', '.join(factors['matched_skills'])}.")
            if youth.education_stage:
                explanation_points.append(f"Education stage: {youth.education_stage.replace('_', ' ').capitalize()}.")

            cand_data = {
                "youth_profile_id": str(youth.id),
                "opportunity_id": str(opp.id),
                "candidate_name": youth.full_name,
                "education_stage": youth.education_stage,
                "postcode_area": youth.postcode.split()[0] if youth.postcode else "UK",
                "distance_km": factors.get("distance_km"),
                "match_score": round(match.score),
                "factors": factors,
                "matched_skills": factors.get("matched_skills", []),
                "explanation_points": explanation_points,
            }
            out_list.append(cand_data)

            cards.append(
                UICardPayload(
                    id=str(uuid.uuid4()),
                    card_type="candidate_match",
                    data=cand_data,
                )
            )

        return {"count": len(out_list), "candidates": out_list}, cards

    def explain_candidate_match(self, opportunity_id: str, youth_profile_id: str, **kwargs) -> Tuple[Dict[str, Any], List[UICardPayload]]:
        if self.user.role != "business":
            raise HTTPException(status_code=403, detail="Unauthorized role.")

        biz = self.db.query(Business).filter(Business.user_id == self.user.id).first()
        opp = self.db.query(Opportunity).filter(
            Opportunity.id == uuid.UUID(opportunity_id),
            Opportunity.business_id == biz.id,
        ).first()

        youth = self.db.query(YouthProfile).filter(YouthProfile.id == uuid.UUID(youth_profile_id)).first()
        if not opp or not youth:
            return {"error": "Opportunity or candidate profile not found."}, []

        score, factors = calculate_match_score(youth, opp)

        explanation_points = [
            f"Opportunity Type compatibility: {factors['type_score']}/25 pts.",
            f"Skills alignment: {factors['skills_score']}/35 pts ({len(factors.get('matched_skills', []))} matched skills).",
            f"Proximity: {factors['location_score']}/25 pts ({factors.get('distance_km', 'N/A')} km distance).",
            f"Schedule availability: {factors['availability_score']}/10 pts.",
        ]

        return {
            "candidate_name": youth.full_name,
            "total_score": round(score),
            "factors": factors,
            "explanation_points": explanation_points,
        }, []

    def propose_opportunity_status_update(self, opportunity_id: str, status: str, **kwargs) -> Tuple[Dict[str, Any], List[UICardPayload]]:
        if self.user.role != "business":
            raise HTTPException(status_code=403, detail="Only employers can update opportunity status.")

        biz = self.db.query(Business).filter(Business.user_id == self.user.id).first()
        opp = self.db.query(Opportunity).filter(
            Opportunity.id == uuid.UUID(opportunity_id),
            Opportunity.business_id == biz.id,
        ).first()

        if not opp:
            return {"error": "Opportunity not found."}, []

        payload = {
            "opportunity_id": str(opp.id),
            "opportunity_title": opp.title,
            "previous_status": opp.status,
            "new_status": status,
        }

        pending = PendingAction(
            id=uuid.uuid4(),
            user_id=self.user.id,
            conversation_id=self.conversation_id,
            action_type="update_opportunity_status",
            payload=payload,
            status="pending",
            expires_at=utc_now() + timedelta(hours=24),
        )
        self.db.add(pending)
        self.db.commit()
        self.db.refresh(pending)

        cards = [
            UICardPayload(
                id=str(uuid.uuid4()),
                card_type="confirmation_card",
                data={
                    "pending_action_id": str(pending.id),
                    "action_type": "update_opportunity_status",
                    "title": f"Update Status: {opp.title}",
                    "description": f"Change listing status from '{opp.status}' to '{status}'?",
                    "diff_summary": {
                        "Opportunity": opp.title,
                        "Current Status": opp.status.capitalize(),
                        "New Status": status.capitalize(),
                    },
                    "preview_data": payload,
                    "expires_at": pending.expires_at.isoformat(),
                    "status": "pending",
                },
            )
        ]

        return {
            "status": "pending_confirmation",
            "pending_action_id": str(pending.id),
            "summary": f"Status update to '{status}' proposed for '{opp.title}'. Awaiting confirmation.",
        }, cards

    def confirm_opportunity_status_update(self, pending_action_id: str) -> Dict[str, Any]:
        if self.user.role != "business":
            raise HTTPException(status_code=403, detail="Unauthorized role.")

        action = self.db.query(PendingAction).filter(
            PendingAction.id == uuid.UUID(pending_action_id),
            PendingAction.user_id == self.user.id,
        ).first()

        if not action or action.status != "pending" or is_expired(action.expires_at):
            raise HTTPException(status_code=400, detail="Invalid or expired action.")

        opp_id = uuid.UUID(action.payload["opportunity_id"])
        opp = self.db.query(Opportunity).filter(Opportunity.id == opp_id).first()

        if not opp:
            raise HTTPException(status_code=404, detail="Opportunity not found.")

        opp.status = action.payload["new_status"]
        action.status = "confirmed"
        action.confirmed_at = utc_now()
        self.db.commit()

        return {
            "status": "confirmed",
            "message": f"Opportunity '{opp.title}' status has been updated to '{opp.status}'!",
            "opportunity_id": str(opp.id),
            "new_status": opp.status,
        }
