import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base, GUID
from app.core.time import utc_now


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    conversation_id = Column(GUID, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # "system", "user", "assistant", "tool"
    content = Column(Text, nullable=False)
    tool_name = Column(String(100), nullable=True)
    tool_payload = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    conversation = relationship("Conversation", back_populates="messages")

