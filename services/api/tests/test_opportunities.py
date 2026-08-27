import pytest


def get_token_for(client, email, password):
    res = client.post("/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200
    return res.json()["access_token"]


def test_list_and_filter_opportunities(client):
    # Public listing returns published only
    res = client.get("/opportunities")
    assert res.status_code == 200
    opps = res.json()
    assert len(opps) >= 4
    for opp in opps:
        assert opp["status"] == "published"

    # Filter by opportunity_type
    res_jobs = client.get("/opportunities?opportunity_type=part_time_job")
    assert res_jobs.status_code == 200
    for opp in res_jobs.json():
        assert opp["opportunity_type"] == "part_time_job"

    # Filter by workplace_type
    res_remote = client.get("/opportunities?workplace_type=remote")
    assert res_remote.status_code == 200
    for opp in res_remote.json():
        assert opp["workplace_type"] == "remote"

    # Filter by keyword
    res_kw = client.get("/opportunities?keyword=developer")
    assert res_kw.status_code == 200
    for opp in res_kw.json():
        assert "developer" in opp["title"].lower() or "developer" in opp["description"].lower()


def test_business_create_publish_close_opportunity(client):
    biz_token = get_token_for(client, "business@example.com", "Password123!")
    headers = {"Authorization": f"Bearer {biz_token}"}

    # 1. Create opportunity as draft
    create_res = client.post(
        "/opportunities",
        headers=headers,
        json={
            "title": "Junior Python Intern",
            "opportunity_type": "work_experience",
            "description": "Learn backend software development in a supportive environment.",
            "required_skills": ["Python"],
            "preferred_skills": ["Git", "SQL"],
            "location_name": "Chesham",
            "postcode": "HP5 1AA",
            "workplace_type": "hybrid",
            "pay_info": "£12.00 / hour",
            "hours_or_commitment": "10 hours / week",
            "status": "draft",
        },
    )
    assert create_res.status_code == 201
    opp = create_res.json()
    opp_id = opp["id"]
    assert opp["status"] == "draft"

    # 2. Publish
    pub_res = client.post(f"/opportunities/{opp_id}/publish", headers=headers)
    assert pub_res.status_code == 200
    assert pub_res.json()["status"] == "published"

    # 3. Close
    close_res = client.post(f"/opportunities/{opp_id}/close", headers=headers)
    assert close_res.status_code == 200
    assert close_res.json()["status"] == "closed"


def test_youth_cannot_create_opportunity(client):
    youth_token = get_token_for(client, "youth@example.com", "Password123!")
    headers = {"Authorization": f"Bearer {youth_token}"}

    res = client.post(
        "/opportunities",
        headers=headers,
        json={
            "title": "Hacker Opp",
            "opportunity_type": "part_time_job",
            "description": "Should fail",
        },
    )
    assert res.status_code == 403

