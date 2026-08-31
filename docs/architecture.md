# Springboard UK MVP — Architecture & Technical Design

## 1. System Overview

Springboard is a multi-sided economic and opportunity platform dedicated to unlocking part-time work, work experience placements, and volunteering opportunities for young people across the UK. It bridges youth candidates, local businesses, and **UK Local Councils** through interactive AI agents, transparent deterministic matching algorithms, and a spatial wage subsidy platform.

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     React 18 SPA (apps/web)     │       │   Council Portal (apps/council) │
│     Port 5173 • Youth & SME     │       │   Port 5174 • Local Councils    │
│  AgentChat • Knowledge • Forms  │       │  Geospatial Map • Wage Grants   │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      │ JSON / REST (Bearer JWT)
                 ┌────────────────────▼────────────────────┐
                 │       FastAPI Backend (services/api)    │
                 │ Routers: Auth, Profiles, Businesses,    │
                 │          Opportunities, Apps, Matches,  │
                 │          Conversations, Councils        │
                 │ Agents: YouthAgent, BusinessAgent,      │
                 │         ToolExecutor, Policy Advisor    │
                 │ Services: Matching, Geocoding, Subsidy  │
                 └────────────────────┬────────────────────┘
                                      │ SQLAlchemy 2 ORM
                 ┌────────────────────▼────────────────────┐
                 │       PostgreSQL 16 + PostGIS 3.4       │
                 │  Spatial Geo-points • Geodesic Radius   │
                 │  (Auto-fallback to SQLite in standalone)│
                 └─────────────────────────────────────────┘
```

---

## 2. Core Domain Data Model

```mermaid
erDiagram
    USERS ||--o| YOUTH_PROFILES : "has one (if youth)"
    USERS ||--o| BUSINESSES : "has one (if business)"
    USERS ||--o| COUNCILS : "has one (if council)"
    USERS ||--o{ CONVERSATIONS : "owns"
    USERS ||--o{ PENDING_ACTIONS : "initiates"
    CONVERSATIONS ||--o{ CONVERSATION_MESSAGES : "contains"
    CONVERSATIONS ||--o{ PENDING_ACTIONS : "triggers"
    YOUTH_PROFILES ||--o{ YOUTH_QUALIFICATIONS : "holds"
    YOUTH_PROFILES ||--o{ APPLICATIONS : "submits"
    YOUTH_PROFILES ||--o{ MATCHES : "receives"
    YOUTH_PROFILES ||--o{ WAGE_SUBSIDY_ALLOCATIONS : "benefits from"
    BUSINESSES ||--o{ OPPORTUNITIES : "creates"
    BUSINESSES ||--o{ WAGE_SUBSIDY_ALLOCATIONS : "receives grant"
    COUNCILS ||--o{ WAGE_SUBSIDY_SCHEMES : "funds"
    COUNCILS ||--o{ WAGE_SUBSIDY_ALLOCATIONS : "commits pledge"
    WAGE_SUBSIDY_SCHEMES ||--o{ WAGE_SUBSIDY_ALLOCATIONS : "draws from"
    OPPORTUNITIES ||--o{ APPLICATIONS : "receives"
    OPPORTUNITIES ||--o{ MATCHES : "generates"

    USERS {
        uuid id PK
        string email
        string password_hash
        string role "youth | business | council"
    }

    COUNCILS {
        uuid id PK
        uuid user_id FK
        string name
        string council_type "unitary | county | district | london_borough | metropolitan"
        string region
        string contact_name
        string contact_email
        string postcode
        point location
        jsonb deprivation_focus_areas
        float total_budget_allocated
        float total_budget_spent
    }

    WAGE_SUBSIDY_SCHEMES {
        uuid id PK
        uuid council_id FK
        string title
        text description
        float total_budget
        float remaining_budget
        float subsidy_rate_per_hour
        int max_hours_per_week_per_youth
        int max_duration_months
        jsonb target_postcodes
        jsonb target_sectors
        boolean is_active
        jsonb eligibility_criteria
    }

    WAGE_SUBSIDY_ALLOCATIONS {
        uuid id PK
        uuid scheme_id FK
        uuid council_id FK
        uuid business_id FK
        uuid opportunity_id FK
        uuid youth_profile_id FK
        float allocated_amount
        float hourly_subsidy
        int max_hours_per_week
        int duration_weeks
        string status "pledged | approved | active | completed | cancelled"
        text notes
    }

    YOUTH_PROFILES {
        uuid id PK
        uuid user_id FK
        string full_name
        string education_stage "secondary | sixth_form | college | university | other"
        string postcode
        point location
        int max_travel_km
        jsonb skills
        jsonb interests
        jsonb availability
        jsonb preferred_opportunity_types
        boolean is_low_income_eligible
        string household_income_bracket
        boolean pupil_premium_recipient
    }

    BUSINESSES {
        uuid id PK
        uuid user_id FK
        string name
        string organisation_type
        string company_size "micro | small | medium | large"
        int employee_count
        boolean wage_subsidy_eligible
        string wage_subsidy_status "eligible | pledged | approved | active_subsidised | ineligible"
        float low_income_catchment_score
        float hourly_wage_gap
        float current_wage_offered
        float target_wage
        boolean youth_mentorship_commitment
        string address
        string postcode
        point location
    }

    OPPORTUNITIES {
        uuid id PK
        uuid business_id FK
        string title
        string opportunity_type "part_time_job | work_experience | volunteering"
        string workplace_type "in_person | hybrid | remote"
        string pay_info
        boolean wage_subsidy_applied
        float hourly_wage_subsidised
        string status "draft | published | closed"
    }
```

---

## 3. Wage Subsidy Co-Funding Mechanics

### The SME Affordability Gap
Small and micro businesses (cafés, independent shops, repair workshops, digital studios) often operate on narrow margins and struggle to afford the UK National Living Wage (£11.44/hr). Without co-funding, they cannot create formal youth jobs or take on 16–18 year olds from low-income backgrounds.

### Council Top-up Formula
- **Company Affordable Base Wage**: e.g., £7.00/hr
- **Target Real Living Wage**: £11.44/hr
- **Hourly Wage Gap**: £4.44/hr
- **Council Subsidy Grant**: £4.50/hr top-up
- **Youth Total Earnings**: £11.50/hr (Exceeds Real Living Wage)

### Grant Commitment Formula
$$\text{Total Grant Allocation} = \text{Hourly Subsidy} \times \text{Hours/Week} \times \text{Duration (Weeks)}$$
*Example: £4.50/hr × 16 hrs/wk × 24 weeks = **£1,728.00 total ring-fenced grant commitment**.*

### State Machine & Budget Invariants
1. **Creation (`POST /councils/allocations`)**:
   - Deducts `allocated_amount` from `WageSubsidyScheme.remaining_budget`.
   - Increments `Council.total_budget_spent`.
   - Sets `Business.wage_subsidy_status = "active_subsidised"`.
   - Sets allocation `status = "active"`.
2. **Cancellation (`PATCH /councils/allocations/{id}` with `status = "cancelled"`)**:
   - Refunds `allocated_amount` back to `WageSubsidyScheme.remaining_budget`.
   - Decrements `Council.total_budget_spent`.
   - If no other active subsidies exist, resets `Business.wage_subsidy_status = "eligible"`.

---

## 4. Geospatial & Deprivation Catchment Intelligence

### Spatial Projection
Both `Council` and `Business` records store exact WGS84 coordinates (`latitude`, `longitude`) and PostGIS Geometry points.
- On **PostgreSQL**: uses `ST_SetSRID(ST_MakePoint(lon, lat), 4326)`.
- On **SQLite**: uses Haversine geodesic calculations.

### Deprivation Overlay
The Council platform incorporates UK **Index of Multiple Deprivation (IMD)** ward boundaries with youth population estimates and low-income family percentages (e.g. Chesham Waterside, High Wycombe Central). Councils can filter businesses that overlap these priority youth catchments.
