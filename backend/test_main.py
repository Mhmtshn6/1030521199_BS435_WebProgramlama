import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_create_round():
    response = client.post("/round", json={"difficulty": "Kolay", "category": "Manzara"})
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 3
    assert "correctId" in data
    assert "hint" in data
    assert data["correctId"] in [item["id"] for item in data["items"]]
    ai_count = sum(1 for item in data["items"] if item["isAi"])
    assert ai_count == 1


def test_save_result():
    response = client.post(
        "/result",
        json={
            "correct": True,
            "attempts": 1,
            "score": 5,
            "difficulty": "Kolay",
            "category": "Manzara",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["saved"] is True

