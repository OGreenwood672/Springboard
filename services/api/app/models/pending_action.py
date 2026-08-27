import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base, GUID
from app.core.time import utc_now


class PendingAction(Base):
    __tablename__ = "pending_actions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    conversation_id = Column(GUID, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    action_type = Column(String(100), nullable=False)
    payload = Column(JSON, nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # "pending", "confirmed", "cancelled", "expired"

    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    confirmed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", backref="pending_actions")
    conversation = relationship("Conversation", back_populates="pending_actions")

