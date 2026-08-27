import pytest


def get_token_for(client, email, password):
    res = client.post("/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200
    return res.json()["access_token"]


def test_youth_profile_read_and_update(client):
    token = get_token_for(client, "youth@example.com", "Password123!")
    headers = {"Authorization": f"Bearer {token}"}

    # Get Profile
    res = client.get("/profiles/me", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["full_name"] == "Alex Taylor"
    assert "Python" in data["skills"]
    assert len(data["qualifications"]) >= 3

    # Update Profile
    update_res = client.patch(
        "/profiles/me",
        headers=headers,
        json={
            "full_name": "Alex Taylor-Updated",
            "skills": ["Python", "TypeScript", "Customer Service"],
            "bio": "Updated bio description.",
        },
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["full_name"] == "Alex Taylor-Updated"
    assert "TypeScript" in updated_data["skills"]


def test_business_cannot_access_youth_profile(client):
    biz_token = get_token_for(client, "business@example.com", "Password123!")
    res = client.get("/profiles/me", headers={"Authorization": f"Bearer {biz_token}"})
    assert res.status_code == 403

