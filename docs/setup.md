# Springboard UK — Local Setup & Developer Guide

Springboard is a conversation-first web platform and geospatial wage subsidy engine connecting young people (aged 14–24), local businesses, and UK Local Authorities to unlock Real Living Wage employment.

---

## 1. System Prerequisites

- **Node.js**: v18+ (tested on Node v20.x, v22.x, v24.x)
- **pnpm**: v9+ (or invoke via `npx pnpm`)
- **Python**: 3.12+ (tested on Python 3.13)
- **Docker & Docker Compose**: (Optional; for PostgreSQL 16 + PostGIS 3.4. If Docker is omitted, Springboard automatically runs on its zero-config SQLite standalone database).

---

## 2. Monorepo Structure

```
springboard/
├── apps/
│   ├── web/                     # React 18 SPA (Port 5173) for Youth Candidates & Businesses
│   │   ├── src/features/agent/  # Job Coach AI, Recruiter AI, ConfirmationCard, UI Cards
│   │   ├── src/features/knowledge/ # Interactive Skills Knowledge Graph (@xyflow/react)
│   │   └── src/pages/           # YouthCoachPage, BusinessAssistantPage, Opportunities
│   └── council/                 # React 18 SPA (Port 5174) for Local Authority Councils
│       ├── src/features/agent/  # Council AI Policy Director Chat & Decision Cards
│       ├── src/features/map/    # Leaflet & CartoDB Geospatial Map with IMD Catchment Layers
│       └── src/pages/           # CouncilDashboardPage (Command Center), Schemes, Allocations
├── packages/
│   └── shared-types/            # Shared TypeScript domain contracts, DTOs & agent schemas
├── services/
│   └── api/                     # Python 3.12+ FastAPI backend (Port 8000)
│       ├── app/agents/          # YouthAgent, BusinessAgent, CouncilAgent, ToolExecutor
│       ├── app/routers/         # Auth, Profiles, Businesses, Opportunities, Councils, Matches
│       ├── app/services/        # Deterministic Matching, Skills Graph, Wage Subsidy Ledger
│       └── tests/               # Pytest test suite (37 unit & integration tests)
├── infra/
│   └── docker-compose.yml       # PostgreSQL 16 + PostGIS 3.4 container
└── docs/                        # Technical architecture, commercial guide, decision records
```

---

## 3. Step-by-Step Installation

### Step 3.1: Install Node Dependencies & Build Shared Types

From the repository root:

```bash
# Install monorepo workspace dependencies
npx pnpm install

# Build shared types package
npx pnpm --filter @springboard/shared-types build
```

### Step 3.2: Set Up Python Virtual Environment & Dependencies

```bash
cd services/api

# Create and activate virtual environment
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On macOS / Linux:
source .venv/bin/activate

# Install Python requirements
pip install -r requirements.txt
```

---

## 4. Environment Variables & LLM Configuration

The API reads from `services/api/.env` (see `services/api/.env.example`):

```ini
PROJECT_NAME="Springboard UK API"
ENVIRONMENT="development"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/springboard_db"
JWT_SECRET_KEY="springboard-super-secret-uk-mvp-key-change-in-prod"
JWT_ALGORITHM="HS256"
CORS_ORIGINS=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"]

# Optional: Google Gemini API Key for Live Function Calling
# If left blank, the platform automatically runs in deterministic offline rule agent mode!
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-3.6-flash"
GEMINI_EMBEDDING_MODEL="gemini-embedding-001"
SEMANTIC_SKILLS_ENABLED=true
```

---

## 5. Running the Database

### Option A: Running with Docker (PostgreSQL + PostGIS)

```bash
# Start PostGIS container
docker-compose -f infra/docker-compose.yml up -d

# Run database migrations
cd services/api
alembic upgrade head

# Seed demo UK data
python -m app.seed
```

### Option B: Zero-Config Standalone SQLite Fallback (Default)

If PostgreSQL is not detected, Springboard automatically falls back to a local standalone SQLite database (`springboard.db`), creates all tables, and auto-seeds all demo accounts, businesses, council schemes, and opportunities.

To explicitly migrate and seed the SQLite database:
```bash
cd services/api
python -m app.migrate_sqlite
```

---

## 6. Starting the Development Servers

You will run three development servers:

### 1. Start the FastAPI Backend (Port 8000):

```bash
cd services/api
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Start the Youth & Business Web Portal (Port 5173):

```bash
# In another terminal from repository root
npx pnpm --filter @springboard/web dev
```
- URL: [http://localhost:5173](http://localhost:5173)

### 3. Start the Council Wage Subsidy Portal (Port 5174):

```bash
# In another terminal from repository root
npx pnpm --filter @springboard/council dev
```
- URL: [http://localhost:5174](http://localhost:5174)

---

## 7. Pre-Configured Demo Credentials & Personas

| Stakeholder Role | Email | Password | Primary Experience |
| :--- | :--- | :--- | :--- |
| **Youth Candidate** | `youth@example.com` | `Password123!` | **Job Coach AI** (`/coach`) & **Knowledge Graph** (`/knowledge`) |
| **Local Business (SME)** | `business@example.com` | `Password123!` | **Recruiter Assistant AI** (`/business/assistant`) |
| **Buckinghamshire Council** | `council@example.com` | `Password123!` | **Council Command Center** (`http://localhost:5174`) |
| **London Borough of Camden** | `camden@example.com` | `Password123!` | **Urban IMD Command Center** (`http://localhost:5174`) |

### Quick Interactive Prompts to Try:

#### For Youth Candidates:
- *"I'm 17 living in Chesham (HP5). I know Python, Customer Service, and can work Saturdays."*
- *"Show paid part-time opportunities."*
- *"Why was Chesham Community Bike Works recommended to me?"*

#### For Local Businesses:
- *"We need two students to help at our café in Amersham on Saturday mornings, paying £11.50 per hour."*
- *"Show candidate matches for our weekend role."*

#### For Council Officers:
- *"Assess Chesham Community Bike Works wage subsidy proposal."*
- *"Model 10 youth placements at £4.50 per hour for 16 hrs a week for 24 weeks."*
- *"Show high deprivation wards and SME density in Buckinghamshire."*
- *"Pledge wage subsidy of £4.50/hr to Apex Tech Innovations for 16 hours a week."*

---

## 8. Running Automated Tests & Builds

### Backend Pytest Suite (37 Unit & Integration Tests)
```bash
cd services/api
.\.venv\Scripts\pytest.exe -v
```
*Expected Output: `37 passed in ~4.5s (100%)`*

### Web Portal Tests (11 Vitest Tests)
```bash
npx pnpm --filter @springboard/web test
```
*Expected Output: `4 test files passed, 11 tests passed`*

### Council Portal Tests (Vitest)
```bash
npx pnpm --filter @springboard/council test
```
*Expected Output: `1 test file passed, 1 test passed`*

### Production Builds
```bash
# Build web portal
npx pnpm --filter @springboard/web build

# Build council portal
npx pnpm --filter @springboard/council build
```
