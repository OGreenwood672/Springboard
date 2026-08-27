import uuid
import pytest
from fastapi import HTTPException
from app.models import User, YouthProfile, Business, Opportunity
from app.agents.tool_executor import ToolExecutor


def test_youth_cannot_access_business_tools(db_session):
    youth_user = User(
        id=uuid.uuid4(),
        email="youth_auth_test@example.com",
        password_hash="fake",
        role="youth",
    )
    db_session.add(youth_user)
    db_session.commit()

    conv_id = uuid.uuid4()
    executor = ToolExecutor(db_session, youth_user, conv_id)

    # Youth trying to call business profile
    with pytest.raises(HTTPException) as exc:
        executor.get_my_business_profile()
    assert exc.value.status_code == 403

    # Youth trying to propose an opportunity
    with pytest.raises(HTTPException) as exc2:
        executor.propose_opportunity(
            title="Sneaky Title",
            opportunity_type="part_time_job",
            description="Testing unauthorized proposal",
        )
    assert exc2.value.status_code == 403


def test_business_cannot_access_other_business_opportunity(db_session):
    biz1_user = User(id=uuid.uuid4(), email="biz1@example.com", password_hash="fake", role="business")
    biz2_user = User(id=uuid.uuid4(), email="biz2@example.com", password_hash="fake", role="business")
    db_session.add_all([biz1_user, biz2_user])
    db_session.flush()

    biz1 = Business(user_id=biz1_user.id, name="Biz 1", organisation_type="Tech", contact_name="A", contact_email="a@biz1.com")
    biz2 = Business(user_id=biz2_user.id, name="Biz 2", organisation_type="Retail", contact_name="B", contact_email="b@biz2.com")
    db_session.add_all([biz1, biz2])
    db_session.flush()

    opp_biz1 = Opportunity(
        business_id=biz1.id,
        title="Biz 1 Opp",
        opportunity_type="part_time_job",
        description="Biz 1 Vacancy",
        workplace_type="in_person",
        status="published",
    )
    db_session.add(opp_biz1)
    db_session.commit()

    # Biz 2 executor tries to search candidates for Biz 1's opportunity
    executor2 = ToolExecutor(db_session, biz2_user, uuid.uuid4())
    res, _ = executor2.search_candidates_for_my_opportunity(str(opp_biz1.id))
    assert "error" in res

