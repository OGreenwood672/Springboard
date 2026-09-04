# Architecture Decision Records (ADRs)

## ADR 001: Monorepo Structure with pnpm & Shared Types Package

- **Status**: Accepted
- **Context**: The application contains a TypeScript/React frontend and a Python/FastAPI backend, with domain contracts shared across the stack.
- **Decision**: Adopt a lightweight pnpm monorepo layout containing `apps/web` and `packages/shared-types`. Shared types are exported as TypeScript interfaces and compile directly with `pnpm build`.
- **Consequences**: Single source of truth for domain models; high type safety across frontend API clients and components.

---

## ADR 002: Cross-Platform Spatial Geo Storage (PostGIS with SQLite Fallback)

- **Status**: Accepted
- **Context**: PostGIS provides native spatial querying and indexing for production, but running local unit tests on diverse developer environments (Windows, macOS, CI) often suffers from missing native `libspatialite` C-bindings.
- **Decision**: Implement a custom SQLAlchemy `PointGeometry` type decorator and standard Geodesic distance calculation utility (`app/core/geo.py`). When running against PostgreSQL, native `geometry(Point, 4326)` is used; when running SQLite test suites, coordinates are stored and distances computed using mathematical Haversine calculations.
- **Consequences**: Zero friction for automated CI/pytest runs across any OS, while maintaining full PostgreSQL/PostGIS production capability.

---

## ADR 003: Deterministic Explainable Matching Engine vs Black-Box LLM

- **Status**: Accepted
- **Context**: Young people and employers need transparent reasons why an opportunity matches a candidate, and high-frequency scoring must be fast, cost-free, and deterministic.
- **Decision**: Build a deterministic 0–100 matching formula factoring type alignment (25%), skills match (35%), location proximity (25%), schedule availability (10%), and qualifications bonus (5%). Return the factor breakdown JSON alongside every match.
- **Consequences**: Immediate calculation speed (<10ms), zero API cost, completely predictable results, and clear explainability in the UI for candidates and employers.

---

## ADR 004: Local Email/Password with Argon2 & JWT for MVP

- **Status**: Accepted
- **Context**: The MVP requires distinct youth and business role boundaries without third-party OAuth lock-in during early local prototyping.
- **Decision**: Implement password hashing using modern Argon2 (`ph = PasswordHasher()`) and stateless Bearer JWTs signed with HMAC-SHA256. Role permissions are enforced via FastAPI dependency guards (`require_role("youth")`, `require_role("business")`).
- **Consequences**: Secure by default, no cleartext passwords stored, easily swappable for OAuth2/OIDC in subsequent releases.

---

## ADR 005: Conversation-First Agent Architecture with Allow-Listed FastAPI Tools

- **Status**: Accepted
- **Context**: Transforming the platform into a chat-led experience requires allowing the LLM to orchestrate user actions without granting it arbitrary database access, unsafe execution privileges, or the ability to hallucinate authoritative data.
- **Decision**: The LLM acts purely as a conversational orchestrator. It interacts with the platform exclusively through typed, allow-listed FastAPI tools validated with Pydantic v2 schemas (`ToolExecutor`). All data reads and writes execute through FastAPI endpoints with strict role and ownership checks.
- **Consequences**: Complete protection against SQL injection and data fabrication; guarantees that business logic, security policies, and deterministic scoring remain authoritative.

---

## ADR 006: Explicit Confirmation Gatekeeper with `PendingAction` State Machine

- **Status**: Accepted
- **Context**: Actions such as updating a profile, drafting/publishing an opportunity vacancy, or submitting a job application carry significant real-world consequences and must not be triggered accidentally or autonomously by an LLM turn.
- **Decision**: All write operations initiated in chat produce a `PendingAction` database record (status `pending`, with a 24-hour TTL) and render a structured `ConfirmationCard` in the frontend. Changes are only committed to the database when the user explicitly clicks "Confirm" or sends a direct confirmation.
- **Consequences**: Prevents accidental commits; guarantees user agency and informed consent; creates a verifiable audit trail of proposed vs confirmed state.

---

## ADR 007: Privacy-Preserving Candidate Talent Search & ICO Compliance

- **Status**: Accepted
- **Context**: UK safeguarding principles, GDPR data minimization, and ICO guidance on automated recruitment require strict privacy boundaries when employers search for young candidates.
- **Decision**: Candidate search tools and cards (`CandidateMatchCard`) expose only anonymized profile summaries (first name, education stage, general travel radius/distance, and matched skills). Private emails, home addresses, phone numbers, and protected characteristics are strictly excluded from agent tools.
- **Consequences**: Full compliance with UK data protection laws and safeguarding standards; zero risk of automated discrimination or unauthorized candidate contact.

---

## ADR 008: Dedicated Council Wage Subsidy Portal (`apps/council`) on Port 5174

- **Status**: Accepted
- **Context**: Local authority council officers have fundamentally different administrative, statutory, and audit workflows from youth candidates and business owners. Mixing council administration into `apps/web` would risk UI clutter, role leakage, and complex route guards.
- **Decision**: Scaffold a dedicated single-page application `apps/council` running independently on port 5174. It communicates with the same unified FastAPI backend (`services/api`) and consumes `@springboard/shared-types`, while enforcing strict `require_role("council")` authorization.
- **Consequences**: Complete interface separation, specialized council UX (Command Center, schemes manager, allocations ledger, ROI analytics), and clear security boundaries.

---

## ADR 009: Geospatial Wage Subsidy Cartography with Leaflet & IMD Deprivation Catchments

- **Status**: Accepted
- **Context**: Councils must target wage subsidy grants at areas of acute economic need. Text-based tables alone cannot convey spatial proximity between low-income family wards and local SME employers.
- **Decision**: Implement a Leaflet-based geospatial map engine with CartoDB Positron and Dark Matter tiles. Integrate UK Index of Multiple Deprivation (IMD) ward boundaries (Deciles 1–3) with youth population estimates and low-income household percentages. Render custom animated SVG pins reflecting wage gap metrics (`+£4.44/hr gap`).
- **Consequences**: Intuitive spatial intelligence for council officers; immediate visualization of high-priority employment deserts; seamless 1-click transition from map pin inspection to AI subsidy assessment.

---

## ADR 010: Council AI Policy & Grant Director with Ring-Fenced Budget Invariants

- **Status**: Accepted
- **Context**: Allocating public funds to private employers requires strict statutory accountability, accurate economic forecasting, and zero budget overruns.
- **Decision**: Implement a specialized `CouncilAgentOrchestrator` equipped with typed tools for SME subsidy search, cohort modeling (incorporating HM Treasury Green Book £3.80x multiplier), and grant drafting. Enforce an atomic state machine: creating an allocation automatically decrements the scheme's remaining budget; cancelling an allocation automatically refunds the amount and restores business eligibility.
- **Consequences**: Complete mathematical and financial integrity; prevents over-allocation of council budgets; provides an automated audit trail for public scrutiny.

---

## ADR 011: Dual-Theme Engine (Class-Based Scoped CSS & ThemeContext)

- **Status**: Accepted
- **Context**: While the dark agentic cyberpunk aesthetic is ideal for technical dashboards and night use, corporate council officers and accessibility guidelines require a clean, high-contrast light mode.
- **Decision**: Implement a persistent React `ThemeContext` managing `'dark' | 'light'`. Store the preference under `'springboard_theme'` with automatic fallback to `window.matchMedia('(prefers-color-scheme: light)')`. Set `darkMode: "class"` in Tailwind, and inject a comprehensive scoped CSS layer in `apps/web/src/index.css` under `html.light` overriding backgrounds (`.bg-slate-950` to `#f8fafc`, `.bg-slate-900` to `#ffffff`), borders (`#e2e8f0`), typography (`#0f172a`), form controls, and Leaflet tooltips. Add smooth 0.2s CSS transitions to `<html>`.
- **Consequences**: Instant theme switching without component refactoring or CSS-in-JS performance penalties; maintains 100% backward compatibility with existing Tailwind classes while achieving WCAG AAA contrast in light mode.

---

## ADR 012: Monorepo TypeScript Path Resolution via Source Aliasing

- **Status**: Accepted
- **Context**: On fresh clones and clean CI/Vercel deployments, `packages/shared-types/dist` does not exist because `dist/` is gitignored. When building `apps/web` with `tsc && vite build`, TypeScript failed with `TS2307: Cannot find module '@springboard/shared-types' or its corresponding type declarations`, causing cascading `TS7006: Parameter implicitly has an 'any' type` errors across components.
- **Decision**: Configure explicit TypeScript path mappings in `apps/web/tsconfig.json` and `apps/council/tsconfig.json`:
  ```json
  "paths": {
    "@/*": ["./src/*"],
    "@springboard/shared-types": ["../../packages/shared-types/src/index.ts"]
  }
  ```
  Additionally, update the root build script and `vercel.json` buildCommand to explicitly compile `@springboard/shared-types` before building web applications.
- **Consequences**: TypeScript type-checking and bundling succeed reliably on fresh clones and remote CI environments without requiring pre-compiled build artifacts; Vite and tsc share identical resolution targets.

---

## ADR 013: Dual-Mount ASGI Serverless Gateway for Vercel Deployment

- **Status**: Accepted
- **Context**: Deploying a monorepo containing a Vite React SPA and a FastAPI Python backend on Vercel requires routing both static assets and dynamic API requests. Depending on Vercel's rewrite rules, incoming request paths to serverless Python functions may retain the `/api` prefix (e.g. `/api/opportunities`) or strip it (e.g. `/opportunities`), causing 404 routing errors if FastAPI routers only listen on un-prefixed paths.
- **Decision**: Create an ASGI gateway in `api/index.py` that dynamically configures `sys.path` to include `services/api` and mounts the core FastAPI application at **both** `/api` and `/`:
  ```python
  app.mount("/api", base_app)
  app.mount("/", base_app)
  ```
  Define `vercel.json` with rewrites routing `/api`, `/api/(.*)`, `/docs`, `/openapi.json`, and `/health` to `/api/index.py`, and all remaining paths to `/index.html`.
- **Consequences**: Total resilience against URL rewriting discrepancies; seamless Swagger/OpenAPI documentation hosting on Vercel; zero-configuration deployment of full-stack Python + React on a single Vercel project domain.

---

## ADR 014: Zero-Dependency OpenStreetMap Integration & Non-Blocking AI Appraisal

- **Status**: Accepted
- **Context**: The council geospatial map initially referenced external tile services (CartoDB Dark Matter and Voyager) requiring third-party API keys, causing map loading failures on fresh deployments. Furthermore, marker clicks spawned large map popups that blocked the cartographic viewport.
- **Decision**: Standardize exclusively on OpenStreetMap public tiles requiring zero API keys. Replace map-obscuring popups with sector-categorized business markers (Tech, Health, Manufacturing, Retail, Creative, Green, Community) and pipe marker click events directly into the right-hand **AI Subsidy Scoring & Ranking** widget. Add a "Reset" view control in the header top-right aligned with the ward filter.
- **Consequences**: Immediate, reliable tile rendering without third-party key dependencies; fluid spatial UX where selecting an employer immediately opens their AI business appraisal without concealing the geospatial catchment area.

---

## ADR 015: Candidate Portal Rebranding & Negative Preference Filtering ("Not Interested")

- **Status**: Accepted
- **Context**: The label "Youth Candidate Portal" felt overly clinical and juvenile for older candidates (e.g. 21–24 year-old graduates/apprentices). Additionally, candidates lacked a mechanism to dismiss unsuitable job recommendations, leading to clutter in their Match Matrix.
- **Decision**: Rebrand the portal to **"Candidate Portal"** across all navigation bars, badges, and landing page switchers. Add a **"Not Interested"** action to vacancy cards in the Match Matrix (`/matches`) that permanently suppresses the dismissed vacancy and refines future recommendations. Update the "My Applications" empty state to link directly to `/matches`.
- **Consequences**: More professional branding welcoming young adults aged 14–24; candidate-driven recommendation curation that prevents repetitive recommendations of rejected vacancies.
