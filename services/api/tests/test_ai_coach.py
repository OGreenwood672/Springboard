import pytest


def test_ai_coach_extraction_endpoint(client):
    message = (
        "Hi, I'm Alex. I'm 16 and in sixth form in Chesham (HP5). "
        "I want a weekend part-time job or summer work experience in tech or retail. "
        "I'm good with Python and customer service, can travel up to 15km, and got a 7 in GCSE Maths."
    )

    res = client.post(
        "/ai-coach/extract-profile",
        json={"message": message},
    )
    assert res.status_code == 200
    data = res.json()
    extracted = data["extracted_profile"]

    assert "Python" in extracted["skills"] or "python" in [s.lower() for s in extracted["skills"]]
    assert "Customer Service" in extracted["skills"] or "customer service" in [s.lower() for s in extracted["skills"]]
    assert extracted["education_stage"] == "sixth_form"
    assert "part_time_job" in extracted["preferred_opportunity_types"]
    assert extracted["location"]["postcode"] == "HP5"
    assert extracted["location"]["max_travel_km"] == 15
    assert len(extracted["qualifications"]) >= 1
    assert extracted["qualifications"][0]["name"] == "GCSE Mathematics"

