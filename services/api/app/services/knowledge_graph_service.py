import re
from collections import Counter, defaultdict
from typing import Iterable

from sqlalchemy.orm import Session

from app.models.opportunity import Opportunity
from app.models.youth_profile import YouthProfile


# This compact taxonomy provides useful links when the live opportunity catalogue
# does not yet contain enough co-occurrence data to connect a user's skills.
SKILL_TAXONOMY = {
    "python": ("Digital & Technology", ["data analysis", "git", "html/css"]),
    "html/css": ("Digital & Technology", ["javascript", "web design", "git"]),
    "javascript": ("Digital & Technology", ["html/css", "web design", "git"]),
    "git": ("Digital & Technology", ["python", "javascript", "teamwork"]),
    "data analysis": ("Digital & Technology", ["python", "problem solving", "spreadsheets"]),
    "web design": ("Creative & Digital", ["html/css", "content creation", "canva"]),
    "problem solving": ("Transferable", ["data analysis", "python", "leadership"]),
    "teamwork": ("Transferable", ["communication", "leadership", "project management"]),
    "leadership": ("Transferable", ["teamwork", "communication", "project management"]),
    "communication": ("Transferable", ["customer service", "event planning", "leadership"]),
    "customer service": ("Retail & Hospitality", ["communication", "cash handling", "sales"]),
    "cash handling": ("Retail & Hospitality", ["customer service", "sales", "numeracy"]),
    "sales": ("Retail & Hospitality", ["customer service", "communication", "social media"]),
    "event planning": ("Events & Community", ["project management", "social media", "leadership"]),
    "project management": ("Business & Operations", ["event planning", "leadership", "spreadsheets"]),
    "social media": ("Creative & Digital", ["content creation", "video editing", "canva"]),
    "content creation": ("Creative & Digital", ["social media", "video editing", "canva"]),
    "video editing": ("Creative & Digital", ["content creation", "social media", "canva"]),
    "canva": ("Creative & Digital", ["content creation", "social media", "web design"]),
    "first aid": ("Health & Community", ["safeguarding", "communication", "teamwork"]),
    "safeguarding": ("Health & Community", ["first aid", "communication", "leadership"]),
}


def _normalize(skill: str) -> str:
    return re.sub(r"\s+", " ", skill.strip().lower())


def _slug(skill: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", _normalize(skill)).strip("-")


def _display(skill: str, labels: dict[str, str]) -> str:
    return labels.get(skill, skill.title())


def _pairs(items: Iterable[str]):
    values = sorted(set(items))
    for index, source in enumerate(values):
        for target in values[index + 1:]:
            yield source, target


def build_knowledge_graph(db: Session, profile: YouthProfile) -> dict:
    opportunities = (
        db.query(Opportunity)
        .filter(Opportunity.status == "published")
        .order_by(Opportunity.created_at.desc())
        .all()
    )
    labels: dict[str, str] = {}
    current = set()
    for raw_skill in profile.skills or []:
        normalized = _normalize(raw_skill)
        if normalized:
            current.add(normalized)
            labels.setdefault(normalized, raw_skill.strip())

    demand = Counter()
    required_demand = Counter()
    co_occurrence = Counter()
    skill_sectors: dict[str, Counter] = defaultdict(Counter)
    opportunity_skills: dict[str, set[str]] = {}

    for opportunity in opportunities:
        sector = opportunity.business.organisation_type if opportunity.business else "Other"
        required = {_normalize(skill) for skill in opportunity.required_skills or [] if skill.strip()}
        preferred = {_normalize(skill) for skill in opportunity.preferred_skills or [] if skill.strip()}
        all_skills = required | preferred
        opportunity_skills[str(opportunity.id)] = all_skills

        for raw_skill in (opportunity.required_skills or []) + (opportunity.preferred_skills or []):
            labels.setdefault(_normalize(raw_skill), raw_skill.strip())
        for skill in all_skills:
            demand[skill] += 1
            skill_sectors[skill][sector] += 1
        for skill in required:
            required_demand[skill] += 1
        for pair in _pairs(all_skills):
            co_occurrence[pair] += 1

    candidate_connections = Counter()
    candidate_reasons: dict[str, set[str]] = defaultdict(set)

    for skill in current:
        taxonomy = SKILL_TAXONOMY.get(skill)
        if taxonomy:
            for neighbour in taxonomy[1]:
                if neighbour not in current:
                    candidate_connections[neighbour] += 1
                    candidate_reasons[neighbour].add(_display(skill, labels))

    for all_skills in opportunity_skills.values():
        owned_in_role = all_skills & current
        if not owned_in_role:
            continue
        for missing in all_skills - current:
            candidate_connections[missing] += len(owned_in_role)
            candidate_reasons[missing].update(_display(skill, labels) for skill in owned_in_role)

    ranked_frontier = sorted(
        candidate_connections,
        key=lambda skill: (
            -(candidate_connections[skill] * 2 + demand[skill] * 3 + required_demand[skill] * 2),
            _display(skill, labels),
        ),
    )[:8]
    frontier = set(ranked_frontier)
    graph_skills = current | frontier

    def sector_for(skill: str) -> str:
        if skill_sectors[skill]:
            return skill_sectors[skill].most_common(1)[0][0]
        return SKILL_TAXONOMY.get(skill, ("Transferable", []))[0]

    nodes = []
    for skill in sorted(current, key=lambda value: _display(value, labels)):
        role_count = demand[skill]
        nodes.append({
            "id": _slug(skill),
            "label": _display(skill, labels),
            "status": "current",
            "sector": sector_for(skill),
            "demand": demand[skill],
            "opportunity_count": role_count,
            "reason": f"Part of your profile and used by {role_count} open role{'s' if role_count != 1 else ''}.",
        })
    for skill in ranked_frontier:
        source_labels = sorted(candidate_reasons[skill])[:2]
        bridge = " and ".join(source_labels) if source_labels else "your current skills"
        role_count = demand[skill]
        nodes.append({
            "id": _slug(skill),
            "label": _display(skill, labels),
            "status": "frontier",
            "sector": sector_for(skill),
            "demand": demand[skill],
            "opportunity_count": role_count,
            "reason": f"Builds on {bridge} and strengthens {role_count} open role{'s' if role_count != 1 else ''}.",
        })

    edge_map: dict[tuple[str, str], str] = {}
    for source, target in _pairs(graph_skills):
        pair = (source, target)
        taxonomy_linked = (
            target in SKILL_TAXONOMY.get(source, ("", []))[1]
            or source in SKILL_TAXONOMY.get(target, ("", []))[1]
        )
        if co_occurrence[pair]:
            edge_map[pair] = "used_together"
        elif taxonomy_linked:
            edge_map[pair] = "related"

    edges = [
        {"source": _slug(source), "target": _slug(target), "relationship": relationship}
        for (source, target), relationship in edge_map.items()
    ]

    opportunity_results = []
    sector_roles: dict[str, list[dict]] = defaultdict(list)
    for opportunity in opportunities:
        all_skills = opportunity_skills[str(opportunity.id)]
        required = {_normalize(skill) for skill in opportunity.required_skills or [] if skill.strip()}
        preferred = all_skills - required
        matched = all_skills & current
        missing = all_skills - current
        required_fit = len(required & current) / len(required) if required else 1
        preferred_fit = len(preferred & current) / len(preferred) if preferred else 1
        fit_score = round((required_fit * 0.75 + preferred_fit * 0.25) * 100)
        sector = opportunity.business.organisation_type if opportunity.business else "Other"
        item = {
            "id": opportunity.id,
            "title": opportunity.title,
            "business_name": opportunity.business.name if opportunity.business else None,
            "sector": sector,
            "workplace_type": opportunity.workplace_type,
            "location_name": opportunity.location_name,
            "fit_score": fit_score,
            "matched_skills": sorted((_display(skill, labels) for skill in matched)),
            "missing_skills": sorted((_display(skill, labels) for skill in missing)),
        }
        opportunity_results.append(item)
        sector_roles[sector].append(item)

    opportunity_results.sort(key=lambda item: (-item["fit_score"], item["title"]))
    sectors = []
    for sector, roles in sector_roles.items():
        sector_skill_set = set().union(*(opportunity_skills[str(role["id"])] for role in roles))
        matching = sector_skill_set & current
        sector_frontier = sector_skill_set & frontier
        sectors.append({
            "name": sector,
            "fit_score": round(sum(role["fit_score"] for role in roles) / len(roles)),
            "matching_skills": sorted(_display(skill, labels) for skill in matching),
            "frontier_skills": sorted(_display(skill, labels) for skill in sector_frontier),
            "opportunity_count": len(roles),
        })
    sectors.sort(key=lambda item: (-item["fit_score"], item["name"]))

    return {
        "nodes": nodes,
        "edges": edges,
        "sectors": sectors,
        "opportunities": opportunity_results,
        "stats": {
            "current_skills": len(current),
            "frontier_skills": len(frontier),
            "sectors_in_reach": len(sectors),
            "roles_in_reach": len(opportunities),
        },
    }

