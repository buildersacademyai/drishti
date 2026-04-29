import pytest
from fastapi.testclient import TestClient
from drishti_api.main import app

client = TestClient(app)


def test_register_and_login(db_session):
    # register
    res = client.post("/api/v1/auth/register", json={
        "email": "test@drishti.health",
        "password": "strongpass123",
        "role": "fchv",
        "name": "Test FCHV",
    })
    assert res.status_code == 201
    token = res.json()["access_token"]
    assert token

    # login with same credentials
    res2 = client.post("/api/v1/auth/login", json={
        "email": "test@drishti.health",
        "password": "strongpass123",
    })
    assert res2.status_code == 200
    assert res2.json()["access_token"]


def test_login_wrong_password(db_session):
    client.post("/api/v1/auth/register", json={
        "email": "wrong@drishti.health",
        "password": "correctpass",
        "role": "fchv",
    })
    res = client.post("/api/v1/auth/login", json={
        "email": "wrong@drishti.health",
        "password": "wrongpass",
    })
    assert res.status_code == 401


def test_duplicate_registration(db_session):
    client.post("/api/v1/auth/register", json={
        "email": "dup@drishti.health",
        "password": "pass",
        "role": "fchv",
    })
    res = client.post("/api/v1/auth/register", json={
        "email": "dup@drishti.health",
        "password": "pass2",
        "role": "fchv",
    })
    assert res.status_code == 409
