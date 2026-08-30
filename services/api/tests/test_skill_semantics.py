from app.models.skill import Skill, SkillAlias, SkillCategory, SkillRelationship
from app.services.skill_semantics_service import (
    InferredRelationship,
    SkillCatalogueService,
    SkillInference,
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
    assert javascript.embedding_model == "fake-embedding-model"
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
