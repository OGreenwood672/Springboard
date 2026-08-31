import re
from typing import Tuple, List, Dict, Any, Optional
from app.agents.tool_executor import ToolExecutor
from app.agents.schemas import UICardPayload
from app.models import PendingAction, Business, WageSubsidyScheme, Council


class CouncilAgentOrchestrator:
    """Deterministic, rule-based orchestrator for the Council Economic Development & Social Mobility Director.
    Used when running in offline/test mode or without an external LLM key.
    Calls the exact same ToolExecutor methods as the Gemini tool-calling engine.
    """

    def __init__(self, executor: ToolExecutor):
        self.executor = executor

    def process_message(self, message: str) -> Tuple[str, List[UICardPayload], Optional[Dict[str, Any]]]:
        msg = message.strip()
        msg_lower = msg.lower()

        # 1. Direct Confirm / Authorize / Commit / Cancel
        if msg_lower in ["confirm", "authorize", "pledge", "commit", "yes", "confirm pledge", "authorize grant", "yes please", "create scheme"]:
            latest_pending = self.executor.db.query(PendingAction).filter(
                PendingAction.user_id == self.executor.user.id,
                PendingAction.conversation_id == self.executor.conversation_id,
                PendingAction.status == "pending",
            ).order_by(PendingAction.created_at.desc()).first()

            if latest_pending:
                if latest_pending.action_type == "wage_subsidy_pledge":
                    res = self.executor.confirm_wage_subsidy_pledge(str(latest_pending.id))
                    return f"🎉 **Grant Authorized**: {res['message']}\n• **Status**: Active Subsidised\n• **Remaining Scheme Balance**: £{res['scheme_remaining_budget']:,.2f}", [], None
                elif latest_pending.action_type == "create_subsidy_scheme":
                    res = self.executor.confirm_wage_subsidy_scheme(str(latest_pending.id))
                    return f"🏛️ **Scheme Launched**: {res['message']}\n• **Fund Pool**: £{res['total_budget']:,.2f}", [], None

        if msg_lower in ["cancel", "no", "abort", "reject", "don't pledge", "don't create"]:
            latest_pending = self.executor.db.query(PendingAction).filter(
                PendingAction.user_id == self.executor.user.id,
                PendingAction.conversation_id == self.executor.conversation_id,
                PendingAction.status == "pending",
            ).order_by(PendingAction.created_at.desc()).first()

            if latest_pending:
                latest_pending.status = "cancelled"
                self.executor.db.commit()
                return "❌ Grant proposal cancelled. What else would you like to evaluate?", [], None

        # 2. Budget Forecasting / ROI Cohort Modeling ("model 10 youth", "forecast 5 placements", "calculate budget for 8 young people")
        if any(w in msg_lower for w in ["model", "forecast", "cohort", "calculate", "roi", "multiplier"]) and any(w in msg_lower for w in ["youth", "people", "placement", "placements", "budget", "cost", "grant"]):
            # Extract youth count
            youth_match = re.search(r"(\d+)\s*(?:youth|people|placements|young people|candidates|workers)", msg_lower)
            youth_count = int(youth_match.group(1)) if youth_match else 5

            # Extract hourly subsidy if specified (e.g. £4.50, 4.5, 4.50/hr)
            rate_match = re.search(r"(?:£|pound|rate\s+of\s+)?(\d+(?:\.\d{1,2})?)\s*(?:/hr|per hour|hourly|\/hour)?", msg_lower)
            hourly_subsidy = 4.50
            if "£" in msg or "/hr" in msg or "per hour" in msg:
                rate_found = re.search(r"£\s*(\d+(?:\.\d{1,2})?)", msg)
                if rate_found:
                    hourly_subsidy = float(rate_found.group(1))

            # Extract hours per week
            hours_match = re.search(r"(\d+)\s*(?:hrs|hours|hr)(?:\s*(?:per|/|a)\s*week)?", msg_lower)
            hours_per_week = int(hours_match.group(1)) if hours_match else 16

            # Extract duration in weeks
            weeks_match = re.search(r"(\d+)\s*(?:wks|weeks|week)", msg_lower)
            duration_weeks = int(weeks_match.group(1)) if weeks_match else 24

            res, cards = self.executor.model_scheme_budget_forecast(
                youth_count=youth_count,
                hourly_subsidy=hourly_subsidy,
                hours_per_week=hours_per_week,
                duration_weeks=duration_weeks,
                base_employer_wage=7.00,
            )

            text = (
                f"📊 **Economic Forecast for {youth_count} Youth Placements**:\n"
                f"• **Council Top-up Grant**: £{hourly_subsidy:.2f}/hr (£{res['cost_per_placement']:,.2f} per placement)\n"
                f"• **Total Council Fund Required**: **£{res['total_council_budget_required']:,.2f}**\n"
                f"• **Employer Co-Contribution**: £{res['employer_co_contribution_total']:,.2f}\n"
                f"• **Total Wages Injected**: £{res['total_youth_wages_injected']:,.2f} (£{res['combined_hourly_rate']:.2f}/hr combined)\n"
                f"• **Estimated Local Economic Multiplier**: **£{res['estimated_local_economic_benefit']:,.2f}** ({res['social_mobility_multiplier']} HM Treasury Green Book ROI)"
            )
            return text, cards, None

        # 3. Propose / Draft Wage Subsidy Pledge ("pledge subsidy to...", "offer subsidy to...", "fund Chesham Bikes", "grant £4.50 to...")
        if any(w in msg_lower for w in ["pledge", "offer subsidy", "subsidise", "subsidize", "grant to", "top up", "fund"]):
            bizs = self.executor.db.query(Business).all()
            target_biz = None
            for b in bizs:
                if b.name.lower() in msg_lower or any(word in msg_lower for word in b.name.lower().split() if len(word) > 3):
                    target_biz = b
                    break

            if not target_biz and bizs:
                target_biz = bizs[0]

            if target_biz:
                # Extract hourly rate
                rate_found = re.search(r"£\s*(\d+(?:\.\d{1,2})?)", msg)
                hourly_subsidy = float(rate_found.group(1)) if rate_found else round(target_biz.target_wage - target_biz.current_wage_offered, 2)
                if hourly_subsidy <= 0:
                    hourly_subsidy = 4.50

                hours_match = re.search(r"(\d+)\s*(?:hrs|hours|hr)", msg_lower)
                max_hours = int(hours_match.group(1)) if hours_match else 16

                weeks_match = re.search(r"(\d+)\s*(?:wks|weeks)", msg_lower)
                duration_wks = int(weeks_match.group(1)) if weeks_match else 24

                res, cards = self.executor.draft_wage_subsidy_pledge(
                    business_id=str(target_biz.id),
                    hourly_subsidy=hourly_subsidy,
                    max_hours_per_week=max_hours,
                    duration_weeks=duration_wks,
                    notes=f"Council living wage bridge for {target_biz.name}",
                )

                text = (
                    f"I have drafted a **Wage Subsidy Grant Pledge** for **{target_biz.name}**:\n\n"
                    f"• **Employer Base Wage**: £{target_biz.current_wage_offered:.2f}/hr\n"
                    f"• **Council Top-up Grant**: **£{hourly_subsidy:.2f}/hr**\n"
                    f"• **Combined Youth Wage**: **£{target_biz.current_wage_offered + hourly_subsidy:.2f}/hr** (Exceeds Real Living Wage £11.44)\n"
                    f"• **Total Council Grant**: **£{hourly_subsidy * max_hours * duration_wks:,.2f}** ({max_hours} hrs/wk for {duration_wks} weeks)\n\n"
                    f"Please review the offer card below and click **Authorize & Commit Pledge** to confirm."
                )
                return text, cards, None

        # 4. In-depth Company Assessment ("assess Chesham Bike Works", "evaluate Apex Tech", "wage gap for...")
        if any(w in msg_lower for w in ["assess", "evaluate", "breakdown", "gap for", "about"]) and any(w in msg_lower for w in ["company", "business", "bike", "tech", "cafe", "sme", "employer"]):
            bizs = self.executor.db.query(Business).all()
            target_biz = None
            for b in bizs:
                if b.name.lower() in msg_lower or any(word in msg_lower for word in b.name.lower().split() if len(word) > 3):
                    target_biz = b
                    break

            if not target_biz and bizs:
                target_biz = bizs[0]

            if target_biz:
                res, cards = self.executor.assess_company_wage_subsidy(business_id=str(target_biz.id))
                text = (
                    f"🔍 **Wage Subsidy & Social Mobility Assessment for {target_biz.name}**:\n\n"
                    f"• **Organisation Type**: {target_biz.organisation_type} ({target_biz.company_size.capitalize()}, ~{target_biz.employee_count} staff)\n"
                    f"• **Current Wage Offered**: £{target_biz.current_wage_offered:.2f}/hr\n"
                    f"• **Target Real Living Wage**: £{target_biz.target_wage:.2f}/hr\n"
                    f"• **Hourly Wage Gap**: **£{target_biz.hourly_wage_gap:.2f}/hr**\n"
                    f"• **Low-Income Catchment Priority**: **{target_biz.low_income_catchment_score:.0f}/100**\n"
                    f"• **Mentorship Commitment**: {'✅ Verified' if target_biz.youth_mentorship_commitment else '⚠️ Pending'}\n"
                    f"• **Estimated 6-Month Subsidy (16 hrs/wk)**: £{res['estimated_grant_24_weeks_16_hrs']:,.2f}\n\n"
                    f"Would you like me to draft a wage subsidy pledge of **£{res['recommended_hourly_subsidy']:.2f}/hr** for this company?"
                )
                return text, cards, None

        # 5. IMD Deprivation Catchments ("deprivation wards", "low income catchments", "IMD decile", "postcodes")
        if any(w in msg_lower for w in ["deprivation", "catchment", "ward", "decile", "low income", "pupil premium", "poverty"]):
            res, _ = self.executor.query_deprivation_wards()
            wards_text = "\n".join([
                f"• **{w['ward_name']}** ({w['postcode_prefix']}): **{w['priority_level']}** — {w['low_income_family_percentage']}% low-income households (~{w['youth_population_estimate']:,} youth, {w['sme_count_in_ward']} local SMEs)"
                for w in res.get("wards", [])
            ])
            text = (
                f"📍 **Index of Multiple Deprivation (IMD) Focus Wards in {res['council_name']}**:\n\n"
                f"{wards_text}\n\n"
                f"SMEs located within or adjacent to these catchments are prioritised with catchment scores above 80/100."
            )
            return text, [], None

        # 6. Search / List Eligible SMEs ("which companies...", "show eligible businesses", "list SMEs", "find tech businesses")
        if any(w in msg_lower for w in ["sme", "smes", "business", "businesses", "company", "companies", "eligible", "employers", "shops"]):
            sector = None
            if "tech" in msg_lower:
                sector = "Technology"
            elif "retail" in msg_lower or "bike" in msg_lower:
                sector = "Retail"
            elif "hospitality" in msg_lower or "cafe" in msg_lower:
                sector = "Hospitality"

            res, cards = self.executor.search_local_smes_for_subsidy(sector=sector)
            text = (
                f"Found **{res['count']}** local businesses eligible for council wage subsidies in your authority area.\n"
                f"Each SME has been evaluated for wage affordability gaps and proximity to low-income family catchments:"
            )
            return text, cards, None

        # 7. Default Overview & Navigation Assistance
        res, cards = self.executor.get_my_council_overview()
        text = (
            f"👋 Welcome to the **{res['name']}** Economic Development & Wage Subsidy Portal.\n\n"
            f"• **Total Fund Allocated**: £{res['total_budget_allocated']:,.2f}\n"
            f"• **Committed Wage Grants**: £{res['total_budget_spent']:,.2f} ({res['budget_utilisation_pct']}% utilised)\n"
            f"• **Remaining Balance**: **£{res['remaining_budget']:,.2f}**\n"
            f"• **Active Placements**: {res['active_allocations_count']} youth currently co-funded\n\n"
            f"**How can I assist you today?**\n"
            f"1. *'Show eligible businesses in Chesham'* to explore local SME wage gaps.\n"
            f"2. *'Assess Chesham Community Bike Works'* for an in-depth subsidy proposal.\n"
            f"3. *'Model 10 youth placements at £4.50/hr'* for budget & Treasury Green Book ROI projections.\n"
            f"4. *'Show high deprivation wards'* for spatial IMD intelligence."
        )
        return text, cards, None

