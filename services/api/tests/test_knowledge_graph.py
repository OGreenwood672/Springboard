from app.models.opportunity import Opportunity
from app.models.skill import Skill, SkillCategory
from app.models.user import User
from app.models.youth_profile import YouthProfile
from app.services.knowledge_graph_service import build_knowledge_graph


def get_token_for(client, email, password):
    response = client.post("/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return response.json()["access_token"]


def test_knowledge_graph_uses_profile_and_published_opportunities(client):
    token = get_token_for(client, "youth@example.com", "Password123!")
    response = client.get(
        "/profiles/me/knowledge-graph",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    current_labels = {
        node["label"]
        for node in data["nodes"]
        if node["status"] == "current" and node["kind"] == "skill"
    }
    frontier_labels = {node["label"] for node in data["nodes"] if node["status"] == "frontier"}
    interest_labels = {node["label"] for node in data["nodes"] if node["kind"] == "interest"}

    assert "Python" in current_labels
    assert "HTML/CSS" in frontier_labels
    assert {"Technology", "Retail", "Community"} <= interest_labels
    assert data["edges"]
    assert data["sectors"]
    assert data["opportunities"]
    assert data["stats"]["current_skills"] == len(current_labels)
    assert data["stats"]["current_interests"] == len(interest_labels)


def test_knowledge_graph_never_exposes_unpublished_roles(db_session):
    user = db_session.query(User).filter(User.email == "youth@example.com").first()
    profile = db_session.query(YouthProfile).filter(YouthProfile.user_id == user.id).first()
    graph = build_knowledge_graph(db_session, profile)
    published_ids = {
        str(opportunity.id)
        for opportunity in db_session.query(Opportunity).filter(Opportunity.status == "published").all()
    }

    assert {str(opportunity["id"]) for opportunity in graph["opportunities"]} == published_ids


def test_knowledge_graph_keeps_unconnected_interests_as_standalone_nodes(db_session):
    user = db_session.query(User).filter(User.email == "youth@example.com").first()
    profile = db_session.query(YouthProfile).filter(YouthProfile.user_id == user.id).first()
    original_interests = list(profile.interests or [])

    try:
        profile.interests = ["Niche Standalone Interest"]
        graph = build_knowledge_graph(db_session, profile)
        interest = next(
            node
            for node in graph["nodes"]
            if node["kind"] == "interest" and node["label"] == "Niche Standalone Interest"
        )

        assert all(
            interest["id"] not in (edge["source"], edge["target"])
            for edge in graph["edges"]
        )
    finally:
        profile.interests = original_interests
        db_session.commit()


def test_knowledge_graph_links_interests_with_semantically_similar_categories(
    db_session,
    monkeypatch,
):
    monkeypatch.setattr(
        "app.services.knowledge_graph_service.settings.SEMANTIC_CATEGORY_THRESHOLD",
        0.9,
    )
    user = db_session.query(User).filter(User.email == "youth@example.com").first()
    profile = db_session.query(YouthProfile).filter(YouthProfile.user_id == user.id).first()
    original_interests = list(profile.interests or [])
    creative = SkillCategory(
        name="Creative & Performing Arts Test",
        embedding=[1.0, 0.0],
        embedding_model="test-embedding-model",
    )
    performing = SkillCategory(
        name="Performing Arts Test",
        embedding=[0.98, 0.2],
        embedding_model="test-embedding-model",
    )
    technology = SkillCategory(
        name="Unrelated Technology Category Test",
        embedding=[0.9, 0.435],
        embedding_model="test-embedding-model",
    )
    db_session.add_all([creative, performing, technology])
    db_session.flush()
    db_session.add_all([
        Skill(
            canonical_name="Drama Category Similarity Test",
            normalized_name="drama category similarity test",
            description="A dramatic performance interest.",
            category_id=creative.id,
            embedding=[1.0, 0.0],
            embedding_model="test-embedding-model",
        ),
        Skill(
            canonical_name="Technology Category Similarity Test",
            normalized_name="technology category similarity test",
            description="A technology interest.",
            category_id=technology.id,
            embedding=[0.0, -1.0],
            embedding_model="test-embedding-model",
        ),
        Skill(
            canonical_name="Piano Category Similarity Test",
            normalized_name="piano category similarity test",
            description="A musical performance interest.",
            category_id=performing.id,
            embedding=[0.0, 1.0],
            embedding_model="test-embedding-model",
        ),
    ])
    profile.interests = [
        "Drama Category Similarity Test",
        "Piano Category Similarity Test",
        "Technology Category Similarity Test",
    ]
    db_session.commit()

    try:
        graph = build_knowledge_graph(db_session, profile)
        assert {
            edge["relationship"]
            for edge in graph["edges"]
            if {
                edge["source"],
                edge["target"],
            } == {
                "interest-drama-category-similarity-test",
                "interest-piano-category-similarity-test",
            }
        } == {"interest_alignment"}
        assert not any(
            {
                edge["source"],
                edge["target"],
            } == {
                "interest-drama-category-similarity-test",
                "interest-technology-category-similarity-test",
            }
            for edge in graph["edges"]
        )
    finally:
        profile.interests = original_interests
        db_session.commit()


def test_business_cannot_access_knowledge_graph(client):
    token = get_token_for(client, "business@example.com", "Password123!")
    response = client.get(
        "/profiles/me/knowledge-graph",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
