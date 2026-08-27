# Springboard UK MVP — Local Setup & Development Guide

Springboard is a conversation-first web platform designed to help young people (aged 14–24) in the UK discover part-time jobs, work experience placements, and volunteering opportunities, while empowering local businesses to post listings, search candidates, and review applicants.

---

## 1. System Prerequisites

- **Node.js**: v18+ (tested on Node v24.x)
- **pnpm**: v9+ (or via `npx pnpm`)
- **Python**: 3.12+ (tested on Python 3.13)
- **Docker & Docker Compose**: (for PostgreSQL 16 + PostGIS 3.4)

---

## 2. Monorepo Structure

```
springboard/
├── apps/
│   └── web/                     # React 18, TypeScript, Vite, Tailwind CSS SPA
│       ├── src/features/agent/  # AgentChat, ChatComposer, ConfirmationCard, UI Cards
│       └── src/pages/           # YouthCoachPage, BusinessAssistantPage, Form Fallbacks
├── packages/
│   └── shared-types/            # Shared TypeScript domain models, DTOs & Agent types
├── services/
│   └── api/                     # Python FastAPI, SQLAlchemy 2, Alembic, PostGIS
│       ├── app/agents/          # YouthAgent, BusinessAgent, ToolExecutor, Gemini API
│       ├── app/routers/         # Conversations, Opportunities, Profiles, Auth
│       └── app/services/        # Deterministic Matching Engine, Geocoding
├── infra/
│   └── docker-compose.yml       # PostgreSQL 16 + PostGIS 3.4 container
└── docs/                        # Setup, architecture, and decision records
```

---

## 3. Step-by-Step Installation

### Step 3.1: Install Node Dependencies & Build Shared Types

From the repository root:

```bash
# Install all monorepo workspace dependencies
npx pnpm install

# Build shared types package
npx pnpm --filter @springboard/shared-types build
```

### Step 3.2: Set Up Python Virtual Environment & Dependencies

```bash
cd services/api

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.\.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

# Install Python requirements
pip install -r requirements.txt
```

---

## 4. Environment Variables & LLM Configuration

The API uses `services/api/.env` (see `services/api/.env.example`):

```ini
PROJECT_NAME="Springboard UK API"
ENVIRONMENT="development"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/springboard_db"
JWT_SECRET_KEY="springboard-super-secret-uk-mvp-key-change-in-prod"
JWT_ALGORITHM="HS256"

# Optional: Google Gemini API Key for LLM Tool Calling
# If left blank, the platform automatically runs in deterministic offline mock agent mode!
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.5-flash"
```

---

## 5. Running the Database & Migrations

### Option A: Running with Docker (PostgreSQL + PostGIS)

```bash
# Start PostGIS container
docker-compose -f infra/docker-compose.yml up -d

# Run Alembic migrations
cd services/api
alembic upgrade head

# Seed initial UK data
python -m app.seed
```

### Option B: Zero-Config Standalone SQLite Fallback

If PostgreSQL is not running, the application automatically activates a local standalone SQLite database (`springboard.db`), creates all tables including conversations and pending actions, and seeds demo UK data on startup.

---

## 6. Starting the Development Servers

### Start the FastAPI Backend:

```bash
cd services/api
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
```

- API Docs (Swagger UI): `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Start the React Frontend:

```bash
# In another terminal from repository root
npx pnpm --filter @springboard/web dev
```

- Web Application: `http://localhost:5173`

---

## 7. Pre-Configured Demo Credentials & Chat Flows

| Role | Email | Password | Primary Experience |
| :--- | :--- | :--- | :--- |
| **Youth Candidate** | `youth@example.com` | `Password123!` | **Job Coach AI** (`/coach`) |
| **Business / Org** | `business@example.com` | `Password123!` | **Recruiter Assistant AI** (`/business/assistant`) |

### Example Youth Job Coach Chat Prompts:
1. *"I'm 17 in sixth form in Chesham (HP5). I know Python, Customer Service, and can work weekends."* (Agent extracts attributes and outputs a profile confirmation card)
2. *"Show paid part-time roles"* (Agent searches and presents opportunity cards with match score breakdown)
3. *"Why is the Café Assistant recommended?"* (Agent explains deterministic type, skills, and proximity factors)
4. *"Apply for the Junior Web Developer role"* (Agent drafts an application and asks for confirmation)

### Example Business Recruiter Chat Prompts:
1. *"We need two students to help at our café in Amersham on Saturday mornings, paying £11.50 per hour."* (Agent drafts vacancy and presents preview card)
2. *"Show candidate matches for our weekend role"* (Agent searches anonymized candidate matches with match scores)
3. *"Explain candidate match factors"* (Agent breaks down candidate score factors)

---

## 8. Running Automated Tests

### Backend Test Suite (Pytest — 24 Tests)

```bash
cd services/api
.\.venv\Scripts\pytest.exe -v
```

### Frontend Test Suite (Vitest — 6 Tests)

```bash
npx pnpm --filter @springboard/web test
```

### Frontend Production Build

```bash
npx pnpm --filter @springboard/web build
```

---

## 9. Connecting Google Gemini API (Instructions)

Springboard features a **dual-mode agent architecture**:
- **Offline / Standalone Mode (Default)**: When `GEMINI_API_KEY` is not provided (or empty), the platform runs a local rule-based intent router that invokes the exact same typed tools, creates identical pending action cards, and functions 100% offline with zero external network requests.
- **Live Gemini Agent Mode**: When `GEMINI_API_KEY` is configured, Springboard connects to Google Gemini via the official `google-genai` SDK, using native function calling and structured tool declarations.

### Step 1: Obtain a Gemini API Key
1. Go to the [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **Get API key** in the top navigation.
4. Click **Create API key** (select a Google Cloud project or create a default project).
5. Copy your generated key (starts with `AIzaSy...`).

### Step 2: Configure Environment Variables in the API Service
Open `services/api/.env` (or copy from `services/api/.env.example` if `.env` does not exist yet):

```ini
# services/api/.env

# Paste your Google AI Studio API key here
GEMINI_API_KEY="AIzaSyYourGeneratedGeminiKeyHere"

# Choose your preferred Gemini model (defaults to gemini-2.5-flash)
GEMINI_MODEL="gemini-2.5-flash"
```

### Step 3: Supported Gemini Models
The following models are supported out of the box:
- `gemini-2.5-flash` (**Recommended**): High speed, low latency, native tool calling, optimized for multi-turn assistant dialogues.
- `gemini-2.0-flash`: General-purpose fast model.
- `gemini-1.5-flash`: Legacy stable version.

### Step 4: Restart the FastAPI Server
Restart your FastAPI backend server to load the new environment variables:

```bash
cd services/api
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
```

### Step 5: Verify Live Function Calling
1. Open the frontend at `http://localhost:5173/coach`.
2. Sign in as `youth@example.com` (`Password123!`).
3. Send a natural English prompt:
   > *"Hi! I'm 17 years old, live in Chesham (postcode HP5 2UR), studying for my A-Levels. I know Python, Customer Service, and can work on Saturdays. What roles do you recommend?"*
4. Observe that Gemini invokes `propose_youth_profile_update` with structured arguments, generating the interactive review card, and then invokes `get_my_recommended_opportunities` to retrieve personalized listings.

### Automatic Fallback & Safety Guarantees
- **Graceful Degradation**: If the Gemini API returns a rate-limit error (`429`), invalid key error, or network timeout, the application automatically catches the exception, logs a warning in the server console, and seamlessly falls back to the deterministic local orchestrator. The user's chat session is never interrupted.
- **Strict Role Authorization**: Gemini cannot access or execute any function that is not in the allow-list for the user's role.
- **No Direct Database Access**: Gemini only receives typed tool inputs and outputs. Database reads/writes are performed solely by FastAPI and SQLAlchemy with full validation.
