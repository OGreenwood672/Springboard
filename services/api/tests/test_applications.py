import pytest


def test_youth_apply_and_track_application(client):
    reg = client.post(
        "/auth/register",
        json={"email": "apptest.youth@example.com", "password": "Password123!", "role": "youth"},
    )
    assert reg.status_code == 201
    youth_token = reg.json()["access_token"]
    youth_headers = {"Authorization": f"Bearer {youth_token}"}

    # Find a published opportunity
    opps = client.get("/opportunities").json()
    assert len(opps) > 0
    opp_id = opps[0]["id"]

    # 1. Apply
    apply_res = client.post(
        "/applications",
        headers=youth_headers,
        json={
            "opportunity_id": opp_id,
            "cover_note": "I would love to participate in this role!",
        },
    )
    assert apply_res.status_code == 201
    app_id = apply_res.json()["id"]
    assert apply_res.json()["status"] == "submitted"

    # 2. Duplicate apply should fail
    dup_res = client.post(
        "/applications",
        headers=youth_headers,
        json={
            "opportunity_id": opp_id,
            "cover_note": "Duplicate application attempt",
        },
    )
    assert dup_res.status_code == 400

    # 3. Track my applications
    my_apps = client.get("/applications/me", headers=youth_headers)
    assert my_apps.status_code == 200
    assert any(a["id"] == app_id for a in my_apps.json())

    # 4. Youth withdraw application
    withdraw_res = client.patch(
        f"/applications/{app_id}",
        headers=youth_headers,
        json={"status": "withdrawn"},
    )
    assert withdraw_res.status_code == 200
    assert withdraw_res.json()["status"] == "withdrawn"
