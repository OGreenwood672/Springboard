import re
from typing import Tuple, List, Dict, Any, Optional
from app.agents.tool_executor import ToolExecutor
from app.agents.schemas import UICardPayload
from app.models import Opportunity, PendingAction


class YouthAgentOrchestrator:
    """Deterministic, rule-based orchestrator for the Youth Job Coach.
    Used when running in offline/test mode or without an external LLM key.
    Calls the exact same ToolExecutor methods as the Gemini tool-calling engine.
    """

    def __init__(self, executor: ToolExecutor):
        self.executor = executor

    def process_message(self, message: str) -> Tuple[str, List[UICardPayload], Optional[Dict[str, Any]]]:
        msg = message.strip()
        msg_lower = msg.lower()

        # 1. Handle direct confirmation/cancellation in chat
        if msg_lower in ["confirm", "yes", "approve", "confirm please", "yes please", "submit"]:
            # Find latest pending action
            latest_pending = self.executor.db.query(PendingAction).filter(
                PendingAction.user_id == self.executor.user.id,
                PendingAction.conversation_id == self.executor.conversation_id,
                PendingAction.status == "pending",
            ).order_by(PendingAction.created_at.desc()).first()

            if latest_pending:
                if latest_pending.action_type == "update_youth_profile":
                    res = self.executor.confirm_youth_profile_update(str(latest_pending.id))
                    return f"✅ {res['message']}", [], None
                elif latest_pending.action_type == "submit_application":
                    res = self.executor.confirm_application(str(latest_pending.id))
                    return f"🎉 {res['message']}", [], None

        if msg_lower in ["cancel", "no", "abort", "reject", "don't do that"]:
            latest_pending = self.executor.db.query(PendingAction).filter(
                PendingAction.user_id == self.executor.user.id,
                PendingAction.conversation_id == self.executor.conversation_id,
                PendingAction.status == "pending",
            ).order_by(PendingAction.created_at.desc()).first()

            if latest_pending:
                latest_pending.status = "cancelled"
                self.executor.db.commit()
                return "❌ Action cancelled. What else would you like to explore?", [], None

        # 2. Check for Explain Match intent ("why is ... recommended?", "why did ... score?")
        if "why" in msg_lower and ("recommend" in msg_lower or "score" in msg_lower or "suit" in msg_lower or "match" in msg_lower):
            # Try to match opportunity name
            opps = self.executor.db.query(Opportunity).filter(Opportunity.status == "published").all()
            target_opp = None
            for opp in opps:
                if opp.title.lower() in msg_lower or any(word in msg_lower for word in opp.title.lower().split() if len(word) > 3):
                    target_opp = opp
                    break
            if not target_opp and len(opps) > 0:
                target_opp = opps[0]

            if target_opp:
                res, cards = self.executor.explain_opportunity_match(str(target_opp.id))
                points_text = "\n".join([f"• {p}" for p in res.get("explanation_points", [])])
                text = f"Here is why **{target_opp.title}** is scored at **{res['total_score']}%** compatibility for you:\n\n{points_text}"
                return text, cards, None

        # 3. Check for Apply intent ("apply to...", "apply for...")
        if "apply" in msg_lower:
            opps = self.executor.db.query(Opportunity).filter(Opportunity.status == "published").all()
            target_opp = None
            for opp in opps:
                if opp.title.lower() in msg_lower or any(word in msg_lower for word in opp.title.lower().split() if len(word) > 3):
                    target_opp = opp
                    break
            if not target_opp and len(opps) > 0:
                target_opp = opps[0]

            if target_opp:
                cover_note = f"I am very interested in the {target_opp.title} role and excited to contribute my skills."
                res, cards = self.executor.create_application_draft(str(target_opp.id), cover_note=cover_note)
                if "error" in res:
                    return f"⚠️ {res['error']}", cards, None
                text = f"I've drafted an application for **{target_opp.title}** at **{target_opp.business.name if target_opp.business else 'Organisation'}**. Please review the card below and confirm to submit."
                return text, cards, res

        # 4. Check for Profile View ("show profile", "my profile", "what are my skills")
        if "my profile" in msg_lower or "show profile" in msg_lower or "view profile" in msg_lower:
            res, cards = self.executor.get_my_youth_profile()
            if "error" in res:
                return res["error"], cards, None
            skills_str = ", ".join(res.get("skills", [])) or "None listed"
            text = f"Here is your current profile summary:\n• **Name**: {res.get('full_name')}\n• **Postcode**: {res.get('postcode') or 'Not set'}\n• **Skills**: {skills_str}\n• **Education**: {res.get('education_stage', 'Student')}"
            return text, cards, None

        # 5. Check for Profile extraction / updates (e.g. skills, postcode, travel, availability, bio)
        extracted_patch = self._extract_youth_profile_patch(msg)
        if extracted_patch:
            res, cards = self.executor.propose_youth_profile_update(**extracted_patch)
            if "status" in res and res["status"] == "pending_confirmation":
                text = "I've structured your profile details based on what you shared. Please review the proposal below and click **Confirm** to save it to your profile."
                return text, cards, res

        # 6. Check for Opportunity Search / Filter intents ("paid roles", "volunteer", "jobs", "internships")
        if any(w in msg_lower for w in ["search", "find", "show", "browse", "paid", "volunteer", "job", "work experience", "remote", "opportunities", "roles", "near me"]):
            opp_type = None
            if "paid" in msg_lower or "job" in msg_lower or "part-time" in msg_lower:
                opp_type = "part_time_job"
            elif "volunteer" in msg_lower:
                opp_type = "volunteering"
            elif "experience" in msg_lower or "intern" in msg_lower:
                opp_type = "work_experience"

            workplace = None
            if "remote" in msg_lower:
                workplace = "remote"
            elif "hybrid" in msg_lower:
                workplace = "hybrid"

            res, cards = self.executor.search_published_opportunities(
                opportunity_type=opp_type,
                workplace_type=workplace,
            )

            if res["count"] == 0:
                text = "I couldn't find any opportunities matching those exact criteria. Would you like me to show all recommended roles near your location?"
            else:
                text = f"I found **{res['count']}** open opportunity{'ies' if res['count'] != 1 else ''} for you. Check out the details below:"
            return text, cards, None

        # 7. Default to Recommendations
        res, cards = self.executor.get_my_recommended_opportunities()
        if "error" in res:
            return f"👋 Hi there! I'm your Springboard Job Coach. Tell me a bit about yourself (e.g. *'I'm 17 in sixth form in Chesham (HP5). I know Python, Customer Service, and want weekend work.'*) to discover great opportunities!", [], None

        text = f"Here are **{res['count']}** top opportunities personalized for you based on your skills, travel radius, and schedule fit:"
        return text, cards, None

    def _extract_youth_profile_patch(self, text: str) -> Optional[Dict[str, Any]]:
        text_lower = text.lower()
        patch: Dict[str, Any] = {}

        # 1. Postcode
        pc_match = re.search(r"\b([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|[A-Z]{1,2}\d{1,2})\b", text, re.IGNORECASE)
        if pc_match:
            patch["postcode"] = pc_match.group(1).upper()

        # 2. Travel distance
        dist_match = re.search(r"(\d+)\s*(?:km|kilos|kilometres|miles)", text_lower)
        if dist_match:
            patch["max_travel_km"] = min(100, int(dist_match.group(1)))

        # 3. Education Stage
        if "sixth form" in text_lower or "a-level" in text_lower or "year 12" in text_lower or "year 13" in text_lower:
            patch["education_stage"] = "sixth_form"
        elif "college" in text_lower or "btec" in text_lower:
            patch["education_stage"] = "college"
        elif "university" in text_lower or "degree" in text_lower:
            patch["education_stage"] = "university"
        elif "secondary" in text_lower or "gcse" in text_lower or "year 10" in text_lower or "year 11" in text_lower:
            patch["education_stage"] = "secondary"

        # 4. Skills extraction
        common_skills = [
            "Python", "JavaScript", "TypeScript", "HTML/CSS", "Customer Service",
            "Communication", "Teamwork", "Problem Solving", "Social Media",
            "Retail", "Cash Handling", "Event Planning", "First Aid", "Graphic Design",
            "Writing", "Video Editing", "Administration", "Leadership"
        ]
        found_skills = []
        for s in common_skills:
            if s.lower() in text_lower:
                found_skills.append(s)
        if found_skills:
            patch["skills"] = found_skills

        # 5. Availability extraction
        days = []
        for d in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]:
            if d.lower() in text_lower:
                days.append(d)
        if "weekend" in text_lower and not ("Saturday" in days and "Sunday" in days):
            days.extend(["Saturday", "Sunday"])
        if days:
            patch["availability"] = {"days": list(set(days)), "hours_per_week": 8}

        # 6. Preferred types
        types = []
        if "part-time" in text_lower or "paid" in text_lower or "job" in text_lower:
            types.append("part_time_job")
        if "work experience" in text_lower or "internship" in text_lower:
            types.append("work_experience")
        if "volunteer" in text_lower or "charity" in text_lower:
            types.append("volunteering")
        if types:
            patch["preferred_opportunity_types"] = types

        return patch if len(patch) > 0 else None

