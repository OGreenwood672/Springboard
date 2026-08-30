import re
from collections import Counter, defaultdict
from typing import Iterable

from sqlalchemy.orm import Session

from app.config import settings
from app.models.opportunity import Opportunity
from app.models.skill import Skill
from app.models.youth_profile import YouthProfile
from app.services.skill_semantics_service import (
    SkillCatalogueService,
    category_equivalence_pairs,
    category_names_by_skill,
    normalize_skill,
    semantic_relationship_evidence_by_name,
    semantic_relationships_by_name,
)


def _slug(skill: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", normalize_skill(skill)).strip("-")


def _node_id(concept: str, kind: str = "skill") -> str:
    slug = _slug(concept)
    return f"interest-{slug}" if kind == "interest" else slug


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
    raw_skills = list(profile.skills or [])
    raw_interests = list(profile.interests or [])
    sector_hints: dict[str, list[str]] = defaultdict(list)
    for opportunity in opportunities:
        sector = opportunity.business.organisation_type if opportunity.business else "Other"
        for raw_skill in (opportunity.required_skills or []) + (opportunity.preferred_skills or []):
            raw_skills.append(raw_skill)
            sector_hints[raw_skill].append(sector)

    resolved = SkillCatalogueService(db).resolve_many(
        raw_skills + raw_interests,
        dict(sector_hints),
    )

    def canonical(raw_skill: str) -> str:
        normalized = normalize_skill(raw_skill)
        skill = resolved.get(normalized)
        return skill.normalized_name if skill else normalized

    catalogue = db.query(Skill).all()
    labels = {skill.normalized_name: skill.canonical_name for skill in catalogue}
    current = {canonical(raw_skill) for raw_skill in profile.skills or [] if raw_skill.strip()}
    interests = {
        canonical(raw_interest)
        for raw_interest in profile.interests or []
        if raw_interest.strip()
    }

    demand = Counter()
    required_demand = Counter()
    co_occurrence = Counter()
    skill_sectors: dict[str, Counter] = defaultdict(Counter)
    opportunity_skills: dict[str, set[str]] = {}

    for opportunity in opportunities:
        sector = opportunity.business.organisation_type if opportunity.business else "Other"
        required = {canonical(skill) for skill in opportunity.required_skills or [] if skill.strip()}
        preferred = {canonical(skill) for skill in opportunity.preferred_skills or [] if skill.strip()}
        all_skills = required | preferred
        opportunity_skills[str(opportunity.id)] = all_skills

        for raw_skill in (opportunity.required_skills or []) + (opportunity.preferred_skills or []):
            labels.setdefault(canonical(raw_skill), raw_skill.strip())
        for skill in all_skills:
            demand[skill] += 1
            skill_sectors[skill][sector] += 1
        for skill in required:
            required_demand[skill] += 1
        for pair in _pairs(all_skills):
            co_occurrence[pair] += 1

    candidate_connections = Counter()
    candidate_reasons: dict[str, set[str]] = defaultdict(set)
    semantic_relationships = semantic_relationships_by_name(db)
    relationship_evidence = semantic_relationship_evidence_by_name(db)
    semantic_categories = category_names_by_skill(db)
    equivalent_categories = category_equivalence_pairs(db)

    def category_equivalence_score(source: str, target: str) -> float:
        source_category = semantic_categories.get(source)
        target_category = semantic_categories.get(target)
        if not source_category or not target_category:
            return 0
        if source_category == target_category:
            return 0.8
        if tuple(sorted((source_category, target_category))) in equivalent_categories:
            return settings.SEMANTIC_CATEGORY_THRESHOLD
        return 0

    def interest_connection_score(source: str, target: str) -> float:
        pair = tuple(sorted((source, target)))
        evidence = relationship_evidence.get(pair, [])
        explicit = max(
            (relationship.confidence for relationship in evidence if relationship.provenance == "model"),
            default=0,
        )
        qualified = semantic_relationships.get(pair)
        embedding = (
            qualified.confidence
            if qualified is not None and qualified.provenance == "embedding"
            else 0
        )
        return max(
            explicit + 0.15
            if explicit >= settings.SEMANTIC_MODEL_RELATIONSHIP_THRESHOLD
            else 0,
            embedding,
            category_equivalence_score(source, target),
        )

    for (source, target), relationship in semantic_relationships.items():
        source_owned = source in current or (
            source in interests and interest_connection_score(source, target) > 0
        )
        target_owned = target in current or (
            target in interests and interest_connection_score(target, source) > 0
        )
        if source_owned and target not in current and target not in interests and demand[target]:
            candidate_connections[target] += max(relationship.weight, 0.25)
            candidate_reasons[target].add(_display(source, labels))
        elif target_owned and source not in current and source not in interests and demand[source]:
            candidate_connections[source] += max(relationship.weight, 0.25)
            candidate_reasons[source].add(_display(target, labels))

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

    def category_for(skill: str) -> str:
        if skill in semantic_categories:
            return semantic_categories[skill]
        return "Uncategorised"

    def sectors_for(skill: str) -> list[str]:
        return sorted(skill_sectors[skill])

    nodes = []
    for skill in sorted(current, key=lambda value: _display(value, labels)):
        role_count = demand[skill]
        nodes.append({
            "id": _node_id(skill),
            "label": _display(skill, labels),
            "kind": "skill",
            "status": "current",
            "category": category_for(skill),
            "sectors": sectors_for(skill),
            "demand": demand[skill],
            "opportunity_count": role_count,
            "reason": f"Part of your profile and used by {role_count} open role{'s' if role_count != 1 else ''}.",
        })
    for skill in ranked_frontier:
        source_labels = sorted(candidate_reasons[skill])[:2]
        bridge = " and ".join(source_labels) if source_labels else "your current skills"
        role_count = demand[skill]
        nodes.append({
            "id": _node_id(skill),
            "label": _display(skill, labels),
            "kind": "skill",
            "status": "frontier",
            "category": category_for(skill),
            "sectors": sectors_for(skill),
            "demand": demand[skill],
            "opportunity_count": role_count,
            "reason": f"Builds on {bridge} and strengthens {role_count} open role{'s' if role_count != 1 else ''}.",
        })
    for interest in sorted(interests, key=lambda value: _display(value, labels)):
        nodes.append({
            "id": _node_id(interest, "interest"),
            "label": _display(interest, labels),
            "kind": "interest",
            "status": "current",
            "category": category_for(interest),
            "sectors": sectors_for(interest),
            "demand": 0,
            "opportunity_count": 0,
            "reason": "An interest on your profile. Related skills and roles are connected when semantic evidence is available.",
        })

    edge_map: dict[tuple[str, str], str] = {}
    for source, target in _pairs(graph_skills):
        pair = (source, target)
        if co_occurrence[pair]:
            edge_map[pair] = "used_together"
        elif pair in semantic_relationships:
            edge_map[pair] = "related"

    edges = [
        {"source": _node_id(source), "target": _node_id(target), "relationship": relationship}
        for (source, target), relationship in edge_map.items()
    ]

    for interest in interests:
        connected_skills = sorted(
            (
                (skill, interest_connection_score(interest, skill))
                for skill in graph_skills
                if interest_connection_score(interest, skill) > 0
            ),
            key=lambda item: (-item[1], -demand[item[0]], _display(item[0], labels)),
        )[:4]
        for skill, _score in connected_skills:
            edges.append({
                "source": _node_id(interest, "interest"),
                "target": _node_id(skill),
                "relationship": "interest_alignment",
            })
    for source, target in _pairs(interests):
        if interest_connection_score(source, target) > 0:
            edges.append({
                "source": _node_id(source, "interest"),
                "target": _node_id(target, "interest"),
                "relationship": "interest_alignment",
            })

    opportunity_results = []
    sector_roles: dict[str, list[dict]] = defaultdict(list)
    for opportunity in opportunities:
        all_skills = opportunity_skills[str(opportunity.id)]
        required = {canonical(skill) for skill in opportunity.required_skills or [] if skill.strip()}
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
            "current_interests": len(interests),
            "frontier_skills": len(frontier),
            "sectors_in_reach": len(sectors),
            "roles_in_reach": len(opportunities),
        },
    }


def expand_knowledge_frontier(
    db: Session,
    profile: YouthProfile,
    source_node_id: str,
    source_label: str,
    source_kind: str,
    limit: int = 5,
) -> dict:
    graph = build_knowledge_graph(db, profile)
    source_node = next(
        (node for node in graph["nodes"] if node["id"] == source_node_id),
        None,
    )
    service = SkillCatalogueService(db)
    source = (
        db.query(Skill)
        .filter(Skill.normalized_name == normalize_skill(source_label))
        .first()
    )
    if (
        source is None
        or _node_id(source.normalized_name, "interest" if source_kind == "interest" else "skill")
        != source_node_id
    ):
        raise ValueError("The selected concept could not be resolved.")
    if source_node is None:
        source_node = {
            "id": source_node_id,
            "label": source.canonical_name,
            "kind": source_kind,
        }

    suggestions = service.expand_skill(source, source_kind, limit=limit)
    existing_node_ids = {node["id"] for node in graph["nodes"]}
    semantic_categories = category_names_by_skill(db)
    opportunities = (
        db.query(Opportunity)
        .filter(Opportunity.status == "published")
        .all()
    )
    nodes = []
    edges = []
    for skill, suggestion in suggestions:
        node_id = _node_id(skill.normalized_name)
        if node_id in existing_node_ids:
            continue
        matching_opportunities = [
            opportunity
            for opportunity in opportunities
            if skill.normalized_name
            in {
                normalize_skill(raw_skill)
                for raw_skill in (
                    (opportunity.required_skills or [])
                    + (opportunity.preferred_skills or [])
                )
            }
        ]
        sectors = sorted({
            opportunity.business.organisation_type
            if opportunity.business
            else "Other"
            for opportunity in matching_opportunities
        })
        nodes.append({
            "id": node_id,
            "label": skill.canonical_name,
            "kind": "skill",
            "status": "frontier",
            "category": semantic_categories.get(
                skill.normalized_name,
                "Uncategorised",
            ),
            "sectors": sectors,
            "demand": len(matching_opportunities),
            "opportunity_count": len(matching_opportunities),
            "reason": suggestion.reason,
        })
        edges.append({
            "source": source_node_id,
            "target": node_id,
            "relationship": (
                "interest_alignment" if source_kind == "interest" else "related"
            ),
        })
        existing_node_ids.add(node_id)
    return {"nodes": nodes, "edges": edges}
