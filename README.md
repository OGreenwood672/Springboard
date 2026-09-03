# Springboard UK — Conversation-First Social Mobility & Council Wage Subsidy Platform

> **The UK's Tripartite Economic Engine Connecting Youth (14–24), Local Small Businesses, and Local Councils.**  
> *Bridging the minimum wage gap with council hourly grants to unlock Real Living Wage employment and local economic resilience.*

---

## 🌟 Executive Overview

Springboard solves the UK entry-level employment crisis through a three-sided economic platform:
1. **Young People (Ages 14–24)** discover part-time jobs, work experience, and volunteering through an **AI Job Coach** and visual **Skills Knowledge Graph**, receiving the full UK Real Living Wage (£11.44+/hr).
2. **Local Micro & Small Businesses (SMEs)** post roles via an **AI Recruiter Assistant** and hire keen local talent by paying only the base wage they can afford (e.g. £7.00/hr).
3. **UK Local Authorities (Councils)** use a **Geospatial Command Center** and **AI Policy Director** to identify high-deprivation ward wage gaps and pledge ring-fenced hourly top-up grants (e.g. £4.50/hr), achieving a verified **£3.80x local economic return** under HM Treasury Green Book standards.

---

## 🏛️ System Components & Portals

```
┌────────────────────────────────────────────────────────┐   ┌────────────────────────────────────────────────────────┐
│             apps/web (Port 5173)                       │   │             apps/council (Port 5174)                   │
│   Youth Candidates & Local SME Employers               │   │   Local Authority Council Officers & Leadership        │
│   • Job Coach AI (/coach)                              │   │   • Split-Screen Command Center                        │
│   • Interactive Skills Knowledge Graph (/knowledge)    │   │   • Leaflet & CartoDB Geospatial Map (Dark/Light)      │
│   • Recruiter Assistant AI (/business/assistant)       │   │   • Council AI Policy & Grant Director Chat            │
│   • Applications & Opportunity Management              │   │   • IMD Deprivation Catchment Layer & Subsidy Ledger   │
└───────────────────────────┬────────────────────────────┘   └───────────────────────────┬────────────────────────────┘
                            │                                                            │
                            └─────────────────────────────┬──────────────────────────────┘
                                                          │ JSON REST API (Bearer JWT)
                            ┌─────────────────────────────▼──────────────────────────────┐
                            │               services/api (Port 8000)                     │
                            │   FastAPI • SQLAlchemy 2 • PostGIS • Dual-Mode Gemini AI   │
                            └────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

- **Split-Screen Council Command Center**:
  - Left (58%): High-fidelity Leaflet map with Dark Matter & Positron Light tiles, UK Index of Multiple Deprivation (IMD) deciles, pulsating SME status pins, and live wage gap tags (`+£4.44/hr gap`).
  - Right (42%): Council AI Policy Director with multi-turn reasoning, cohort economic modeling, and grant drafting.
- **Hourly Wage Subsidy Co-Funding Engine**:
  - Bridges the gap between SME affordability (£7.00/hr) and Real Living Wage (£11.44/hr).
  - Atomic state machine with scheme budget deduction, live commitment tracking, and cancellation refund invariants.
- **Conversational AI Layer with Zero Hallucination Risk**:
  - Dual-mode agents powered by Google Gemini (with deterministic offline rule fallback).
  - Strict human-in-the-loop: write operations generate `PendingAction` records requiring explicit user confirmation.
  - LLM has zero direct SQL or execution access; all actions route through typed Pydantic v2 tools.
- **Deterministic 0–100 Matching Engine**:
  - Transparent mathematical formula: Opportunity Type (25%) + Skills Overlap (35%) + Geodesic Proximity (25%) + Availability (10%) + Qualifications (5%).
- **Interactive Skills Knowledge Graph (`@xyflow/react`)**:
  - Visual node-edge graph illustrating how young people's skills map to local job opportunities, with dynamic "Frontier Skills" expansion.

---

## 🏃 Quick Start (3 Terminals)

### 1. Monorepo Setup:
```bash
# Install all workspace dependencies
npx pnpm install

# Build shared types package
npx pnpm --filter @springboard/shared-types build
```

### 2. Start Backend (Terminal 1 — Port 8000):
```bash
cd services/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

# Run server (runs zero-config SQLite standalone by default)
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
```
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Start Youth & Business App (Terminal 2 — Port 5173):
```bash
npx pnpm --filter @springboard/web dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

### 4. Start Council Command Center (Terminal 3 — Port 5174):
```bash
npx pnpm --filter @springboard/council dev
```
- Council Portal: [http://localhost:5174](http://localhost:5174)

---

## ⚡ Demo Accounts (1-Click Login Enabled)

| Stakeholder Role | Email | Password | Portal URL | Primary Experience |
| :--- | :--- | :--- | :--- | :--- |
| **Buckinghamshire Council** | `council@example.com` | `Password123!` | [http://localhost:5174](http://localhost:5174) | **Command Center, Leaflet Map & AI Director** |
| **London Borough of Camden** | `camden@example.com` | `Password123!` | [http://localhost:5174](http://localhost:5174) | **Urban IMD Deprivation & SME Grants** |
| **Youth Candidate** | `youth@example.com` | `Password123!` | [http://localhost:5173](http://localhost:5173) | **Job Coach AI & Skills Knowledge Graph** |
| **Local SME Business** | `business@example.com` | `Password123!` | [http://localhost:5173](http://localhost:5173) | **Recruiter Assistant AI & Wage Eligibility** |

---

## 🧪 Automated Test Verification

```bash
# 1. Backend Pytest Suite (37 Tests — 100% Passing)
cd services/api
.\.venv\Scripts\pytest.exe -v

# 2. Council Portal Vitest Suite
npx pnpm --filter @springboard/council test

# 3. Web App Vitest Suite (11 Tests)
npx pnpm --filter @springboard/web test

# 4. Production Bundles
npx pnpm --filter @springboard/web build
npx pnpm --filter @springboard/council build
```

---

## 📚 Complete Documentation Suite

- **[Product & Commercialization Guide (Pitch & Market)](docs/product_and_commercial.md)**: Executive pitch, UK market trilemma, £3.80 HM Treasury Green Book ROI model, funding channels (UKSPF, S106), commercial SaaS pricing, and 10-slide pitch deck.
- **[Technical Architecture & System Design](docs/architecture.md)**: End-to-end multi-tenant architecture, dual-mode agent engine, deterministic matching formula, wage subsidy state machine, PostGIS spatial indexing, and security boundaries.
- **[Local Setup & Developer Guide](docs/setup.md)**: Step-by-step developer guide, Gemini API setup, environment variables, and Docker PostGIS instructions.
- **[Architecture Decision Records (ADRs)](docs/decisions.md)**: ADRs 001 through 010 detailing monorepo design, spatial storage, deterministic scoring, agent tool allow-listing, pending actions, and council architecture.
