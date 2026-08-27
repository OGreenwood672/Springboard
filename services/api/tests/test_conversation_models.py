import uuid
from datetime import timedelta
from app.core.time import utc_now
from app.models import User, Conversation, ConversationMessage, PendingAction


def test_conversation_and_message_models(db_session):
    user = User(
        id=uuid.uuid4(),
        email="conv_user@example.com",
        password_hash="fakehash",
        role="youth",
    )
    db_session.add(user)
    db_session.commit()

    conv = Conversation(
        id=uuid.uuid4(),
        user_id=user.id,
        mode="youth",
        title="Youth Coach Session",
    )
    db_session.add(conv)
    db_session.commit()

    msg1 = ConversationMessage(
        conversation_id=conv.id,
        role="user",
        content="I'm 17 looking for a weekend job in Chesham",
    )
    msg2 = ConversationMessage(
        conversation_id=conv.id,
        role="assistant",
        content="I found some great options for you!",
    )
    db_session.add_all([msg1, msg2])
    db_session.commit()

    db_session.refresh(conv)
    assert len(conv.messages) == 2
    assert conv.messages[0].role == "user"
    assert conv.messages[1].role == "assistant"


def test_pending_action_model(db_session):
    user = User(
        id=uuid.uuid4(),
        email="pending_user@example.com",
        password_hash="fakehash",
        role="youth",
    )
    db_session.add(user)
    db_session.commit()

    conv = Conversation(
        id=uuid.uuid4(),
        user_id=user.id,
        mode="youth",
    )
    db_session.add(conv)
    db_session.commit()

    action = PendingAction(
        user_id=user.id,
        conversation_id=conv.id,
        action_type="update_youth_profile",
        payload={"skills": ["Python", "Customer Service"]},
        status="pending",
        expires_at=utc_now() + timedelta(hours=24),
    )
    db_session.add(action)
    db_session.commit()

    db_session.refresh(conv)
    assert len(conv.pending_actions) == 1
    assert conv.pending_actions[0].action_type == "update_youth_profile"
    assert conv.pending_actions[0].status == "pending"

