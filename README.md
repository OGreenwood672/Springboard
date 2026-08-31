# Springboard UK — Conversation-First Agent Platform & Council Wage Subsidy Platform

Springboard is a multi-sided economic platform dedicated to helping young people (aged 14–24) in the UK discover part-time jobs, work experience placements, and volunteering opportunities, while enabling local businesses to hire talent and empowering **UK Local Councils** to identify small businesses struggling with minimum wage affordability and subsidise youth wages in low-income family catchments.

---

## 🏛️ New: Council Wage Subsidy & Spatial Platform (`apps/council`)

UK Local Councils can now:
1. **Explore Geospatial Maps**: View local micro and small businesses color-coded by subsidy status (🟢 Active Subsidised, 🟡 Subsidy Eligible, 🔵 Pledged).
2. **Layer Low-Income Ward Catchments**: Overlay Index of Multiple Deprivation (IMD) ward bubbles (e.g. Chesham Waterside, High Wycombe Central) with low-income family percentages.
3. **Bridge Hourly Wage Gaps**: Compute the difference between SME affordable base wages (e.g. £7.00/hr) and the UK Real Living Wage (£11.44/hr) and pledge hourly top-up grants (e.g. £4.50/hr).
4. **Govern Wage Subsidy Schemes**: Create ring-fenced fund schemes, set weekly hourly caps, and track live commitments.
5. **Analyze Social Mobility ROI**: Measure local economic returns (£3.80x multiplier per £1 subsidised), youth retention rates, and hours paid at the Real Living Wage.
6. **Consult the Council AI Policy Advisor**: Ask spatial economic questions and calculate multi-placement cohort budgets.

---

## 🚀 Tech Stack & Architecture

- **Council Frontend (`apps/council`)**: React 18, TypeScript, Vite, Tailwind CSS, React Router 6, Lucide Icons, running on `http://localhost:5174`
- **Web Frontend (`apps/web`)**: React 18, TypeScript, Vite, Tailwind CSS, React Router 6, `@xyflow/react`, running on `http://localhost:5173`
- **Backend API (`services/api`)**: Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, running on `http://localhost:8000`
- **Database**: PostgreSQL 16 + PostGIS 3.4 (with cross-platform SQLite geodesic fallback for standalone & test runs).
- **Matching & Wage Engine**: Deterministic, explainable matching algorithm and hourly wage subsidy ledger.
- **Authentication**: Local email/password with Argon2 password hashing and stateless Bearer JWTs (`youth`, `business`, `council` roles).
- **Monorepo**: Managed with `pnpm` workspaces (`apps/web`, `apps/council`, `packages/shared-types`, `services/api`).

---

## 📁 Monorepo Structure

```
springboard/
├── apps/
│   ├── council/                 # Dedicated Council Wage Subsidy Portal (Port 5174)
│   │   ├── src/features/map/    # Geospatial Wage Subsidy Map & Deprivation layers
│   │   ├── src/features/subsidies/ # OfferSubsidyModal, SchemeCard, AllocationRow
│   │   └── src/pages/           # CouncilDashboard, Map, EligibleCompanies, Schemes, Analytics
│   └── web/                     # Youth & Employer Web App (Port 5173)
│       ├── src/features/agent/  # Chat interface, composers & interactive UI cards
│       └── src/pages/           # YouthCoachPage, BusinessAssistantPage & form fallbacks
├── packages/
│   └── shared-types/            # Shared TypeScript domain contracts, DTOs & Council types
├── services/
│   └── api/                     # FastAPI backend & services
│       ├── app/models/          # Council, WageSubsidyScheme, WageSubsidyAllocation, Business, etc.
│       ├── app/routers/         # /councils, /conversations, /opportunities, /profiles, /auth
│       └── app/services/        # Matching Engine, Geocoding
├── infra/
│   └── docker-compose.yml       # PostgreSQL 16 + PostGIS 3.4
├── docs/                        # Architecture, setup & decision records
└── README.md
```

---

## 🏃 How to Run the Project

### 1. Install Node Dependencies & Build Shared Types

From the root directory:

```bash
# Install workspace dependencies
npx pnpm install

# Build shared types package
npx pnpm --filter @springboard/shared-types build
```

---

### 2. Set Up the Python Backend

```bash
# Navigate to the API service directory
cd services/api

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

### 3. Start Database & Seed Initial UK Data

#### Option A: Running with Docker (PostgreSQL 16 + PostGIS)

```bash
# From repository root
docker-compose -f infra/docker-compose.yml up -d

# Run Alembic migrations (inside services/api with .venv activated)
cd services/api
alembic upgrade head

# Seed initial UK opportunities, demo councils, businesses & youth
python -m app.seed
```

#### Option B: Standalone / Zero-Config Mode

If PostgreSQL is not running, the application automatically activates a local standalone SQLite database (`springboard.db`), creates all tables including councils, schemes, allocations, conversations, and pending actions, and seeds demo UK data on startup.

---

### 4. Start the Development Servers

#### Terminal 1 — Start the FastAPI Backend:

```bash
cd services/api
# With virtual environment activated:
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
```

- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

#### Terminal 2 — Start the Youth & Employer Web Frontend:

```bash
# From the repository root
npx pnpm --filter @springboard/web dev
```

- **Youth & Employer Web App**: [http://localhost:5173](http://localhost:5173)

#### Terminal 3 — Start the Council Wage Subsidy Portal:

```bash
# From the repository root
npx pnpm --filter @springboard/council dev
```

- **Council Wage Subsidy Portal**: [http://localhost:5174](http://localhost:5174)

---

## ⚡ Demo Accounts & Portals

| Role | Email | Password | Portal URL | Primary Experience |
| :--- | :--- | :--- | :--- | :--- |
| **Local Council** | `council@example.com` | `Password123!` | [http://localhost:5174](http://localhost:5174) | **Buckinghamshire Wage Subsidy Map & Grants** |
| **London Borough** | `camden@example.com` | `Password123!` | [http://localhost:5174](http://localhost:5174) | **Camden Deprivation & SME Grants** |
| **Young Person** | `youth@example.com` | `Password123!` | [http://localhost:5173](http://localhost:5173) | **Job Coach AI & Living Wage Roles** |
| **Local Business** | `business@example.com` | `Password123!` | [http://localhost:5173](http://localhost:5173) | **Recruiter AI & Subsidy Eligibility** |

_Note: Both the Council Portal and Web App Sign-In pages contain 1-click demo login buttons for rapid testing._

---

## 🧪 Running Automated Tests

### Backend Automated Test Suite (Pytest — 36 Tests)

```bash
cd services/api
.\.venv\Scripts\pytest.exe -v
```

_Verifies council registration, geospatial map data, eligible business filters, wage subsidy scheme creation, budget deduction, grant status transitions, cancellation refunds, social mobility analytics, agent endpoints, and semantic skills._

### Frontend Automated Test Suites

```bash
# Run Council Portal Tests (Vitest)
npx pnpm --filter @springboard/council test

# Run Web App Tests (Vitest)
npx pnpm --filter @springboard/web test
```

### Production Builds

```bash
npx pnpm --filter @springboard/council build
npx pnpm --filter @springboard/web build
```

---

## 📖 Further Documentation

- **[Detailed Setup Guide](docs/setup.md)**: Configuration details, Gemini API keys, Council workflows, and demo flows.
- **[Architecture & Data Models](docs/architecture.md)**: Council data models, wage subsidy state machine, spatial PostGIS calculations, and privacy boundaries.
- **[Architecture Decision Records](docs/decisions.md)**: ADRs covering council multi-tenant architecture, wage subsidy co-funding mechanics, and agent tool execution.
