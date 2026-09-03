# Springboard UK — Product Roadmap & Future Innovations

This document tracks completed milestones, near-term enhancements, and long-term vision for the Springboard platform.

---

## 🏁 Milestone 1: Core Tripartite Platform (Completed)

- [x] **Conversation-First Job Coach AI (`/coach`)**: Natural language onboarding, profile extraction, and opportunity recommendations.
- [x] **Recruiter Assistant AI (`/business/assistant`)**: Plain-English vacancy creator and anonymized candidate search.
- [x] **Interactive Skills Knowledge Graph (`/knowledge`)**: Built with `@xyflow/react`, mapping skills to jobs and expanding frontier skills.
- [x] **Deterministic 0–100 Matching Engine**: Explainable compatibility scoring factoring type, skills, location, availability, and qualifications.
- [x] **Dedicated Council Portal (`apps/council`)**: Independent SPA on Port 5174 with strict role-based access.
- [x] **Geospatial Command Center**: Leaflet & CartoDB tile integration (Dark/Light themes), pulsating status pins, and IMD deprivation ward overlays.
- [x] **Hourly Wage Subsidy Co-Funding Ledger**: SME base wage + council top-up = Real Living Wage (£11.44+/hr) with atomic budget deduction and refund invariants.
- [x] **Council AI Policy & Grant Director**: Multi-turn agent modeling cohort economic scenarios with HM Treasury Green Book £3.80x multiplier.
- [x] **Strict Human-in-the-Loop Gatekeeper**: `PendingAction` state machine requiring explicit confirmation for all writes.

---

## 🚀 Milestone 2: Automated Payments & Statutory Integrations (Near-Term)

- [ ] **Automated Grant Disbursement via BACS / Open Banking**:
  - Direct integration with council financial management systems (e.g. Civica, Agresso, SAP) to execute automated monthly top-up disbursements to approved SME payroll accounts.
- [ ] **Digital Timesheet & Attendance Verification**:
  - Lightweight SMS / mobile check-in for youth workers to log weekly hours (e.g. 16 hrs/wk), prompting automated employer sign-off before subsidy release.
- [ ] **Section 106 & UKSPF Automated Reporting**:
  - 1-click PDF/CSV export formatted to standard Department for Levelling Up, Housing and Communities (DLUHC) statutory reporting templates.

---

## 🔮 Milestone 3: National Data & Education Ecosystem (Medium-Term)

- [ ] **DfE & National Careers Service Integration**:
  - Connect with school pupil database (SIMS / Arbor) to seamlessly verify Pupil Premium and Free School Meals eligibility without stigmatizing paperwork.
- [ ] **Real-Time ONS & Labor Market Insights (LMI)**:
  - Ingest regional vacancy trends from the Office for National Statistics (ONS) to guide councils on which vocational skills face acute local shortages.
- [ ] **Micro-Credentials & Digital Badging**:
  - Issue verifiable open badges for completed placements and on-the-job competencies (e.g. Food Hygiene, Python Fundamentals, Customer Care).

---

## 📱 Milestone 4: Native Mobile Experience & Enterprise (Long-Term)

- [ ] **Springboard Youth Mobile App (iOS / Android)**:
  - Native push notifications for newly subsidized local shifts within walking or bus distance.
  - In-app mentor messaging and shift swap functionality.
- [ ] **Combined Authority Multi-Council Federation**:
  - Centralized dashboard for Combined Authorities (e.g. Greater Manchester, West Midlands) to monitor youth wage subsidies across all constituent borough councils.
