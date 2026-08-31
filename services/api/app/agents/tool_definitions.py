"""Tool definitions for Gemini function calling.
Contains structured JSON schemas for Youth and Business allow-listed tools.
"""

YOUTH_TOOL_DEFINITIONS = [
    {
        "name": "get_my_youth_profile",
        "description": "Retrieves the authenticated youth user's current profile, skills, qualifications, location, and availability.",
        "parameters": {
            "type": "OBJECT",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "propose_youth_profile_update",
        "description": "Proposes an update to the youth user's profile attributes (skills, interests, availability, education stage, qualifications, postcode, travel distance, bio). This creates a pending action for the user to confirm before changes are saved.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "full_name": {"type": "STRING", "description": "Candidate's full name"},
                "postcode": {"type": "STRING", "description": "UK Postcode outward or full code (e.g. HP5, SW1A 1AA)"},
                "max_travel_km": {"type": "INTEGER", "description": "Maximum travel radius in kilometers (1 to 100)"},
                "skills": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "List of candidate skills (e.g. Python, Customer Service, Teamwork)"},
                "interests": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "Areas of interest (e.g. Technology, Retail, Charity)"},
                "education_stage": {"type": "STRING", "enum": ["secondary", "sixth_form", "college", "university", "other"], "description": "Current education stage"},
                "bio": {"type": "STRING", "description": "Short bio or summary of goals"},
                "preferred_opportunity_types": {"type": "ARRAY", "items": {"type": "STRING", "enum": ["part_time_job", "work_experience", "volunteering"]}, "description": "Preferred opportunity categories"},
                "availability": {
                    "type": "OBJECT",
                    "properties": {
                        "days": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "Days available (e.g. ['Saturday', 'Sunday', 'Wednesday'])"},
                        "hours_per_week": {"type": "INTEGER", "description": "Target weekly hours (e.g. 8)"},
                    },
                },
                "qualifications": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "name": {"type": "STRING", "description": "Qualification name (e.g. GCSE Mathematics)"},
                            "grade": {"type": "STRING", "description": "Grade achieved (e.g. 7, A, Distinction)"},
                            "year_obtained": {"type": "INTEGER", "description": "Year achieved (e.g. 2024)"},
                        },
                        "required": ["name"],
                    },
                    "description": "GCSE, BTEC, or A-Level qualifications",
                },
            },
        },
    },
    {
        "name": "search_published_opportunities",
        "description": "Searches all published opportunities across the UK by keyword, type, workplace, or location.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "keyword": {"type": "STRING", "description": "Search keyword for title, skills, or description"},
                "opportunity_type": {"type": "STRING", "enum": ["part_time_job", "work_experience", "volunteering"], "description": "Filter by opportunity type"},
                "workplace_type": {"type": "STRING", "enum": ["in_person", "hybrid", "remote"], "description": "Filter by workplace arrangement"},
                "location": {"type": "STRING", "description": "UK Postcode or town/city name"},
            },
        },
    },
    {
        "name": "get_my_recommended_opportunities",
        "description": "Retrieves personalized opportunities scored and ranked deterministically for the authenticated youth user based on their skills, location, availability, and preferences.",
        "parameters": {
            "type": "OBJECT",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "get_opportunity_details",
        "description": "Retrieves the full public details of a published opportunity by ID.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "opportunity_id": {"type": "STRING", "description": "UUID of the opportunity"},
            },
            "required": ["opportunity_id"],
        },
    },
    {
        "name": "explain_opportunity_match",
        "description": "Calculates and explains the compatibility match score between the youth user and a specific opportunity, detailing score points for type, skills, travel distance, and availability.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "opportunity_id": {"type": "STRING", "description": "UUID of the opportunity to explain"},
            },
            "required": ["opportunity_id"],
        },
    },
    {
        "name": "create_application_draft",
        "description": "Prepares a formal application draft for a published opportunity with an optional cover note. This creates a pending action requiring the user's explicit confirmation before submission.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "opportunity_id": {"type": "STRING", "description": "UUID of the opportunity to apply for"},
                "cover_note": {"type": "STRING", "description": "Personal note or statement of interest for the employer"},
            },
            "required": ["opportunity_id"],
        },
    },
]

BUSINESS_TOOL_DEFINITIONS = [
    {
        "name": "get_my_business_profile",
        "description": "Retrieves the authenticated business user's organisation profile and contact details.",
        "parameters": {
            "type": "OBJECT",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "propose_business_profile_update",
        "description": "Proposes an update to the organisation's profile (name, sector, contact info, address, postcode, description). Creates a pending action for employer confirmation.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "name": {"type": "STRING", "description": "Organisation name"},
                "organisation_type": {"type": "STRING", "description": "Industry sector (e.g. Technology, Retail, Charity, Hospitality)"},
                "contact_name": {"type": "STRING", "description": "Primary contact person name"},
                "contact_email": {"type": "STRING", "description": "Contact email address"},
                "description": {"type": "STRING", "description": "About the organisation and mentorship provided"},
                "address": {"type": "STRING", "description": "Street address"},
                "postcode": {"type": "STRING", "description": "UK Postcode (e.g. HP5 2UR)"},
                "website": {"type": "STRING", "description": "Organisation website URL"},
            },
        },
    },
    {
        "name": "propose_opportunity",
        "description": "Proposes creating or publishing a new opportunity vacancy (part-time job, work experience, volunteering). Creates a pending action with a preview card for employer confirmation.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "title": {"type": "STRING", "description": "Role title (e.g. Weekend Junior Web Developer, Café Assistant)"},
                "opportunity_type": {"type": "STRING", "enum": ["part_time_job", "work_experience", "volunteering"], "description": "Opportunity category"},
                "description": {"type": "STRING", "description": "Detailed description of tasks and learning opportunities"},
                "required_skills": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "List of required essential skills"},
                "preferred_skills": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "List of nice-to-have skills"},
                "location_name": {"type": "STRING", "description": "Town or city name"},
                "postcode": {"type": "STRING", "description": "UK Postcode for proximity calculation"},
                "workplace_type": {"type": "STRING", "enum": ["in_person", "hybrid", "remote"], "description": "Workplace arrangement"},
                "pay_info": {"type": "STRING", "description": "Hourly rate or compensation (e.g. £11.50 / hour or Expenses covered)"},
                "hours_or_commitment": {"type": "STRING", "description": "Schedule commitment (e.g. 8 hours / week (Saturdays))"},
                "status": {"type": "STRING", "enum": ["draft", "published"], "description": "Initial target status (draft or published)"},
            },
            "required": ["title", "opportunity_type", "description"],
        },
    },
    {
        "name": "list_my_opportunities",
        "description": "Lists all opportunities owned and posted by the authenticated business.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "status": {"type": "STRING", "enum": ["all", "draft", "published", "closed"], "description": "Filter by listing status"},
            },
        },
    },
    {
        "name": "get_my_opportunity_details",
        "description": "Retrieves detailed information and applicant metrics for an opportunity owned by this business.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "opportunity_id": {"type": "STRING", "description": "UUID of the owned opportunity"},
            },
            "required": ["opportunity_id"],
        },
    },
    {
        "name": "search_candidates_for_my_opportunity",
        "description": "Retrieves privacy-safe, algorithmically scored candidate matches for an opportunity owned by this business. Only anonymized candidate profiles are returned.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "opportunity_id": {"type": "STRING", "description": "UUID of the owned opportunity"},
                "min_score": {"type": "NUMBER", "description": "Minimum compatibility score (0-100)"},
            },
            "required": ["opportunity_id"],
        },
    },
    {
        "name": "explain_candidate_match",
        "description": "Explains the deterministic factors behind a candidate's compatibility score for the business's opportunity.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "opportunity_id": {"type": "STRING", "description": "UUID of the owned opportunity"},
                "youth_profile_id": {"type": "STRING", "description": "UUID of the candidate youth profile"},
            },
            "required": ["opportunity_id", "youth_profile_id"],
        },
    },
    {
        "name": "propose_opportunity_status_update",
        "description": "Proposes updating the status of an owned opportunity (e.g. publishing a draft, or closing a role). Creates a pending action for employer confirmation.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "opportunity_id": {"type": "STRING", "description": "UUID of the owned opportunity"},
                "status": {"type": "STRING", "enum": ["draft", "published", "closed"], "description": "New target status"},
            },
            "required": ["opportunity_id", "status"],
        },
    },
]

COUNCIL_TOOL_DEFINITIONS = [
    {
        "name": "get_my_council_overview",
        "description": "Retrieves the authenticated council's profile, total budget allocated, total spent, remaining funds, active subsidy schemes, and key deprivation focus wards.",
        "parameters": {
            "type": "OBJECT",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "search_local_smes_for_subsidy",
        "description": "Searches and filters local micro and small businesses based on sector, wage gap, company size, postcode prefix, or subsidy status.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "sector": {"type": "STRING", "description": "Filter by industry sector (e.g. Technology, Hospitality, Retail, Green Energy)"},
                "company_size": {"type": "STRING", "enum": ["all", "micro", "small", "medium"], "description": "Filter by company size"},
                "subsidy_status": {"type": "STRING", "enum": ["all", "eligible", "active_subsidised", "pledged"], "description": "Filter by subsidy eligibility/pledge status"},
                "min_catchment_score": {"type": "NUMBER", "description": "Minimum low-income catchment priority score (0-100)"},
                "search": {"type": "STRING", "description": "Keyword search across business name, address, or description"},
            },
        },
    },
    {
        "name": "assess_company_wage_subsidy",
        "description": "Performs an in-depth wage gap, living wage bridge, and social mobility assessment for a specific local business.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "business_id": {"type": "STRING", "description": "UUID of the business to assess"},
                "business_name": {"type": "STRING", "description": "Name or keyword of the business if UUID is not known"},
            },
        },
    },
    {
        "name": "draft_wage_subsidy_pledge",
        "description": "Drafts a wage subsidy allocation for a local business to co-fund young employees from low-income families at the Real Living Wage. Creates a pending action for the council officer to confirm.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "business_id": {"type": "STRING", "description": "UUID of the business receiving the grant pledge"},
                "business_name": {"type": "STRING", "description": "Name of the business if UUID is not known"},
                "scheme_id": {"type": "STRING", "description": "UUID of the subsidy scheme fund pool (optional; defaults to primary active scheme)"},
                "hourly_subsidy": {"type": "NUMBER", "description": "Hourly top-up grant in GBP (e.g. 4.50)"},
                "max_hours_per_week": {"type": "INTEGER", "description": "Maximum subsidised hours per week (e.g. 16)"},
                "duration_weeks": {"type": "INTEGER", "description": "Duration of the wage subsidy placement in weeks (e.g. 24)"},
                "notes": {"type": "STRING", "description": "Policy notes or target youth criteria for this pledge"},
            },
        },
    },
    {
        "name": "model_scheme_budget_forecast",
        "description": "Models multi-youth cohort budget projections, employer co-contribution, total youth earnings, and Treasury Green Book social mobility ROI multipliers.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "youth_count": {"type": "INTEGER", "description": "Number of young people in cohort (e.g. 10)"},
                "hourly_subsidy": {"type": "NUMBER", "description": "Hourly grant top-up rate (e.g. 4.50)"},
                "hours_per_week": {"type": "INTEGER", "description": "Hours per week per youth (e.g. 16)"},
                "duration_weeks": {"type": "INTEGER", "description": "Duration in weeks (e.g. 24)"},
                "base_employer_wage": {"type": "NUMBER", "description": "Estimated base wage paid by company (e.g. 7.00)"},
            },
            "required": ["youth_count"],
        },
    },
    {
        "name": "query_deprivation_wards",
        "description": "Retrieves demographic data for UK Index of Multiple Deprivation (IMD) target wards, low-income family percentages, and youth population estimates in the council area.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "postcode_prefix": {"type": "STRING", "description": "Optional postcode area prefix (e.g. HP5, HP6, NW1)"},
            },
        },
    },
    {
        "name": "draft_wage_subsidy_scheme",
        "description": "Proposes creating a new ring-fenced wage subsidy fund scheme. Creates a pending action for the council officer to confirm.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "title": {"type": "STRING", "description": "Scheme title (e.g. Chesham High Street Youth Bridge 2026)"},
                "description": {"type": "STRING", "description": "Policy purpose and scope of the funding scheme"},
                "total_budget": {"type": "NUMBER", "description": "Total fund allocation in GBP (e.g. 50000.0)"},
                "subsidy_rate_per_hour": {"type": "NUMBER", "description": "Hourly grant rate in GBP (e.g. 4.50)"},
                "max_hours_per_week_per_youth": {"type": "INTEGER", "description": "Weekly cap on subsidised hours (e.g. 16)"},
                "max_duration_months": {"type": "INTEGER", "description": "Max duration in months (e.g. 6)"},
                "target_postcodes": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "Target postcode areas (e.g. ['HP5 1', 'HP5 2'])"},
                "target_sectors": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "Target industry sectors (e.g. ['Retail', 'Hospitality'])"},
            },
            "required": ["title", "total_budget"],
        },
    },
]


