import logging
import math
import re
from typing import Literal, Protocol

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.config import settings
from app.models.skill import Skill, SkillAlias, SkillCategory, SkillRelationship


logger = logging.getLogger("uvicorn.error")
SKILL_TAXONOMY_VERSION = "intrinsic-taxonomy-v2"

RelationshipType = Literal[
    "related_to",
    "builds_on",
    "prerequisite_for",
    "commonly_used_with",
    "transferable_to",
    "specialisation_of",
]


def normalize_skill(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


class InferredRelationship(BaseModel):
    target: str
    relationship_type: RelationshipType
    confidence: float = Field(ge=0, le=1)
    reason: str


class SkillInference(BaseModel):
    input_name: str
    canonical_name: str
    description: str
    category: str
    aliases: list[str] = Field(default_factory=list)
    relationships: list[InferredRelationship] = Field(default_factory=list)


class SemanticProvider(Protocol):
    model_name: str
    embedding_model: str

    def infer_skills(
        self,
        skill_names: list[str],
        catalogue_names: list[str],
        sector_hints: dict[str, list[str]],
    ) -> list[SkillInference]: ...

    def embed(self, texts: list[str]) -> list[list[float]]: ...


class GeminiSemanticProvider:
    def __init__(self) -> None:
        from google import genai

        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = settings.GEMINI_MODEL
        self.embedding_model = settings.GEMINI_EMBEDDING_MODEL
        self.classification_version = f"{self.model_name}:{SKILL_TAXONOMY_VERSION}"

    def infer_skills(
        self,
        skill_names: list[str],
        catalogue_names: list[str],
        sector_hints: dict[str, list[str]],
    ) -> list[SkillInference]:
        from google.genai import types

        prompt = f"""
You maintain a canonical skills catalogue for a UK youth employment platform.
Classify every input skill. Consolidate exact synonyms and abbreviations, but never
merge merely related skills. Categories must describe the skill's broad, intrinsic
capability type and remain valid across industries. For example, communication and
teamwork are transferable skills rather than charity, retail, or technology skills.
Use concise, reusable categories consistently across this batch. Never use an
employer sector or organisation type as a skill category.
Relationships may target only names in the supplied catalogue/input list. Add only
relationships you can justify, and use confidence conservatively.

Input skills: {skill_names}
Available catalogue and relationship targets: {catalogue_names}
Observed organisation sectors by input: {sector_hints}
Sector evidence describes where a skill is currently in demand. It may inform
relationships, but it must not determine the intrinsic skill category.
""".strip()
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=list[SkillInference],
                temperature=0.0,
            ),
        )
        if response.parsed is not None:
            return [
                item if isinstance(item, SkillInference) else SkillInference.model_validate(item)
                for item in response.parsed
            ]
        return []

    def embed(self, texts: list[str]) -> list[list[float]]:
        from google.genai import types

        if not texts:
            return []
        response = self.client.models.embed_content(
            model=self.embedding_model,
            contents=texts,
            config=types.EmbedContentConfig(
                task_type="SEMANTIC_SIMILARITY",
                output_dimensionality=settings.SEMANTIC_EMBEDDING_DIMENSIONS,
            ),
        )
        return [_unit_vector(list(item.values)) for item in response.embeddings]


def get_semantic_provider() -> SemanticProvider | None:
    if not settings.SEMANTIC_SKILLS_ENABLED or not (settings.GEMINI_API_KEY or "").strip():
        return None
    try:
        return GeminiSemanticProvider()
    except Exception as exc:
        logger.warning("Semantic skill provider could not be initialized: %s", exc)
        return None


def _unit_vector(values: list[float]) -> list[float]:
    magnitude = math.sqrt(sum(value * value for value in values))
    return [value / magnitude for value in values] if magnitude else values


def cosine_similarity(left: list[float], right: list[float]) -> float:
    if not left or len(left) != len(right):
        return 0.0
    return sum(a * b for a, b in zip(_unit_vector(left), _unit_vector(right)))


def _title(value: str) -> str:
    return value.strip() if any(char.isupper() for char in value) else value.strip().title()


class SkillCatalogueService:
    def __init__(self, db: Session, provider: SemanticProvider | None = None):
        self.db = db
        self.provider = provider if provider is not None else get_semantic_provider()

    def _classification_version(self) -> str | None:
        if not self.provider:
            return None
        return getattr(
            self.provider,
            "classification_version",
            f"{self.provider.model_name}:{SKILL_TAXONOMY_VERSION}",
        )

    def resolve_many(
        self,
        raw_skills: list[str],
        sector_hints: dict[str, list[str]] | None = None,
    ) -> dict[str, Skill]:
        raw_by_normalized = {
            normalize_skill(raw): raw.strip()
            for raw in raw_skills
            if raw and normalize_skill(raw)
        }
        if not raw_by_normalized:
            return {}

        skills = self.db.query(Skill).all()
        aliases = self.db.query(SkillAlias).all()
        by_name = {skill.normalized_name: skill for skill in skills}
        by_id = {skill.id: skill for skill in skills}
        by_alias = {
            alias.normalized_alias: by_id[alias.skill_id]
            for alias in aliases
            if alias.skill_id in by_id
        }
        resolved = {
            normalized: by_name.get(normalized) or by_alias.get(normalized)
            for normalized in raw_by_normalized
        }
        self._resolve_embedding_aliases(raw_by_normalized, resolved, skills)
        unresolved = [raw_by_normalized[key] for key, value in resolved.items() if value is None]
        needs_enrichment = list(unresolved)
        seen_skill_ids = set()
        for normalized, skill in resolved.items():
            if skill is None or skill.id in seen_skill_ids:
                continue
            seen_skill_ids.add(skill.id)
            taxonomy_is_stale = (
                skill.provenance == "model"
                and skill.model_version != self._classification_version()
            )
            if not skill.description or skill.category_id is None or taxonomy_is_stale:
                needs_enrichment.append(raw_by_normalized[normalized])

        inference_by_input: dict[str, SkillInference] = {}
        if self.provider and needs_enrichment:
            try:
                inferred = self.provider.infer_skills(
                    needs_enrichment,
                    sorted({skill.canonical_name for skill in skills} | set(needs_enrichment)),
                    sector_hints or {},
                )
                inference_by_input = {normalize_skill(item.input_name): item for item in inferred}
            except Exception as exc:
                logger.warning("Semantic skill classification failed: %s", exc)

        pending_relationships: list[tuple[Skill, InferredRelationship]] = []
        for normalized, raw in raw_by_normalized.items():
            inference = inference_by_input.get(normalized)
            if resolved[normalized] is not None:
                if inference:
                    self._apply_inference(resolved[normalized], inference)
                    pending_relationships.extend(
                        (resolved[normalized], relation)
                        for relation in inference.relationships
                    )
                continue
            canonical_name = (inference.canonical_name.strip() if inference else raw) or raw
            canonical_normalized = normalize_skill(canonical_name)
            skill = by_name.get(canonical_normalized) or by_alias.get(canonical_normalized)
            if skill is None:
                skill = Skill(
                    canonical_name=_title(canonical_name),
                    normalized_name=canonical_normalized,
                    description=inference.description.strip() if inference else None,
                    provenance="model" if inference else "user_supplied",
                    model_version=self._classification_version() if inference else None,
                )
                self.db.add(skill)
                self.db.flush()
                by_name[canonical_normalized] = skill
                skills.append(skill)
            if inference:
                self._apply_inference(skill, inference)
                pending_relationships.extend((skill, relation) for relation in inference.relationships)
            self._add_alias(skill, raw, "model" if inference else "exact", 0.95 if inference else 1.0)
            resolved[normalized] = skill

        self.db.flush()
        self._add_inferred_relationships(pending_relationships)
        self._embed_missing(skills)
        self._embed_missing_categories()
        self._add_embedding_relationships(skills)
        self.db.commit()
        return resolved

    def _resolve_embedding_aliases(
        self,
        raw_by_normalized: dict[str, str],
        resolved: dict[str, Skill | None],
        skills: list[Skill],
    ) -> None:
        candidates = [skill for skill in skills if skill.embedding]
        unresolved_keys = [key for key, skill in resolved.items() if skill is None]
        if not self.provider or not candidates or not unresolved_keys:
            return
        try:
            vectors = self.provider.embed([
                f"Skill: {raw_by_normalized[key]}"
                for key in unresolved_keys
            ])
            if len(vectors) != len(unresolved_keys):
                return
            for normalized, vector in zip(unresolved_keys, vectors):
                best_skill, best_score = max(
                    (
                        (candidate, cosine_similarity(vector, candidate.embedding))
                        for candidate in candidates
                    ),
                    key=lambda item: item[1],
                )
                if best_score >= settings.SEMANTIC_ALIAS_THRESHOLD:
                    resolved[normalized] = best_skill
                    self._add_alias(
                        best_skill,
                        raw_by_normalized[normalized],
                        "embedding",
                        best_score,
                    )
        except Exception as exc:
            logger.warning("Embedding alias resolution failed: %s", exc)

    def _apply_inference(self, skill: Skill, inference: SkillInference) -> None:
        skill.description = inference.description.strip() or skill.description
        skill.provenance = "model"
        skill.model_version = self._classification_version()
        category_name = inference.category.strip()
        if category_name:
            category = self.db.query(SkillCategory).filter(SkillCategory.name == category_name).first()
            if category is None:
                category = SkillCategory(
                    name=category_name,
                    provenance="model",
                    model_version=self._classification_version(),
                )
                self.db.add(category)
                self.db.flush()
            skill.category_id = category.id
        for alias in inference.aliases:
            self._add_alias(skill, alias, "model", 0.9)

    def _add_alias(self, skill: Skill, alias: str, provenance: str, confidence: float) -> None:
        normalized = normalize_skill(alias)
        if not normalized or normalized == skill.normalized_name:
            return
        existing = self.db.query(SkillAlias).filter(SkillAlias.normalized_alias == normalized).first()
        if existing is None:
            self.db.add(SkillAlias(
                skill_id=skill.id,
                alias=alias.strip(),
                normalized_alias=normalized,
                confidence=confidence,
                provenance=provenance,
            ))

    def _add_inferred_relationships(
        self,
        relationships: list[tuple[Skill, InferredRelationship]],
    ) -> None:
        skills = self.db.query(Skill).all()
        aliases = self.db.query(SkillAlias).all()
        by_normalized = {skill.normalized_name: skill for skill in skills}
        by_id = {skill.id: skill for skill in skills}
        for alias in aliases:
            if alias.skill_id in by_id:
                by_normalized.setdefault(alias.normalized_alias, by_id[alias.skill_id])

        for source, relation in relationships:
            target = by_normalized.get(normalize_skill(relation.target))
            if target is None or target.id == source.id:
                continue
            existing = self.db.query(SkillRelationship).filter(
                SkillRelationship.source_skill_id == source.id,
                SkillRelationship.target_skill_id == target.id,
                SkillRelationship.relationship_type == relation.relationship_type,
                SkillRelationship.provenance == "model",
            ).first()
            if existing is None:
                self.db.add(SkillRelationship(
                    source_skill_id=source.id,
                    target_skill_id=target.id,
                    relationship_type=relation.relationship_type,
                    weight=relation.confidence,
                    confidence=relation.confidence,
                    provenance="model",
                    evidence=relation.reason,
                    model_version=self.provider.model_name if self.provider else None,
                ))

    def _embed_missing(self, skills: list[Skill]) -> None:
        missing = [skill for skill in skills if not skill.embedding]
        if not self.provider or not missing:
            return
        try:
            texts = [
                f"Skill: {skill.canonical_name}. {skill.description or ''}".strip()
                for skill in missing
            ]
            embeddings = self.provider.embed(texts)
            if len(embeddings) != len(missing):
                raise ValueError("Embedding provider returned an unexpected number of vectors")
            for skill, embedding in zip(missing, embeddings):
                skill.embedding = embedding
                skill.embedding_model = self.provider.embedding_model
        except Exception as exc:
            logger.warning("Semantic skill embedding failed: %s", exc)

    def _embed_missing_categories(self) -> None:
        if not self.provider:
            return
        embedding_version = f"{self.provider.embedding_model}:category-label-v2"
        used_category_ids = {
            category_id
            for (category_id,) in self.db.query(Skill.category_id).distinct().all()
            if category_id is not None
        }
        categories = self.db.query(SkillCategory).filter(
            SkillCategory.id.in_(used_category_ids),
            (
                (SkillCategory.embedding.is_(None))
                | (SkillCategory.embedding_model.is_(None))
                | (SkillCategory.embedding_model != embedding_version)
            ),
        ).all()
        if not categories:
            return
        try:
            embeddings = self.provider.embed([category.name for category in categories])
            if len(embeddings) != len(categories):
                return
            for category, embedding in zip(categories, embeddings):
                category.embedding = embedding
                category.embedding_model = embedding_version
        except Exception as exc:
            logger.warning("Semantic category embedding failed: %s", exc)

    def _add_embedding_relationships(self, skills: list[Skill]) -> None:
        embedded = [skill for skill in skills if skill.embedding]
        existing_pairs = {
            (relationship.source_skill_id, relationship.target_skill_id)
            for relationship in self.db.query(SkillRelationship)
            .filter(SkillRelationship.provenance == "embedding")
            .all()
        }
        for index, source in enumerate(embedded):
            for target in embedded[index + 1:]:
                similarity = cosine_similarity(source.embedding, target.embedding)
                if similarity < settings.SEMANTIC_RELATIONSHIP_THRESHOLD:
                    continue
                first, second = sorted((source, target), key=lambda skill: str(skill.id))
                pair = (first.id, second.id)
                if pair in existing_pairs:
                    continue
                self.db.add(SkillRelationship(
                    source_skill_id=first.id,
                    target_skill_id=second.id,
                    relationship_type="related_to",
                    weight=similarity,
                    confidence=similarity,
                    provenance="embedding",
                    evidence="Cosine similarity between stored semantic embeddings.",
                    model_version=source.embedding_model,
                ))
                existing_pairs.add(pair)


def semantic_relationships_by_name(db: Session) -> dict[tuple[str, str], SkillRelationship]:
    skills = {skill.id: skill for skill in db.query(Skill).all()}
    result: dict[tuple[str, str], SkillRelationship] = {}
    for relationship in db.query(SkillRelationship).all():
        source = skills.get(relationship.source_skill_id)
        target = skills.get(relationship.target_skill_id)
        if source is None or target is None:
            continue
        pair = tuple(sorted((source.normalized_name, target.normalized_name)))
        current = result.get(pair)
        if current is None or relationship.confidence > current.confidence:
            result[pair] = relationship
    return result


def semantic_relationship_evidence_by_name(
    db: Session,
) -> dict[tuple[str, str], list[SkillRelationship]]:
    skills = {skill.id: skill for skill in db.query(Skill).all()}
    result: dict[tuple[str, str], list[SkillRelationship]] = {}
    for relationship in db.query(SkillRelationship).all():
        source = skills.get(relationship.source_skill_id)
        target = skills.get(relationship.target_skill_id)
        if source is None or target is None:
            continue
        pair = tuple(sorted((source.normalized_name, target.normalized_name)))
        result.setdefault(pair, []).append(relationship)
    return result


def category_names_by_skill(db: Session) -> dict[str, str]:
    categories = {category.id: category.name for category in db.query(SkillCategory).all()}
    return {
        skill.normalized_name: categories[skill.category_id]
        for skill in db.query(Skill).all()
        if skill.category_id in categories
    }


def category_embeddings_by_skill(db: Session) -> dict[str, list[float]]:
    categories = {
        category.id: category.embedding
        for category in db.query(SkillCategory).all()
        if category.embedding
    }
    return {
        skill.normalized_name: categories[skill.category_id]
        for skill in db.query(Skill).all()
        if skill.category_id in categories
    }


def category_embeddings_by_name(db: Session) -> dict[str, list[float]]:
    used_category_ids = {
        category_id
        for (category_id,) in db.query(Skill.category_id).distinct().all()
        if category_id is not None
    }
    return {
        category.name: category.embedding
        for category in db.query(SkillCategory).all()
        if category.id in used_category_ids and category.embedding
    }
