from app.models.skill import Skill, SkillAlias, SkillCategory, SkillRelationship
from app.services.skill_semantics_service import (
    ExpansionSuggestion,
    InferredRelationship,
    SkillCatalogueService,
    SkillInference,
    semantic_relationships_by_name,
)


class FakeSemanticProvider:
    model_name = "fake-semantic-model"
    embedding_model = "fake-embedding-model"

    def infer_skills(self, skill_names, catalogue_names, sector_hints):
        results = []
        for name in skill_names:
            if name == "JS Graph Test":
                results.append(SkillInference(
                    input_name=name,
                    canonical_name="JavaScript Graph Test",
                    description="Programming interactive behaviour for web applications.",
                    category="Software Development Test",
                    aliases=["Java Script Graph Test"],
                    relationships=[InferredRelationship(
                        target="Python",
                        relationship_type="related_to",
                        confidence=0.82,
                        reason="Both are general-purpose programming skills.",
                    )],
                ))
            else:
                results.append(SkillInference(
                    input_name=name,
                    canonical_name=name,
                    description=f"Description for {name}.",
                    category="General Skills Test",
                ))
        return results

    def embed(self, texts):
        return [[1.0, float(index + 1), 0.5] for index, _ in enumerate(texts)]

    def expand_concept(
        self,
        concept_name,
        concept_description,
        concept_kind,
        catalogue_names,
        limit,
    ):
        return [ExpansionSuggestion(
            canonical_name="Async JavaScript Expansion Test",
            description="Using asynchronous control flow in JavaScript applications.",
            category="Software Development Test",
            confidence=0.88,
            reason=f"A more specific next step from {concept_name}.",
        )]


def test_semantic_catalogue_persists_inference_and_resolves_aliases(db_session, monkeypatch):
    monkeypatch.setattr(
        "app.services.skill_semantics_service.settings.SEMANTIC_RELATIONSHIP_THRESHOLD",
        1.1,
    )
    service = SkillCatalogueService(db_session, provider=FakeSemanticProvider())

    resolved = service.resolve_many(["JS Graph Test", "Python"])
    javascript = resolved["js graph test"]
    python = resolved["python"]

    assert javascript.canonical_name == "JavaScript Graph Test"
    assert javascript.embedding_model == "fake-embedding-model:skill-description-v2"
    category = db_session.query(SkillCategory).filter(
        SkillCategory.id == javascript.category_id,
        SkillCategory.name == "Software Development Test",
    ).one()
    assert category.embedding
    assert category.embedding_model == "fake-embedding-model:category-label-v2"
    assert db_session.query(SkillAlias).filter(
        SkillAlias.skill_id == javascript.id,
        SkillAlias.normalized_alias == "java script graph test",
    ).one()
    relationship = db_session.query(SkillRelationship).filter(
        SkillRelationship.source_skill_id == javascript.id,
        SkillRelationship.target_skill_id == python.id,
        SkillRelationship.provenance == "model",
    ).one()
    assert relationship.relationship_type == "related_to"
    assert relationship.confidence == 0.82

    alias_resolution = service.resolve_many(["Java Script Graph Test"])
    assert alias_resolution["java script graph test"].id == javascript.id


def test_semantic_catalogue_reclassifies_stale_sector_based_categories(db_session):
    old_category = SkillCategory(name="Legacy Employer Sector Test")
    db_session.add(old_category)
    db_session.flush()
    skill = Skill(
        canonical_name="Broad Communication Test",
        normalized_name="broad communication test",
        description="A cross-sector communication skill.",
        category_id=old_category.id,
        provenance="model",
        model_version="fake-semantic-model",
    )
    db_session.add(skill)
    db_session.commit()

    resolved = SkillCatalogueService(
        db_session,
        provider=FakeSemanticProvider(),
    ).resolve_many(
        ["Broad Communication Test"],
        {"Broad Communication Test": ["Charity & Community"]},
    )

    refreshed = resolved["broad communication test"]
    category = db_session.query(SkillCategory).filter(
        SkillCategory.id == refreshed.category_id
    ).one()
    assert category.name == "General Skills Test"
    assert refreshed.model_version == "fake-semantic-model:intrinsic-taxonomy-v2"


def test_embedding_only_edges_require_context_but_model_evidence_is_retained(
    db_session,
    monkeypatch,
):
    monkeypatch.setattr(
        "app.services.skill_semantics_service.settings.SEMANTIC_EMBEDDING_NEIGHBOURS",
        1,
    )
    first_category = SkillCategory(name="Embedding Filter Category A Test")
    second_category = SkillCategory(name="Embedding Filter Category B Test")
    db_session.add_all([first_category, second_category])
    db_session.flush()
    source = Skill(
        canonical_name="Embedding Filter Source Test",
        normalized_name="embedding filter source test",
        category_id=first_category.id,
        embedding=[1.0, 0.0],
        embedding_model="test",
    )
    target = Skill(
        canonical_name="Embedding Filter Target Test",
        normalized_name="embedding filter target test",
        category_id=second_category.id,
        embedding=[0.82, 0.572],
        embedding_model="test",
    )
    source_neighbour = Skill(
        canonical_name="Embedding Filter Source Neighbour Test",
        normalized_name="embedding filter source neighbour test",
        category_id=first_category.id,
        embedding=[0.995, 0.1],
        embedding_model="test",
    )
    target_neighbour = Skill(
        canonical_name="Embedding Filter Target Neighbour Test",
        normalized_name="embedding filter target neighbour test",
        category_id=second_category.id,
        embedding=[0.72, 0.694],
        embedding_model="test",
    )
    related_source = Skill(
        canonical_name="Embedding Filter Related Source Test",
        normalized_name="embedding filter related source test",
        category_id=first_category.id,
        embedding=[0.0, -1.0],
        embedding_model="test",
    )
    related_target = Skill(
        canonical_name="Embedding Filter Related Target Test",
        normalized_name="embedding filter related target test",
        category_id=second_category.id,
        embedding=[0.1, -0.995],
        embedding_model="test",
    )
    db_session.add_all([
        source,
        target,
        source_neighbour,
        target_neighbour,
        related_source,
        related_target,
    ])
    db_session.flush()
    embedding_relationship = SkillRelationship(
        source_skill_id=source.id,
        target_skill_id=target.id,
        relationship_type="related_to",
        weight=0.82,
        confidence=0.82,
        provenance="embedding",
    )
    db_session.add(embedding_relationship)
    db_session.add(SkillRelationship(
        source_skill_id=related_source.id,
        target_skill_id=related_target.id,
        relationship_type="related_to",
        weight=0.995,
        confidence=0.995,
        provenance="embedding",
    ))
    db_session.commit()

    pair = (source.normalized_name, target.normalized_name)
    qualified = semantic_relationships_by_name(db_session)
    assert pair not in qualified
    assert (
        related_source.normalized_name,
        related_target.normalized_name,
    ) in qualified

    db_session.add(SkillRelationship(
        source_skill_id=source.id,
        target_skill_id=target.id,
        relationship_type="related_to",
        weight=0.65,
        confidence=0.65,
        provenance="model",
        evidence="Explicit model corroboration.",
    ))
    db_session.commit()

    assert semantic_relationships_by_name(db_session)[pair].provenance == "model"


def test_semantic_catalogue_persists_specific_frontier_expansions(db_session):
    service = SkillCatalogueService(db_session, provider=FakeSemanticProvider())
    source = service.resolve_many(["JavaScript Expansion Source Test"])[
        "javascript expansion source test"
    ]

    expanded = service.expand_skill(source, "skill")

    assert [skill.canonical_name for skill, _suggestion in expanded] == [
        "Async JavaScript Expansion Test"
    ]
    target = expanded[0][0]
    relationship = db_session.query(SkillRelationship).filter(
        SkillRelationship.source_skill_id == source.id,
        SkillRelationship.target_skill_id == target.id,
        SkillRelationship.relationship_type == "builds_on",
        SkillRelationship.provenance == "model",
    ).one()
    assert relationship.confidence == 0.88
