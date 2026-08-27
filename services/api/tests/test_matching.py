from app.services.matching_service import calculate_match_score
from app.models import YouthProfile, Opportunity


def test_match_score_calculation():
    youth = YouthProfile(
        full_name="Test Youth",
        postcode="HP5",
        latitude=51.7058,
        longitude=-0.6128,
        max_travel_km=15,
        skills=["Python", "Customer Service", "Teamwork"],
        interests=["Technology"],
        availability={"days": ["Saturday", "Sunday"], "hours_per_week": 8},
        preferred_opportunity_types=["part_time_job"],
    )

    opportunity = Opportunity(
        title="Weekend Tech Assistant",
        opportunity_type="part_time_job",
        required_skills=["Python", "Customer Service"],
        preferred_skills=["Communication"],
        postcode="HP5",
        latitude=51.7058,
        longitude=-0.6128,
        workplace_type="in_person",
        status="published",
    )

    score, factors = calculate_match_score(youth, opportunity)
    assert score >= 80.0
    assert factors["type_score"] == 25.0
    assert factors["skills_score"] >= 25.0
    assert factors["location_score"] == 25.0
    assert factors["availability_score"] >= 8.0


def test_matching_endpoint(client):
    res_login = client.post("/auth/login", json={"email": "youth@example.com", "password": "Password123!"})
    token = res_login.json()["access_token"]

    # Generate matches
    res_me = client.get("/profiles/me", headers={"Authorization": f"Bearer {token}"})
    profile_id = res_me.json()["id"]

    res_gen = client.post(f"/matches/generate/{profile_id}", headers={"Authorization": f"Bearer {token}"})
    assert res_gen.status_code == 200
    assert "matches" in res_gen.json()

    # Get my matches
    res_matches = client.get("/matches/me", headers={"Authorization": f"Bearer {token}"})
    assert res_matches.status_code == 200
    assert len(res_matches.json()) > 0
