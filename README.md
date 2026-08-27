# Springboard UK — Conversation-First Agent Platform

Springboard is a conversation-first web platform dedicated to helping young people (aged 14–24) in the UK discover part-time jobs, work experience placements, and volunteering opportunities, while enabling local businesses and organisations to post listings, search candidates, and explore algorithmically matched talent.

---

## 🚀 Tech Stack & Agent Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router 6, Lucide Icons
  - **Agent Features**: Interactive AI Chat (`AgentChat`), dynamic embedded UI cards (`ConfirmationCard`, `OpportunityRecommendationCard`, `CandidateMatchCard`, `ProfileSummaryCard`, `OpportunityDraftCard`), and secondary form fallbacks.
- **Backend**: Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic
  - **Agent Engine**: Dual-mode agent orchestrator (`YouthAgent`, `BusinessAgent`, `ToolExecutor`, `ConversationService`) with typed Google Gemini function-calling and deterministic offline fallback.
- **Database**: PostgreSQL 16 + PostGIS 3.4 (with cross-platform SQLite geodesic fallback for standalone & test runs).
- **Matching Engine**: Deterministic, explainable 0–100% compatibility algorithm factoring opportunity type, skills overlap, travel radius (km), and availability.
- **Authentication**: Local email/password with Argon2 password hashing and stateless Bearer JWTs.
- **Architecture**: Monorepo managed with `pnpm` workspaces (`apps/web`, `packages/shared-types`, `services/api`).

---

## 📁 Monorepo Structure

```
springboard/
├── apps/
│   └── web/                     # React 18 + Vite SPA
│       ├── src/features/agent/  # Chat interface, composers & interactive UI cards
│       └── src/pages/           # YouthCoachPage, BusinessAssistantPage & form fallbacks
├── packages/
│   └── shared-types/            # Shared TypeScript domain contracts & agent DTOs
├── services/
│   └── api/                     # FastAPI backend & services
│       ├── app/agents/          # Youth & Business agents, ToolExecutor, prompts, schemas
│       ├── app/routers/         # Conversations, opportunities, profiles, applications
│       └── app/services/        # Deterministic Matching Engine, Geocoding
├── infra/
│   └── docker-compose.yml       # PostgreSQL 16 + PostGIS 3.4
├── docs/                        # Architecture, setup & decision records
│   ├── setup.md
│   ├── architecture.md
│   └── decisions.md
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

# Seed initial UK opportunities & demo accounts
python -m app.seed
```

#### Option B: Standalone / Zero-Config Mode

If PostgreSQL is not running, the application automatically activates a local standalone SQLite database (`springboard.db`), creates all tables including conversations and pending actions, and seeds demo UK data on startup.

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

#### Terminal 2 — Start the React Web Frontend:

```bash
# From the repository root
npx pnpm --filter @springboard/web dev
```

- **Web Application**: [http://localhost:5173](http://localhost:5173)

---

## ⚡ Demo Accounts & Agent Experiences

| Role | Email | Password | Primary Experience |
| :--- | :--- | :--- | :--- |
| **Young Person** | `youth@example.com` | `Password123!` | **Job Coach AI** (`/coach`) |
| **Organisation** | `business@example.com` | `Password123!` | **Recruiter Assistant AI** (`/business/assistant`) |

_Note: The frontend Sign-In page contains 1-click demo login buttons for rapid testing._

---

## 🧪 Running Automated Tests

### Backend Automated Test Suite (Pytest — 24 Tests)

```bash
cd services/api
.\.venv\Scripts\pytest.exe -v
```

_Verifies authentication, role permissions, conversation models, pending action confirmations, tool authorization, deterministic matching, and agent endpoints._

### Frontend Automated Test Suite (Vitest — 6 Tests)

```bash
npx pnpm --filter @springboard/web test
```

### Frontend Production Build

```bash
npx pnpm --filter @springboard/web build
```

---

## 📖 Further Documentation

- **[Detailed Setup Guide](docs/setup.md)**: Configuration details, Gemini API keys, and demo chat flows.
- **[Architecture & Data Models](docs/architecture.md)**: Agent tool lifecycle, confirmation state machine, spatial PostGIS calculations, and privacy boundaries.
- **[Architecture Decision Records](docs/decisions.md)**: ADRs covering agent tool execution, pending action gatekeeper, and privacy-preserving candidate search.
