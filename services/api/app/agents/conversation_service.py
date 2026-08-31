import uuid
import logging
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.config import settings
from app.core.time import utc_now, is_expired
from app.models import User, Conversation, ConversationMessage, PendingAction
from app.agents.tool_executor import ToolExecutor
from app.agents.youth_agent import YouthAgentOrchestrator
from app.agents.business_agent import BusinessAgentOrchestrator
from app.agents.council_agent import CouncilAgentOrchestrator
from app.agents.prompts import (
    YOUTH_AGENT_SYSTEM_PROMPT,
    BUSINESS_AGENT_SYSTEM_PROMPT,
    COUNCIL_AGENT_SYSTEM_PROMPT,
)
from app.agents.tool_definitions import (
    YOUTH_TOOL_DEFINITIONS,
    BUSINESS_TOOL_DEFINITIONS,
    COUNCIL_TOOL_DEFINITIONS,
)
from app.agents.schemas import AgentChatResponse, UICardPayload, PendingActionOut

logger = logging.getLogger("uvicorn.error")


class ConversationService:
    """Service orchestrating multi-turn agent conversations, tool calling,
    and pending-action confirmation flows across Youth, Business, and Council modes.
    """

    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user

    def get_or_create_conversation(self, mode: str, conversation_id: Optional[uuid.UUID] = None) -> Conversation:
        if mode not in ["youth", "business", "council"]:
            raise HTTPException(status_code=400, detail="Invalid conversation mode.")

        # Ensure user role matches conversation mode
        if self.user.role != mode:
            raise HTTPException(status_code=403, detail=f"User role '{self.user.role}' cannot open a '{mode}' conversation.")

        if conversation_id:
            conv = self.db.query(Conversation).filter(
                Conversation.id == conversation_id,
                Conversation.user_id == self.user.id,
            ).first()
            if conv:
                return conv

        # Find latest active conversation or create new
        latest = self.db.query(Conversation).filter(
            Conversation.user_id == self.user.id,
            Conversation.mode == mode,
        ).order_by(Conversation.updated_at.desc()).first()

        if latest:
            return latest

        new_conv = Conversation(
            id=uuid.uuid4(),
            user_id=self.user.id,
            mode=mode,
            title=f"{mode.capitalize()} Conversation",
        )
        self.db.add(new_conv)
        self.db.commit()
        self.db.refresh(new_conv)
        return new_conv

    def list_user_conversations(self, mode: Optional[str] = None) -> List[Conversation]:
        query = self.db.query(Conversation).filter(Conversation.user_id == self.user.id)
        if mode:
            query = query.filter(Conversation.mode == mode)
        return query.order_by(Conversation.updated_at.desc()).all()

    def get_conversation(self, conversation_id: uuid.UUID) -> Conversation:
        conv = self.db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == self.user.id,
        ).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found.")
        return conv

    def process_user_message(self, conversation_id: uuid.UUID, message_text: str) -> AgentChatResponse:
        conv = self.get_conversation(conversation_id)

        # 1. Save user message
        user_msg = ConversationMessage(
            id=uuid.uuid4(),
            conversation_id=conv.id,
            role="user",
            content=message_text.strip(),
        )
        self.db.add(user_msg)
        conv.updated_at = utc_now()
        self.db.commit()

        # 2. Prepare ToolExecutor
        executor = ToolExecutor(self.db, self.user, conv.id)

        # 3. Call Agent (Gemini API with function calling or rule orchestrator fallback)
        assistant_text = ""
        ui_cards: List[UICardPayload] = []
        pending_action_dto: Optional[PendingActionOut] = None

        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
            assistant_text, ui_cards, pending_action_dto = self._call_gemini_agent(conv, executor, message_text)
        else:
            # Fallback / Offline rule orchestrator
            assistant_text, ui_cards, pending_action_dto = self._call_rule_orchestrator(conv, executor, message_text)

        # 4. Save assistant response
        assistant_msg = ConversationMessage(
            id=uuid.uuid4(),
            conversation_id=conv.id,
            role="assistant",
            content=assistant_text,
            tool_payload={"cards_count": len(ui_cards)},
        )
        self.db.add(assistant_msg)
        self.db.commit()

        # Find latest pending action for DTO response if not already set
        if not pending_action_dto:
            latest_pending = self.db.query(PendingAction).filter(
                PendingAction.conversation_id == conv.id,
                PendingAction.status == "pending",
            ).order_by(PendingAction.created_at.desc()).first()

            if latest_pending and not is_expired(latest_pending.expires_at):
                pending_action_dto = PendingActionOut.model_validate(latest_pending)

        return AgentChatResponse(
            conversation_id=conv.id,
            message=assistant_text,
            ui_cards=ui_cards,
            pending_action=pending_action_dto,
        )

    def confirm_action(self, conversation_id: uuid.UUID, pending_action_id: uuid.UUID) -> Dict[str, Any]:
        conv = self.get_conversation(conversation_id)
        executor = ToolExecutor(self.db, self.user, conv.id)

        action = self.db.query(PendingAction).filter(
            PendingAction.id == pending_action_id,
            PendingAction.conversation_id == conv.id,
            PendingAction.user_id == self.user.id,
        ).first()

        if not action:
            raise HTTPException(status_code=404, detail="Pending action not found.")

        result = {}
        if action.action_type == "update_youth_profile":
            result = executor.confirm_youth_profile_update(str(action.id))
        elif action.action_type == "submit_application":
            result = executor.confirm_application(str(action.id))
        elif action.action_type == "update_business_profile":
            result = executor.confirm_business_profile_update(str(action.id))
        elif action.action_type == "create_opportunity_draft":
            result = executor.confirm_opportunity_creation(str(action.id))
        elif action.action_type == "publish_opportunity":
            result = executor.confirm_opportunity_creation(str(action.id), publish_now=True)
        elif action.action_type == "update_opportunity_status":
            result = executor.confirm_opportunity_status_update(str(action.id))
        elif action.action_type == "wage_subsidy_pledge":
            result = executor.confirm_wage_subsidy_pledge(str(action.id))
        elif action.action_type == "create_subsidy_scheme":
            result = executor.confirm_wage_subsidy_scheme(str(action.id))
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported action type: {action.action_type}")

        # Record confirmation message in conversation
        msg = ConversationMessage(
            id=uuid.uuid4(),
            conversation_id=conv.id,
            role="assistant",
            content=f"✅ {result.get('message', 'Action confirmed successfully.')}",
            tool_name="confirm_action",
            tool_payload=result,
        )
        self.db.add(msg)
        conv.updated_at = utc_now()
        self.db.commit()

        return result

    def cancel_action(self, conversation_id: uuid.UUID, pending_action_id: uuid.UUID) -> Dict[str, Any]:
        conv = self.get_conversation(conversation_id)

        action = self.db.query(PendingAction).filter(
            PendingAction.id == pending_action_id,
            PendingAction.conversation_id == conv.id,
            PendingAction.user_id == self.user.id,
        ).first()

        if not action:
            raise HTTPException(status_code=404, detail="Pending action not found.")

        action.status = "cancelled"
        msg = ConversationMessage(
            id=uuid.uuid4(),
            conversation_id=conv.id,
            role="assistant",
            content="❌ Proposal cancelled. Let me know what you would like to do instead.",
            tool_name="cancel_action",
        )
        self.db.add(msg)
        conv.updated_at = utc_now()
        self.db.commit()

        return {"status": "cancelled", "message": "Action proposal cancelled."}

    # =========================================================================
    # Internal Agent Execution Modes
    # =========================================================================

    def _call_rule_orchestrator(
        self,
        conv: Conversation,
        executor: ToolExecutor,
        message_text: str,
    ) -> Tuple[str, List[UICardPayload], Optional[PendingActionOut]]:
        if conv.mode == "youth":
            orch = YouthAgentOrchestrator(executor)
            text, cards, pending_raw = orch.process_message(message_text)
        elif conv.mode == "council":
            orch = CouncilAgentOrchestrator(executor)
            text, cards, pending_raw = orch.process_message(message_text)
        else:
            orch = BusinessAgentOrchestrator(executor)
            text, cards, pending_raw = orch.process_message(message_text)

        pending_dto = None
        if pending_raw and "pending_action_id" in pending_raw:
            pa = self.db.query(PendingAction).filter(
                PendingAction.id == uuid.UUID(pending_raw["pending_action_id"])
            ).first()
            if pa:
                pending_dto = PendingActionOut.model_validate(pa)

        return text, cards, pending_dto

    def _call_gemini_agent(
        self,
        conv: Conversation,
        executor: ToolExecutor,
        message_text: str,
    ) -> Tuple[str, List[UICardPayload], Optional[PendingActionOut]]:
        """Call Gemini API with typed function-calling tools."""
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            model_name = settings.GEMINI_MODEL or "gemini-3.6-flash"

            if conv.mode == "youth":
                system_prompt = YOUTH_AGENT_SYSTEM_PROMPT
                tools_spec = YOUTH_TOOL_DEFINITIONS
            elif conv.mode == "council":
                system_prompt = COUNCIL_AGENT_SYSTEM_PROMPT
                tools_spec = COUNCIL_TOOL_DEFINITIONS
            else:
                system_prompt = BUSINESS_AGENT_SYSTEM_PROMPT
                tools_spec = BUSINESS_TOOL_DEFINITIONS

            # Format tool declarations for google-genai SDK
            declarations = []
            for t in tools_spec:
                declarations.append(
                    types.FunctionDeclaration(
                        name=t["name"],
                        description=t["description"],
                        parameters=t["parameters"],
                    )
                )

            # Build recent history
            recent_msgs = self.db.query(ConversationMessage).filter(
                ConversationMessage.conversation_id == conv.id
            ).order_by(ConversationMessage.created_at.desc()).limit(8).all()
            recent_msgs.reverse()

            contents = []
            for m in recent_msgs:
                r = "user" if m.role == "user" else "model"
                contents.append(types.Content(role=r, parts=[types.Part.from_text(text=m.content)]))

            config = types.GenerateContentConfig(
                system_instruction=system_prompt,
                tools=[types.Tool(function_declarations=declarations)],
                temperature=0.3,
            )

            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=config,
            )

            cards: List[UICardPayload] = []
            assistant_parts = []

            # Check for function calls
            if response.function_calls:
                for call in response.function_calls:
                    fn_name = call.name
                    fn_args = dict(call.args) if call.args else {}

                    # Execute tool via ToolExecutor
                    tool_method = getattr(executor, fn_name, None)
                    if tool_method:
                        tool_res, tool_cards = tool_method(**fn_args)
                        cards.extend(tool_cards)

                        # Summarize tool result back to model or user
                        if isinstance(tool_res, dict) and "summary" in tool_res:
                            assistant_parts.append(tool_res["summary"])
                        elif isinstance(tool_res, dict) and "message" in tool_res:
                            assistant_parts.append(tool_res["message"])

            if response.text:
                assistant_parts.append(response.text)

            assistant_text = "\n\n".join(assistant_parts) if assistant_parts else "I have processed your request."
            return assistant_text, cards, None

        except Exception as e:
            logger.warning(f"Gemini API invocation failed ({e}). Falling back to rule orchestrator.")
            return self._call_rule_orchestrator(conv, executor, message_text)
