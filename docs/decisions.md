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
