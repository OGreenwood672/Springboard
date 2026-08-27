import pytest


def test_register_and_login_youth(client):
    # 1. Register new youth
    reg_res = client.post(
        "/auth/register",
        json={
            "email": "NEW.YOUTH@EXAMPLE.COM",
            "password": "SecurePassword123!",
            "role": "youth",
        },
    )
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "new.youth@example.com"
    assert data["user"]["role"] == "youth"

    # 2. Duplicate registration should fail
    dup_res = client.post(
        "/auth/register",
        json={
            "email": "new.youth@example.com",
            "password": "SecurePassword123!",
            "role": "youth",
        },
    )
    assert dup_res.status_code == 400

    # 3. Login
    login_res = client.post(
        "/auth/login",
        json={
            "email": "new.youth@example.com",
            "password": "SecurePassword123!",
        },
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # 4. Get Current User (/auth/me)
    me_res = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "new.youth@example.com"


def test_login_invalid_credentials(client):
    res = client.post(
        "/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "WrongPassword!",
        },
    )
    assert res.status_code == 401

