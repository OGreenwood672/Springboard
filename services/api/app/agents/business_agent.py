import re
from typing import Tuple, List, Dict, Any, Optional
from app.agents.tool_executor import ToolExecutor
from app.agents.schemas import UICardPayload
from app.models import Opportunity, PendingAction, Business


class BusinessAgentOrchestrator:
    """Deterministic, rule-based orchestrator for the Business Recruitment Assistant.
    Used when running in offline/test mode or without an external LLM key.
    Calls the exact same ToolExecutor methods as the Gemini tool-calling engine.
    """

    def __init__(self, executor: ToolExecutor):
        self.executor = executor

    def process_message(self, message: str) -> Tuple[str, List[UICardPayload], Optional[Dict[str, Any]]]:
        msg = message.strip()
        msg_lower = msg.lower()

        # 1. Direct Confirm / Publish / Cancel
        if msg_lower in ["confirm", "publish", "yes", "save", "confirm please", "yes please", "publish role", "save draft"]:
            latest_pending = self.executor.db.query(PendingAction).filter(
                PendingAction.user_id == self.executor.user.id,
                PendingAction.conversation_id == self.executor.conversation_id,
                PendingAction.status == "pending",
            ).order_by(PendingAction.created_at.desc()).first()

            if latest_pending:
                if latest_pending.action_type == "create_opportunity_draft":
                    publish_now = "publish" in msg_lower or latest_pending.payload.get("status") == "published"
                    res = self.executor.confirm_opportunity_creation(str(latest_pending.id), publish_now=publish_now)
                    return f"🎉 {res['message']}", [], None
                elif latest_pending.action_type == "update_opportunity_status":
                    res = self.executor.confirm_opportunity_status_update(str(latest_pending.id))
                    return f"✅ {res['message']}", [], None
                elif latest_pending.action_type == "update_business_profile":
                    res = self.executor.confirm_business_profile_update(str(latest_pending.id))
                    return f"✅ {res['message']}", [], None

        if msg_lower in ["cancel", "no", "abort", "reject", "don't publish"]:
            latest_pending = self.executor.db.query(PendingAction).filter(
                PendingAction.user_id == self.executor.user.id,
                PendingAction.conversation_id == self.executor.conversation_id,
                PendingAction.status == "pending",
            ).order_by(PendingAction.created_at.desc()).first()

            if latest_pending:
                latest_pending.status = "cancelled"
                self.executor.db.commit()
                return "❌ Action cancelled. What else can I assist you with?", [], None

        # 2. Candidate Match Explanation ("why did this candidate score...", "why score 82?")
        if "why" in msg_lower and ("score" in msg_lower or "match" in msg_lower or "candidate" in msg_lower):
            biz = self.executor.db.query(Business).filter(Business.user_id == self.executor.user.id).first()
            if biz:
                opp = self.executor.db.query(Opportunity).filter(Opportunity.business_id == biz.id).first()
                if opp:
                    cands_res, _ = self.executor.search_candidates_for_my_opportunity(str(opp.id))
                    if cands_res.get("candidates") and len(cands_res["candidates"]) > 0:
                        top_cand = cands_res["candidates"][0]
                        res, cards = self.executor.explain_candidate_match(str(opp.id), top_cand["youth_profile_id"])
                        points = "\n".join([f"• {p}" for p in res.get("explanation_points", [])])
                        text = f"Here is why candidate **{top_cand['candidate_name']}** scored **{res['total_score']}%** for **{opp.title}**:\n\n{points}"
                        return text, cards, None

        # 3. Candidate Search ("which candidates...", "show candidates", "who can work...", "matches for...")
        if any(w in msg_lower for w in ["candidate", "candidates", "applicant", "applicants", "who can", "who is free"]):
            biz = self.executor.db.query(Business).filter(Business.user_id == self.executor.user.id).first()
            if not biz:
                return "Please complete your organisation setup first to view candidate talent.", [], None

            # Find matching opportunity
            opps = self.executor.db.query(Opportunity).filter(Opportunity.business_id == biz.id).all()
            target_opp = opps[0] if opps else None
            for o in opps:
                if o.title.lower() in msg_lower:
                    target_opp = o
                    break

            if not target_opp:
                return "You don't have any active listings yet. Let's create an opportunity draft first!", [], None

            res, cards = self.executor.search_candidates_for_my_opportunity(str(target_opp.id))
            if res["count"] == 0:
                text = f"No candidate matches currently calculated for **{target_opp.title}**. As young people register near your location, top matches will appear here."
            else:
                text = f"Here are **{res['count']}** top candidate matches for **{target_opp.title}** ranked by skill alignment, travel distance, and availability:"
            return text, cards, None

        # 4. Listing Management ("close role", "publish role", "list opportunities", "my listings")
        if "close" in msg_lower and ("role" in msg_lower or "opportunity" in msg_lower or "job" in msg_lower or "volunteer" in msg_lower):
            biz = self.executor.db.query(Business).filter(Business.user_id == self.executor.user.id).first()
            if biz:
                opps = self.executor.db.query(Opportunity).filter(Opportunity.business_id == biz.id, Opportunity.status == "published").all()
                target_opp = opps[0] if opps else None
                for o in opps:
                    if o.title.lower() in msg_lower:
                        target_opp = o
                        break
                if target_opp:
                    res, cards = self.executor.propose_opportunity_status_update(str(target_opp.id), "closed")
                    text = f"I have prepared a request to close **{target_opp.title}**. Please confirm below."
                    return text, cards, res

        if "my listings" in msg_lower or "my opportunities" in msg_lower or "list opportunities" in msg_lower:
            res, cards = self.executor.list_my_opportunities()
            if res["count"] == 0:
                return "You have not created any listings yet. Would you like to draft a new vacancy?", [], None
            opp_bullets = "\n".join([f"• **{o['title']}** ({o['opportunity_type'].replace('_', ' ').title()} - {o['status'].capitalize()}) — {o['applications_count']} applicant(s)" for o in res["opportunities"]])
            text = f"You have **{res['count']}** listing(s):\n\n{opp_bullets}"
            return text, cards, None

        # 5. Opportunity Extraction / Creation
        draft_payload = self._extract_opportunity_draft(msg)
        if draft_payload:
            res, cards = self.executor.propose_opportunity(**draft_payload)
            if "status" in res and res["status"] == "pending_confirmation":
                text = f"I've drafted a new opportunity listing for **{draft_payload['title']}**. Please review the details below and click **Confirm** to save or publish it to candidates."
                return text, cards, res

        # 6. Default Prompt
        return "👋 Hi there! I'm your Springboard Recruitment Assistant. Describe the opportunity you need (e.g. *'We need two students to help at our café in Amersham on Saturday mornings, paying £11.50/hr'*) or ask me to search candidate matches for your listings!", [], None

    def _extract_opportunity_draft(self, text: str) -> Optional[Dict[str, Any]]:
        text_lower = text.lower()

        # Check for creation intent
        has_create_intent = any(w in text_lower for w in ["need", "looking for", "want", "hire", "post", "create", "vacancy", "opening", "opportunity", "role"])
        if not has_create_intent and len(text.split()) < 5:
            return None

        # Opportunity Type
        opp_type = "part_time_job"
        if "volunteer" in text_lower or "charity" in text_lower:
            opp_type = "volunteering"
        elif "work experience" in text_lower or "intern" in text_lower or "placement" in text_lower:
            opp_type = "work_experience"

        # Pay extraction
        pay_info = None
        pay_match = re.search(r"(?:£|gbp|\$)(\d+(?:\.\d{2})?)\s*(?:per hour|/hr|/hour|ph|an hour)?", text, re.IGNORECASE)
        if pay_match:
            pay_info = f"£{pay_match.group(1)} / hour"
        elif opp_type == "volunteering":
            pay_info = "Voluntary (Expenses covered)"
        elif opp_type == "part_time_job":
            pay_info = "£11.44 / hour"

        # Hours / schedule extraction
        hours = "Flexible"
        if "saturday" in text_lower and "morning" in text_lower:
            hours = "Saturday mornings (9am - 1pm)"
        elif "saturday" in text_lower:
            hours = "Saturdays (8 hours / week)"
        elif "weekend" in text_lower:
            hours = "Weekends (8-16 hours / week)"
        elif "evening" in text_lower:
            hours = "Weekday evenings (2-4 hours)"

        # Postcode extraction
        postcode = None
        pc_match = re.search(r"\b([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|[A-Z]{1,2}\d{1,2})\b", text, re.IGNORECASE)
        if pc_match:
            postcode = pc_match.group(1).upper()

        # Location name
        loc_name = "Local Premises"
        for town in ["Amersham", "Chesham", "London", "Manchester", "Birmingham", "Bristol", "Leeds", "High Wycombe", "Aylesbury"]:
            if town.lower() in text_lower:
                loc_name = town
                break

        # Skills extraction
        common_skills = [
            "Customer Service", "Communication", "Teamwork", "Problem Solving",
            "Retail", "Cash Handling", "Social Media", "Python", "HTML/CSS",
            "First Aid", "Event Planning", "Administration", "Reliability"
        ]
        skills = []
        for s in common_skills:
            if s.lower() in text_lower or (s == "Reliability" and "reliable" in text_lower):
                skills.append(s)
        if not skills:
            skills = ["Customer Service", "Teamwork"] if opp_type == "part_time_job" else ["Communication"]

        # Title inference
        title = "Weekend Team Assistant"
        if "café" in text_lower or "cafe" in text_lower:
            title = "Weekend Café Assistant"
        elif "developer" in text_lower or "coding" in text_lower or "web" in text_lower:
            title = "Junior Web Developer"
        elif "retail" in text_lower or "shop" in text_lower or "store" in text_lower:
            title = "Retail Assistant"
        elif "volunteer" in text_lower:
            title = "Community Volunteer Assistant"
        elif "intern" in text_lower or "experience" in text_lower:
            title = "Work Experience Placement"

        return {
            "title": title,
            "opportunity_type": opp_type,
            "description": text.strip(),
            "required_skills": skills[:2],
            "preferred_skills": skills[2:],
            "location_name": loc_name,
            "postcode": postcode,
            "workplace_type": "in_person",
            "pay_info": pay_info,
            "hours_or_commitment": hours,
            "status": "draft",
        }

