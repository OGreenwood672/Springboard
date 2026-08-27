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

