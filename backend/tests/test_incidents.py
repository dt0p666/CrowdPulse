import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_public_advisories_endpoint():
    res = client.get("/api/public/advisories?city=Pune")
    assert res.status_code == 200
    data = res.json()
    assert "incidents" in data
    assert "overall_city_status" in data
    assert "active_advisories_count" in data
    assert "distance_clarification" in data
    assert len(data["incidents"]) > 0


def test_public_advisories_with_gps():
    res = client.get("/api/public/advisories?lat=18.5204&lng=73.8567&radius_km=25")
    assert res.status_code == 200
    data = res.json()
    assert len(data["incidents"]) > 0
    # Every incident should have a calculated distance_km
    for inc in data["incidents"]:
        assert "distance_km" in inc
        assert inc["distance_km"] is not None


def test_list_all_incidents():
    res = client.get("/api/incidents")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 6


def test_get_single_incident():
    res = client.get("/api/incidents/INC-PUN-001")
    assert res.status_code == 200
    inc = res.json()
    assert inc["id"] == "INC-PUN-001"
    assert "timeline_updates" in inc
    assert "supporting_metrics" in inc


def test_verify_incident():
    payload = {
        "decision": "verified",
        "officer_name": "Test Officer",
        "officer_badge": "MH-PN-9999",
        "notes": "Verified via test suite"
    }
    res = client.post("/api/incidents/INC-PUN-002/verify", json=payload)
    assert res.status_code == 200
    inc = res.json()
    assert inc["is_verified"] is True
    assert inc["status"] == "verified"


def test_publish_advisory():
    payload = {
        "headline": "Emergency Corridor Divergence Test",
        "public_action": "Divert away from testing lane.",
        "severity": "RED",
        "affected_radius_km": 3.0,
        "officer_name": "Senior Inspector Test"
    }
    res = client.post("/api/incidents/INC-PUN-002/advisory", json=payload)
    assert res.status_code == 200
    inc = res.json()
    assert inc["advisory"] is not None
    assert inc["advisory"]["headline"] == "Emergency Corridor Divergence Test"


def test_resolve_incident():
    payload = {
        "officer_name": "Senior Inspector Test",
        "resolution_notes": "All crowd volume normalized."
    }
    res = client.post("/api/incidents/INC-PUN-002/resolve", json=payload)
    assert res.status_code == 200
    inc = res.json()
    assert inc["status"] == "resolved"


def test_audit_trail():
    res = client.get("/api/authority/audit")
    assert res.status_code == 200
    data = res.json()
    assert "audit_log" in data
    assert len(data["audit_log"]) > 0


def test_auth_demo_login():
    res = client.post("/api/auth/login", json={
        "username": "officer@punepolice.gov.in",
        "password": "authority2026"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "authority_officer"
    assert data["name"] == "Inspector S. Kulkarni"
