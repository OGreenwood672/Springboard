import pytest
from sqlalchemy.orm import Session

from app.models import User, Council, Business, WageSubsidyScheme, WageSubsidyAllocation
from app.core.security import get_password_hash, create_access_token


def test_council_registration_and_login(client, db_session: Session):
    email = "newcouncil@example.com"
    reg_res = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "Password123!",
            "role": "council",
        },
    )
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert data["user"]["role"] == "council"
    assert "access_token" in data

    # Login
    login_res = client.post(
        "/auth/login",
        json={"email": email, "password": "Password123!"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Access /councils/me
    me_res = client.get(
        "/councils/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    council_data = me_res.json()
    assert council_data["contact_email"] == email
    assert council_data["total_budget_allocated"] >= 100000.0


def test_council_map_data_and_eligible_businesses(client, db_session: Session):
    # Create council user
    user = User(
        email="testcouncil@example.com",
        password_hash=get_password_hash("Password123!"),
        role="council",
    )
    db_session.add(user)
    db_session.flush()

    council = Council(
        user_id=user.id,
        name="Test Council",
        council_type="unitary",
        contact_name="Officer Jane",
        contact_email="testcouncil@example.com",
        postcode="HP5 1AA",
        latitude=51.7058,
        longitude=-0.6125,
        total_budget_allocated=80000.0,
        total_budget_spent=0.0,
    )
    db_session.add(council)

    # Create test business
    biz_user = User(
        email="smetest@example.com",
        password_hash=get_password_hash("Password123!"),
        role="business",
    )
    db_session.add(biz_user)
    db_session.flush()

    business = Business(
        user_id=biz_user.id,
        name="Chesham Local Bakery",
        organisation_type="Hospitality & Food",
        contact_name="Bob Baker",
        contact_email="bob@bakery.co.uk",
        postcode="HP5 1BW",
        latitude=51.7060,
        longitude=-0.6120,
        company_size="micro",
        employee_count=4,
        wage_subsidy_eligible=True,
        wage_subsidy_status="eligible",
        low_income_catchment_score=90.0,
        hourly_wage_gap=4.44,
        current_wage_offered=7.00,
        target_wage=11.44,
    )
    db_session.add(business)
    db_session.commit()

    token = create_access_token(subject=str(user.id), role="council")
    headers = {"Authorization": f"Bearer {token}"}

    # Test map-data
    map_res = client.get("/councils/map-data", headers=headers)
    assert map_res.status_code == 200
    map_data = map_res.json()
    assert "council" in map_data
    assert len(map_data["markers"]) > 0
    assert len(map_data["deprivation_areas"]) > 0
    assert map_data["summary"]["eligible_for_subsidy"] >= 1

    # Test eligible businesses
    biz_res = client.get("/councils/eligible-businesses?sector=Hospitality&company_size=micro", headers=headers)
    assert biz_res.status_code == 200
    biz_list = biz_res.json()
    assert len(biz_list) >= 1
    assert any(b["name"] == "Chesham Local Bakery" for b in biz_list)

    # Test single business wage details
    single_res = client.get(f"/councils/businesses/{business.id}", headers=headers)
    assert single_res.status_code == 200
    single_data = single_res.json()
    assert single_data["hourly_wage_gap"] == 4.44


def test_wage_subsidy_scheme_and_allocation_flow(client, db_session: Session):
    # Setup council and business
    user = User(
        email="flowcouncil@example.com",
        password_hash=get_password_hash("Password123!"),
        role="council",
    )
    db_session.add(user)
    db_session.flush()

    council = Council(
        user_id=user.id,
        name="Flow Council",
        council_type="unitary",
        contact_name="Officer Flow",
        contact_email="flowcouncil@example.com",
        total_budget_allocated=60000.0,
        total_budget_spent=0.0,
    )
    db_session.add(council)

    biz_user = User(
        email="flowbiz@example.com",
        password_hash=get_password_hash("Password123!"),
        role="business",
    )
    db_session.add(biz_user)
    db_session.flush()

    business = Business(
        user_id=biz_user.id,
        name="Flow Tech Repair",
        organisation_type="Technology",
        contact_name="Alice",
        contact_email="alice@flowtech.co.uk",
        company_size="micro",
        wage_subsidy_status="eligible",
        hourly_wage_gap=4.50,
    )
    db_session.add(business)
    db_session.commit()

    token = create_access_token(subject=str(user.id), role="council")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Wage Subsidy Scheme
    scheme_res = client.post(
        "/councils/schemes",
        headers=headers,
        json={
            "title": "Summer Youth Subsidy Fund",
            "description": "Hourly wage subsidy for micro businesses",
            "total_budget": 30000.0,
            "subsidy_rate_per_hour": 4.50,
            "max_hours_per_week_per_youth": 16,
            "max_duration_months": 6,
            "target_postcodes": ["HP5"],
            "target_sectors": ["Technology"],
        },
    )
    assert scheme_res.status_code == 201
    scheme_data = scheme_res.json()
    scheme_id = scheme_data["id"]
    assert scheme_data["remaining_budget"] == 30000.0

    # 2. List Schemes
    list_res = client.get("/councils/schemes", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 3. Create Allocation (16 hrs * 24 wks * £4.50 = £1,728)
    alloc_res = client.post(
        "/councils/allocations",
        headers=headers,
        json={
            "scheme_id": scheme_id,
            "business_id": str(business.id),
            "hourly_subsidy": 4.50,
            "max_hours_per_week": 16,
            "duration_weeks": 24,
            "notes": "Testing wage top-up allocation",
        },
    )
    assert alloc_res.status_code == 201
    alloc_data = alloc_res.json()
    alloc_id = alloc_data["id"]
    assert alloc_data["allocated_amount"] == 1728.0
    assert alloc_data["status"] == "active"

    # Verify scheme remaining budget was deducted
    schemes = client.get("/councils/schemes", headers=headers).json()
    active_scheme = next(s for s in schemes if s["id"] == scheme_id)
    assert active_scheme["remaining_budget"] == 30000.0 - 1728.0

    # 4. List Allocations
    allocs_list = client.get("/councils/allocations", headers=headers)
    assert allocs_list.status_code == 200
    assert len(allocs_list.json()) >= 1

    # 5. Check Analytics
    analytics_res = client.get("/councils/analytics", headers=headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert analytics_data["total_subsidies_active"] >= 1
    assert analytics_data["social_mobility_roi_multiplier"] > 0

