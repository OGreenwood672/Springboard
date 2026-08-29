from app.models.opportunity import Opportunity
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
    current_labels = {node["label"] for node in data["nodes"] if node["status"] == "current"}
    frontier_labels = {node["label"] for node in data["nodes"] if node["status"] == "frontier"}

    assert "Python" in current_labels
    assert "HTML/CSS" in frontier_labels
    assert data["edges"]
    assert data["sectors"]
    assert data["opportunities"]
    assert data["stats"]["current_skills"] == len(current_labels)


def test_knowledge_graph_never_exposes_unpublished_roles(db_session):
    user = db_session.query(User).filter(User.email == "youth@example.com").first()
    profile = db_session.query(YouthProfile).filter(YouthProfile.user_id == user.id).first()
    graph = build_knowledge_graph(db_session, profile)
    published_ids = {
        str(opportunity.id)
        for opportunity in db_session.query(Opportunity).filter(Opportunity.status == "published").all()
    }

    assert {str(opportunity["id"]) for opportunity in graph["opportunities"]} == published_ids


def test_business_cannot_access_knowledge_graph(client):
    token = get_token_for(client, "business@example.com", "Password123!")
    response = client.get(
        "/profiles/me/knowledge-graph",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403

