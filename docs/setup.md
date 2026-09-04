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
├── api/                         # Vercel Serverless Function entrypoint
│   ├── index.py                 # ASGI Gateway mounting FastAPI at /api and root
│   └── requirements.txt         # Serverless Python runtime dependencies
├── apps/
│   ├── web/                     # React 18 SPA (Port 3000) for Candidates & Businesses
│   │   ├── src/context/         # AuthContext, ToastContext, ThemeContext (Dark/Light)
│   │   ├── src/features/agent/  # Job Coach AI, Recruiter AI, ConfirmationCard, UI Cards
│   │   ├── src/features/knowledge/ # Interactive Skills Knowledge Graph (@xyflow/react)
│   │   ├── src/features/council/ # Council Wage Subsidy Map (Leaflet OSM & AI appraisal)
│   │   └── src/pages/           # CandidatePortal, BusinessAssistantPage, Opportunities
│   └── council/                 # React 18 SPA (Port 5174) for Local Authority Councils
│       ├── src/features/agent/  # Council AI Policy Director Chat & Decision Cards
│       ├── src/features/map/    # Leaflet & CartoDB Geospatial Map with IMD Catchment Layers
│       └── src/pages/           # CouncilDashboardPage (Command Center), Schemes, Allocations
├── packages/
│   └── shared-types/            # Shared TypeScript domain contracts, DTOs & agent schemas
│       └── src/index.ts         # User, Opportunity, Match, CouncilMapData, Scheme schemas
├── services/
│   └── api/                     # Python 3.12+ FastAPI backend (Port 8000)
│       ├── app/agents/          # YouthAgent, BusinessAgent, CouncilAgent, ToolExecutor
│       ├── app/routers/         # Auth, Profiles, Businesses, Opportunities, Councils, Matches
│       ├── app/services/        # Deterministic Matching, Skills Graph, Wage Subsidy Ledger
│       └── tests/               # Pytest test suite (37 unit & integration tests)
├── infra/
│   └── docker-compose.yml       # PostgreSQL 16 + PostGIS 3.4 container
├── docs/                        # Technical architecture, commercial guide, decision records
├── vercel.json                  # Production Vercel deployment & rewrite configuration
└── package.json                 # Monorepo scripts & workspace definitions
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

> **Note on TypeScript Path Mappings**:
> Both `apps/web/tsconfig.json` and `apps/council/tsconfig.json` include explicit path mapping to the TypeScript source:
>
> ```json
> "paths": {
>   "@/*": ["./src/*"],
>   "@springboard/shared-types": ["../../packages/shared-types/src/index.ts"]
> }
> ```
>
> This guarantees that `tsc` and Vite resolve types directly against source definitions even on fresh clones or CI pipelines before `packages/shared-types/dist` has been generated.

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

## 4. Monorepo Script Reference

The root `package.json` provides unified commands for working across all apps and services:

| Command                  | Description                                                                                           |
| :----------------------- | :---------------------------------------------------------------------------------------------------- |
| `pnpm run dev:web`       | Starts the Candidate & Business Web Portal on [http://localhost:3000](http://localhost:3000)          |
| `pnpm run build:web`     | Compiles `@springboard/shared-types` then builds the production bundle for `apps/web`                 |
| `pnpm run test:web`      | Executes Vitest component and integration tests for `apps/web`                                        |
| `pnpm run dev:api`       | Starts the FastAPI backend with Uvicorn auto-reload on [http://localhost:8000](http://localhost:8000) |
| `pnpm run start:api`     | Starts the FastAPI backend with production Uvicorn settings                                           |
| `pnpm run test:api`      | Runs the 37-test Pytest suite against FastAPI routers, matching, and agents                           |
| `pnpm run dev:council`   | Starts the dedicated Council Portal on [http://localhost:5174](http://localhost:5174)                 |
| `pnpm run build:council` | Builds the production bundle for `apps/council`                                                       |
| `pnpm run test:council`  | Executes Vitest tests for `apps/council`                                                              |
| `pnpm run build:types`   | Compiles TypeScript declarations in `packages/shared-types`                                           |

---

## 5. Environment Variables & LLM Configuration

The API reads from `services/api/.env` (see `services/api/.env.example`):

```ini
PROJECT_NAME="Springboard UK API"
ENVIRONMENT="development"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/springboard_db"
JWT_SECRET_KEY="springboard-super-secret-uk-mvp-key-change-in-prod"
JWT_ALGORITHM="HS256"
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174"]

# Optional: Google Gemini API Key for Live Function Calling
# If left blank, the platform automatically runs in deterministic offline rule agent mode!
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-3.6-flash"
GEMINI_EMBEDDING_MODEL="gemini-embedding-001"
SEMANTIC_SKILLS_ENABLED=true
```

For the web frontend (`apps/web/.env` or Vercel environment variables):

```ini
# Optional: Set in production if API is hosted on an external domain.
# In local development or Vercel rewrites, defaults to empty / proxy.
VITE_API_BASE_URL=""
```

---

## 6. Running the Database

### Option A: Running with Docker (PostgreSQL 16 + PostGIS 3.4)

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

If PostgreSQL is not detected, Springboard automatically activates a local standalone SQLite database (`springboard.db`), creates all tables, and auto-seeds demo accounts, businesses, council schemes, and opportunities.

To explicitly re-migrate and seed the SQLite database:

```bash
cd services/api
python -m app.migrate_sqlite
```

---

## 7. Starting the Development Servers

### 1. Start the FastAPI Backend (Port 8000):

```bash
# Using the root npm script:
pnpm run dev:api

# Or directly in services/api:
cd services/api
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
```

- Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- OpenAPI JSON: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Start the Candidate & Business Web Portal (Port 3000):

```bash
pnpm run dev:web
```

- URL: [http://localhost:3000](http://localhost:3000)
- Vite proxy automatically routes `/api/*` requests to `http://localhost:8000/*`.

### 3. Start the Council Wage Subsidy Portal (Port 5174):

```bash
pnpm run dev:council
```

- URL: [http://localhost:5174](http://localhost:5174)

---

## 8. Light Mode & Dark Mode Theming

Springboard includes a persistent, dual-mode theming engine:

- **Default Theme**: Dark Mode (high-contrast agentic cyberpunk / slate palette).
- **Light Mode**: High-contrast, clean slate aesthetic with pure white cards (`#ffffff`), soft slate page background (`#f8fafc`), clean borders (`#e2e8f0`), and dark typography (`#0f172a`).
- **Theme Controls**:
  - **Desktop Header**: Click the Sun (`Sun`) / Moon (`Moon`) icon toggle located next to Profile and Sign Out.
  - **Mobile Header**: Dedicated 1-tap theme button adjacent to the hamburger icon.
  - **Mobile Drawer**: Theme toggle row with explicit mode label.
- **Persistence**: Managed by `ThemeContext.tsx`, saving preferences to `localStorage` under `'springboard_theme'` with automatic fallback to `window.matchMedia('(prefers-color-scheme: light)')`.
- **Implementation**: Applies `class="light"` or `class="dark"` and `color-scheme` to `document.documentElement`, with scoped CSS overrides in `apps/web/src/index.css`.

---

## 9. Vercel Production Deployment Guide

Springboard is pre-configured for full-stack deployment on Vercel using `vercel.json` and an ASGI serverless gateway.

### 9.1 The `vercel.json` Specification

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "pnpm --filter @springboard/shared-types build && pnpm --filter @springboard/web build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install",
  "rewrites": [
    {
      "source": "/api",
      "destination": "/api/index.py"
    },
    {
      "source": "/api/(.*)",
      "destination": "/api/index.py"
    },
    {
      "source": "/docs",
      "destination": "/api/index.py"
    },
    {
      "source": "/openapi.json",
      "destination": "/api/index.py"
    },
    {
      "source": "/health",
      "destination": "/api/index.py"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 9.2 How Vercel Deployment Operates

1. **Monorepo Build Sequence**:
   - `buildCommand` compiles `@springboard/shared-types` first, ensuring all TypeScript definitions exist.
   - Vite compiles the frontend SPA into `apps/web/dist`.
2. **Serverless Python Entrypoint (`api/index.py`)**:
   - Vercel automatically detects Python files in `/api/` and provisions serverless functions using the official `@vercel/python` runtime.
   - `api/index.py` dynamically resolves the `services/api` directory onto `sys.path`.
   - Mounts the FastAPI application at both `/api` and `/` so that API endpoints resolve seamlessly whether request paths preserve or strip the `/api` prefix.
   - `api/requirements.txt` instructs Vercel's Python builder which dependencies to install.
3. **Client-Side SPA Routing**:
   - All non-API routes (`/(.*)`) rewrite to `/index.html`, enabling React Router 6 HTML5 pushState routing for all candidate, business, and council views.
4. **Environment Variables on Vercel**:
   - Configure in **Vercel Project Settings > Environment Variables**:
     - `DATABASE_URL`: Hosted PostgreSQL connection string (or omit to let SQLite auto-initialize).
     - `JWT_SECRET_KEY`: Production secret for signing auth tokens.
     - `GEMINI_API_KEY`: Optional Gemini API key for live function calling.

---

## 10. Pre-Configured Demo Credentials & Personas

| Stakeholder Role             | Email                  | Password       | Primary Experience                                                                                |
| :--------------------------- | :--------------------- | :------------- | :------------------------------------------------------------------------------------------------ |
| **Candidate Portal**         | `youth@example.com`    | `Password123!` | **Job Coach AI** (`/coach`), **Match Matrix** (`/matches`), **Skills Graph** (`/knowledge`)       |
| **Local Business (SME)**     | `business@example.com` | `Password123!` | **Recruiter Assistant AI** (`/business/assistant`), **Opportunities** (`/business/opportunities`) |
| **Buckinghamshire Council**  | `council@example.com`  | `Password123!` | **Council Dashboard** (`/council`), **Wage Subsidy Map** (`/council/map`)                         |
| **London Borough of Camden** | `camden@example.com`   | `Password123!` | **Urban IMD Command Center** (`/council`)                                                         |

### Quick Interactive Prompts to Try:

#### For Candidates:

- _"I'm 17 living in Chesham (HP5). I know Python, Customer Service, and can work Saturdays."_
- _"Show paid part-time opportunities."_
- _"Why was Chesham Community Bike Works recommended to me?"_

#### For Local Businesses:

- _"We need two students to help at our café in Amersham on Saturday mornings, paying £11.50 per hour."_
- _"Show candidate matches for our weekend role."_

#### For Council Officers:

- _"Assess Chesham Community Bike Works wage subsidy proposal."_
- _"Model 10 youth placements at £4.50 per hour for 16 hrs a week for 24 weeks."_
- _"Show high deprivation wards and SME density in Buckinghamshire."_
- _"Pledge wage subsidy of £4.50/hr to Apex Tech Innovations for 16 hours a week."_

---

## 11. Running Automated Tests & Builds

### Backend Pytest Suite (37 Unit & Integration Tests)

```bash
# Using root command:
pnpm run test:api

# Or directly in services/api:
cd services/api
.\.venv\Scripts\pytest.exe -v
```

_Expected Output: `37 passed, 1 warning in ~9.5s (100%)`_

### Web Portal Tests (Vitest)

```bash
npx pnpm --filter @springboard/web test
```

_Expected Output: `4 test files passed, 11 tests passed`_

### Production Bundle Builds

```bash
# Build shared types and web bundle:
pnpm run build:web

# Build council portal bundle:
pnpm run build:council
```
