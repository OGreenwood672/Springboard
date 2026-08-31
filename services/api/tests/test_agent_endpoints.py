import uuid


def get_token_for(client, email: str, password: str = "Password123!"):
    res = client.post("/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]


def test_youth_agent_conversation_flow(client):
    token = get_token_for(client, "youth@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Start or get conversation
    res_start = client.post("/conversations", json={"mode": "youth"}, headers=headers)
    assert res_start.status_code == 201
    conv_id = res_start.json()["id"]

    # 2. Send profile information message
    msg_payload = {
        "message": "I'm 17 in sixth form in Chesham (HP5). I know Python, Customer Service, and can work weekends."
    }
    res_msg = client.post(f"/conversations/{conv_id}/messages", json=msg_payload, headers=headers)
    assert res_msg.status_code == 200
    data = res_msg.json()
    assert len(data["message"]) > 0
    assert len(data["ui_cards"]) > 0

    # 3. If pending action was created, confirm it
    if data["pending_action"]:
        action_id = data["pending_action"]["id"]
        res_confirm = client.post(
            f"/conversations/{conv_id}/confirm-action/{action_id}",
            headers=headers,
        )
        assert res_confirm.status_code == 200
        assert res_confirm.json()["status"] == "confirmed"

    # 4. Search opportunities in conversation
    res_search = client.post(
        f"/conversations/{conv_id}/messages",
        json={"message": "Show paid part-time roles"},
        headers=headers,
    )
    assert res_search.status_code == 200
    assert len(res_search.json()["ui_cards"]) > 0


def test_business_agent_conversation_flow(client):
    token = get_token_for(client, "business@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Start business conversation
    res_start = client.post("/conversations", json={"mode": "business"}, headers=headers)
    assert res_start.status_code == 201
    conv_id = res_start.json()["id"]

    # 2. Describe a new vacancy
    msg = "We need two students to help at our café in Amersham on Saturday mornings, paying £11.50 per hour."
    res_msg = client.post(f"/conversations/{conv_id}/messages", json={"message": msg}, headers=headers)
    assert res_msg.status_code == 200
    data = res_msg.json()
    assert len(data["ui_cards"]) > 0
    assert data["pending_action"] is not None

    # 3. Confirm opportunity draft
    action_id = data["pending_action"]["id"]
    res_confirm = client.post(
        f"/conversations/{conv_id}/confirm-action/{action_id}",
        headers=headers,
    )
    assert res_confirm.status_code == 200
    assert res_confirm.json()["status"] == "confirmed"

    # 4. Search candidates
    res_cands = client.post(
        f"/conversations/{conv_id}/messages",
        json={"message": "Show candidate matches for our weekend role"},
        headers=headers,
    )
    assert res_cands.status_code == 200


def test_council_agent_conversation_flow(client):
    token = get_token_for(client, "council@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Start council conversation
    res_start = client.post("/conversations", json={"mode": "council"}, headers=headers)
    assert res_start.status_code == 201
    conv_id = res_start.json()["id"]

    # 2. Query budget modeling & forecasting
    res_forecast = client.post(
        f"/conversations/{conv_id}/messages",
        json={"message": "Model 10 youth placements at £4.50 per hour for 16 hrs a week"},
        headers=headers,
    )
    assert res_forecast.status_code == 200
    data_f = res_forecast.json()
    assert len(data_f["ui_cards"]) > 0
    assert any(c["card_type"] == "budget_forecast" for c in data_f["ui_cards"])

    # 3. Draft wage subsidy pledge for Chesham Bike Works
    res_pledge = client.post(
        f"/conversations/{conv_id}/messages",
        json={"message": "Pledge subsidy of £4.50 to Chesham Community Bike Works for 16 hours a week"},
        headers=headers,
    )
    assert res_pledge.status_code == 200
    data_p = res_pledge.json()
    assert data_p["pending_action"] is not None
    assert data_p["pending_action"]["action_type"] == "wage_subsidy_pledge"
    assert any(c["card_type"] == "subsidy_offer" for c in data_p["ui_cards"])

    # 4. Confirm wage subsidy grant commitment
    action_id = data_p["pending_action"]["id"]
    res_confirm = client.post(
        f"/conversations/{conv_id}/confirm-action/{action_id}",
        headers=headers,
    )
    assert res_confirm.status_code == 200
    assert res_confirm.json()["status"] == "confirmed"
    assert "Successfully authorized" in res_confirm.json()["message"]
