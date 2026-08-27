import uuid
import pytest
from app.models import User, YouthProfile, PendingAction
from app.agents.tool_executor import ToolExecutor


def test_pending_action_not_persisted_until_confirmed(db_session):
    user = User(id=uuid.uuid4(), email="pending_test@example.com", password_hash="fake", role="youth")
    db_session.add(user)
    db_session.flush()

    profile = YouthProfile(user_id=user.id, full_name="Initial Name", skills=["Communication"])
    db_session.add(profile)
    db_session.commit()

    conv_id = uuid.uuid4()
    executor = ToolExecutor(db_session, user, conv_id)

    # 1. Propose update
    res, cards = executor.propose_youth_profile_update(
        full_name="Updated Name",
        skills=["Python", "Customer Service"],
    )

    assert res["status"] == "pending_confirmation"
    pending_id = res["pending_action_id"]

    # Verify DB profile is NOT yet modified
    db_session.refresh(profile)
    assert profile.full_name == "Initial Name"
    assert profile.skills == ["Communication"]

    # 2. Confirm action
    confirm_res = executor.confirm_youth_profile_update(pending_id)
    assert confirm_res["status"] == "confirmed"

    # Verify DB profile is NOW modified
    db_session.refresh(profile)
    assert profile.full_name == "Updated Name"
    assert "Python" in profile.skills

    # 3. Verify single-use confirmation (cannot confirm again)
    with pytest.raises(Exception):
        executor.confirm_youth_profile_update(pending_id)

