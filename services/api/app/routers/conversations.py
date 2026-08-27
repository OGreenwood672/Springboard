from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, ConfigDict

from app.database import get_db
from app.models import User
from app.core.dependencies import get_current_user
from app.agents.conversation_service import ConversationService
from app.agents.schemas import AgentChatResponse, ActionConfirmationResult, PendingActionOut


router = APIRouter(prefix="/conversations", tags=["Agent Conversations"])


class CreateConversationPayload(BaseModel):
    mode: str = Field(..., description="'youth' or 'business'")
    title: Optional[str] = None


class SendMessagePayload(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    conversation_id: UUID
    role: str
    content: str
    tool_name: Optional[str] = None
    tool_payload: Optional[dict] = None
    created_at: str


class ConversationDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    mode: str
    title: Optional[str] = None
    created_at: str
    updated_at: str
    messages: List[MessageOut] = []
    pending_actions: List[PendingActionOut] = []


class ConversationSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    mode: str
    title: Optional[str] = None
    created_at: str
    updated_at: str
    last_message: Optional[str] = None


@router.post("", response_model=ConversationDetailOut, status_code=status.HTTP_201_CREATED)
def start_conversation(
    payload: CreateConversationPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Start or retrieve an active conversation for the authenticated youth or business user."""
    service = ConversationService(db, current_user)
    conv = service.get_or_create_conversation(mode=payload.mode)

    return ConversationDetailOut(
        id=conv.id,
        user_id=conv.user_id,
        mode=conv.mode,
        title=conv.title,
        created_at=conv.created_at.isoformat(),
        updated_at=conv.updated_at.isoformat(),
        messages=[
            MessageOut(
                id=m.id,
                conversation_id=m.conversation_id,
                role=m.role,
                content=m.content,
                tool_name=m.tool_name,
                tool_payload=m.tool_payload,
                created_at=m.created_at.isoformat(),
            )
            for m in conv.messages
        ],
        pending_actions=[
            PendingActionOut.model_validate(pa)
            for pa in conv.pending_actions
            if pa.status == "pending"
        ],
    )


@router.get("", response_model=List[ConversationSummaryOut])
def list_conversations(
    mode: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all conversations belonging to the authenticated user."""
    service = ConversationService(db, current_user)
    convs = service.list_user_conversations(mode=mode)

    out = []
    for c in convs:
        last_msg = c.messages[-1].content if c.messages else None
        out.append(
            ConversationSummaryOut(
                id=c.id,
                user_id=c.user_id,
                mode=c.mode,
                title=c.title,
                created_at=c.created_at.isoformat(),
                updated_at=c.updated_at.isoformat(),
                last_message=last_msg,
            )
        )
    return out


@router.get("/{conversation_id}", response_model=ConversationDetailOut)
def get_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve full conversation details, message history, and active pending actions."""
    service = ConversationService(db, current_user)
    conv = service.get_conversation(conversation_id)

    return ConversationDetailOut(
        id=conv.id,
        user_id=conv.user_id,
        mode=conv.mode,
        title=conv.title,
        created_at=conv.created_at.isoformat(),
        updated_at=conv.updated_at.isoformat(),
        messages=[
            MessageOut(
                id=m.id,
                conversation_id=m.conversation_id,
                role=m.role,
                content=m.content,
                tool_name=m.tool_name,
                tool_payload=m.tool_payload,
                created_at=m.created_at.isoformat(),
            )
            for m in conv.messages
        ],
        pending_actions=[
            PendingActionOut.model_validate(pa)
            for pa in conv.pending_actions
            if pa.status == "pending"
        ],
    )


@router.post("/{conversation_id}/messages", response_model=AgentChatResponse)
def send_message(
    conversation_id: UUID,
    payload: SendMessagePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a user message to the agent and receive assistant responses, UI cards, and pending actions."""
    service = ConversationService(db, current_user)
    response = service.process_user_message(conversation_id, payload.message)
    return response


@router.post("/{conversation_id}/confirm-action/{pending_action_id}", response_model=ActionConfirmationResult)
def confirm_action(
    conversation_id: UUID,
    pending_action_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Explicitly confirm and persist a pending action (profile update, vacancy drafting, application submission)."""
    service = ConversationService(db, current_user)
    result = service.confirm_action(conversation_id, pending_action_id)

    return ActionConfirmationResult(
        pending_action_id=pending_action_id,
        status="confirmed",
        message=result.get("message", "Action confirmed successfully!"),
        result_data=result,
    )


@router.post("/{conversation_id}/cancel-action/{pending_action_id}", response_model=ActionConfirmationResult)
def cancel_action(
    conversation_id: UUID,
    pending_action_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel an active pending action proposal."""
    service = ConversationService(db, current_user)
    result = service.cancel_action(conversation_id, pending_action_id)

    return ActionConfirmationResult(
        pending_action_id=pending_action_id,
        status="cancelled",
        message=result.get("message", "Action proposal cancelled."),
    )
