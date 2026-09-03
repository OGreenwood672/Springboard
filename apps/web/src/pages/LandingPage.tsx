import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Coins,
  ShieldCheck,
  Building2,
  Users,
  MapPin,
  Bot,
  Network,
  Layers,
  CheckCircle2,
  ExternalLink,
  ArrowUpRight,
  HelpCircle,
  Clock,
  Compass,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const LandingPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [activeTab, setActiveTab] = useState<"youth" | "business" | "council">(
    "council",
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* =====================================================================
          1. HERO SECTION (ABOVE THE FOLD)
         ===================================================================== */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-32 border-b border-slate-800/80">
        {/* Ambient Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-7">
            {/* Top Tech Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-extrabold border border-emerald-500/30 shadow-lg shadow-emerald-950/40 backdrop-blur-md">
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="tracking-wide uppercase">
                The UK Social Mobility & Wage Arbitrage Infrastructure
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
              Eradicate the Youth Wage Gap.{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                Automate Local Economic Resilience.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
              Overcome the minimum wage affordability barrier. Springboard is
              the UK’s first tripartite, agent-driven ecosystem—unifying 16–24
              year olds, high-street SMEs, and Local Authority Councils into a
              single high-velocity economic flywheel. We unlock Real Living Wage
              employment by algorithmically co-funding entry-level wages with
              unspent council capital.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={
                  isAuthenticated && role === "council"
                    ? "/council"
                    : "/sign-in"
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-sm sm:text-base font-extrabold bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-xl shadow-emerald-900/30 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Deploy Council Capital</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </Link>

              {isAuthenticated ? (
                <Link
                  to={role === "business" ? "/business/assistant" : "/coach"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm sm:text-base font-bold bg-slate-900 text-white border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer"
                >
                  <span>Launch Your Local Flywheel</span>
                  <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                </Link>
              ) : (
                <Link
                  to="/sign-up"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm sm:text-base font-bold bg-slate-900 text-white border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer"
                >
                  <span>Candidate & SME Onboarding</span>
                  <ArrowUpRight className="w-5 h-5 text-slate-400" />
                </Link>
              )}
            </div>

            {/* Live Proof Strip */}
            <div className="pt-8 border-t border-slate-900 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400 font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-extrabold">✦ £3.80</span>
                <span>Treasury Green Book ROI</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-extrabold">✦ 0%</span>
                <span>Black-Box Hallucination</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-extrabold">
                  ✦ Instant
                </span>
                <span>IMD Geospatial Mapping</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-extrabold">
                  ✦ £1,728
                </span>
                <span>Placement Cost vs £15k NEET Interventions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. THE UK MARKET PROBLEM: THE WAGE TRILEMMA
         ===================================================================== */}
      <section className="py-20 md:py-28 bg-slate-900/60 relative border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-widest font-black text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
              Systemic Friction in Numbers
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              The Broken Trilemma Starving UK High Streets
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Billions in regeneration funding sit idle while high-street
              businesses operate understaffed and over a million young people
              are locked out of the workforce. The UK entry-level economy isn't
              lacking capital—it's lacking an intelligent routing engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* The Youth Trap */}
            <div className="bg-slate-950/80 rounded-3xl p-8 border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-wider uppercase text-rose-400 font-mono">
                    01 // THE YOUTH TRAP
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    1M+ NEET
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">
                  Generationally Stranded Talent
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Over 1 million 16–24 year olds are locked out of entry-level
                  jobs by opaque, CV-based hiring systems. Youth from low-income
                  families cannot afford unpaid experience or below-subsistence
                  wages, creating an unbreakable experience paradox.
                </p>
              </div>
              <div className="p-3 bg-rose-950/30 rounded-2xl border border-rose-500/20 text-[11px] font-bold text-rose-300">
                ↳ Consequence: Permanent wage scarring & acute benefit
                dependency.
              </div>
            </div>

            {/* The SME Squeeze */}
            <div className="bg-slate-950/80 rounded-3xl p-8 border border-amber-500/20 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-wider uppercase text-amber-400 font-mono">
                    02 // THE SME SQUEEZE
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    £11.44/HR FLOOR
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">
                  The Minimum Wage Margin Crisis
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Small and micro businesses desperately need staff and want to
                  mentor local youth, but razor-thin margins mean they cannot
                  afford the statutory £11.44/hr minimum wage for untrained,
                  junior applicants.
                </p>
              </div>
              <div className="p-3 bg-amber-950/30 rounded-2xl border border-amber-500/20 text-[11px] font-bold text-amber-300">
                ↳ Consequence: Vacancies left unfilled & local commercial
                stagnation.
              </div>
            </div>

            {/* The Council Gap */}
            <div className="bg-slate-950/80 rounded-3xl p-8 border border-indigo-500/20 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-wider uppercase text-indigo-400 font-mono">
                    03 // THE COUNCIL GAP
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    UKSPF PARALYSIS
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">
                  Unspent Regeneration Capital
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Councils sit on millions in unspent UK Shared Prosperity Fund
                  (UKSPF) and Section 106 funds, paralyzed by red tape, manual
                  paperwork, and zero real-time spatial visibility into exact
                  SME wage gaps across high-deprivation wards.
                </p>
              </div>
              <div className="p-3 bg-indigo-950/30 rounded-2xl border border-indigo-500/20 text-[11px] font-bold text-indigo-300">
                ↳ Consequence: Millions in unallocated funds clawed back to
                Whitehall.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. THE SOLUTION: THREE AGENTIC DASHBOARDS (THE "HOW")
         ===================================================================== */}
      <section className="py-20 md:py-28 bg-slate-950 relative border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs uppercase tracking-widest font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              The Tripartite Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Three Autonomous Portals. One Cohesive Economic Ledger.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Springboard replaces static forms and manual grant-making with a
              dual-mode, agent-driven interaction layer. Each stakeholder
              interface is engineered for zero cognitive load and maximum
              execution velocity.
            </p>

            {/* Dashboard Selector Tabs */}
            <div className="pt-6 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab("council")}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeTab === "council"
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
                }`}
              >
                🏛️ Council Hub
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("youth")}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeTab === "youth"
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
                }`}
              >
                ⚡ Candidate Portal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("business")}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeTab === "business"
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
                }`}
              >
                🏢 SME Employer Portal
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl">
            {activeTab === "council" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold font-mono">
                    PORTAL 01 // FUNDER DASHBOARD
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    The Council Hub: Spatial IMD Cartography & Capital
                    Allocation
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    A civic economic hub giving Economic Development Directors
                    complete sovereignty over grant disbursement, spatial
                    targeting, and cohort modeling.
                  </p>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">
                          Geospatial IMD Intelligence Hub:
                        </strong>{" "}
                        High-fidelity Leaflet map with CartoDB Dark/Light tiles
                        and UK Index of Multiple Deprivation (IMD) deciles
                        (1–3). Realistic non-overlapping boundary polygons
                        surface live SME wage gaps (+£4.44/hr) with zero API
                        keys required.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Bot className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">
                          AI Policy & Grant Director:
                        </strong>{" "}
                        Multi-turn reasoning orchestrator that models economic
                        cohorts, calculates social mobility multipliers, and
                        drafts ring-fenced grant pledges via conversational
                        prompts.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">
                          Invariant Financial Ledger:
                        </strong>{" "}
                        Complete human-in-the-loop governance via{" "}
                        <code className="text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded">
                          PendingAction
                        </code>{" "}
                        state machines. Committing a pledge atomically deducts
                        budget and monitors payroll top-ups with guaranteed
                        cancellation refund protection.
                      </span>
                    </li>
                  </ul>
                  <div className="pt-2 flex items-center gap-4">
                    <Link
                      to="/council"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs hover:bg-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-950/50"
                    >
                      <span>Enter Council Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      COUNCIL_SPATIAL_LEDGER.EXE
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-extrabold">
                      LIVE
                    </span>
                  </div>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                      <span className="text-slate-400">
                        Total Fund Allocated:
                      </span>
                      <span className="text-white font-extrabold">
                        £100,000.00
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Chesham Bikes Gap:</span>
                      <span className="text-amber-400 font-extrabold">
                        +£4.44 / hr
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Pledge Commitment:</span>
                      <span className="text-emerald-400 font-extrabold">
                        £1,728.00 (Active)
                      </span>
                    </div>
                    <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-emerald-300 text-[11px]">
                      ✓ IMD Decile 2 Catchment Verified • Treasury £3.80x
                      Multiplier Applied
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "youth" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-500/10 text-teal-400 text-xs font-bold font-mono">
                    PORTAL 02 // CANDIDATE DASHBOARD
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    The Youth Portal: Ditching the CV for Graph-Native Aptitude
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Driven by an autonomous Job Coach AI, the Youth Portal
                    strips away the intimidation of traditional job hunting,
                    replacing it with visual skills discovery and guaranteed
                    Living Wage compensation.
                  </p>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <Bot className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">
                          Conversational Onboarding:
                        </strong>{" "}
                        Young people describe their schedules, passions, and
                        everyday abilities in natural language—no CVs, cover
                        letters, or corporate jargon required.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Network className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">
                          Interactive Skills Knowledge Graph:
                        </strong>{" "}
                        Powered by node-edge visualization (
                        <code className="text-teal-300 bg-slate-950 px-1 py-0.5 rounded">
                          @xyflow/react
                        </code>
                        ), candidates visually explore how their aptitudes map
                        to local roles and expand "Frontier Skills" for career
                        growth.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">
                          Deterministic 0–100 Compatibility Engine:
                        </strong>{" "}
                        Transparent, explainable matching factoring type fit
                        (25%), skills overlap (35%), geodesic travel distance
                        (25%), schedule availability (10%), and qualifications
                        (5%).
                      </span>
                    </li>
                  </ul>
                  <div className="pt-2 flex items-center gap-4">
                    <Link
                      to="/coach"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 text-slate-950 font-extrabold text-xs hover:bg-teal-400 transition-all cursor-pointer"
                    >
                      <span>Experience Job Coach AI</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to="/knowledge"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 transition-all cursor-pointer"
                    >
                      <span>View Knowledge Graph</span>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      SKILLS_GRAPH_EXTRACTION
                    </span>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-extrabold">
                      XYFLOW
                    </span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Matched Skills:
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Python
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Customer Care
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Weekend Shift
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400 font-mono">
                        Real Living Wage:
                      </span>
                      <span className="text-emerald-400 font-extrabold text-sm">
                        £11.50 / hr Guaranteed
                      </span>
                    </div>
                    <div className="p-3 bg-teal-950/40 rounded-xl border border-teal-500/30 text-teal-300 text-[11px]">
                      ✓ 92% Match Score with Chesham Community Bike Works (0.8
                      miles away)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "business" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-bold font-mono">
                    PORTAL 03 // SME DASHBOARD
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    The Business Portal: Two-Minute Vacancy Generation & Wage
                    Arbitrage
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Powered by the Recruiter Assistant AI, local employers
                    convert staffing needs into audited, co-funded job
                    requisitions in seconds—solving the minimum wage
                    affordability trap.
                  </p>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">
                          120-Second Conversational Drafting:
                        </strong>{" "}
                        Employers outline shift requirements via chat; the AI
                        orchestrator handles Pydantic schema validation, job
                        descriptions, and compliance.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Coins className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">
                          Automated Affordability Calculation:
                        </strong>{" "}
                        The engine identifies the employer’s sustainable base
                        wage (e.g., £7.00/hr), computes the delta against the
                        Living Wage (£11.44/hr), and prepares the council grant
                        top-up request.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">
                          Safeguarded, Anonymized Matching:
                        </strong>{" "}
                        Candidate profiles display verified skills, transit
                        radii, and aptitude scores—eliminating bias and ensuring
                        full ICO and GDPR compliance.
                      </span>
                    </li>
                  </ul>
                  <div className="pt-2 flex items-center gap-4">
                    <Link
                      to="/business/assistant"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-extrabold text-xs hover:bg-indigo-400 transition-all cursor-pointer"
                    >
                      <span>Try Recruiter Assistant AI</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      SME_WAGE_ARBITRAGE
                    </span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-extrabold">
                      AUTO
                    </span>
                  </div>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                      <span className="text-slate-400">
                        Affordable Base Wage:
                      </span>
                      <span className="text-white font-extrabold">
                        £7.00 / hr
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                      <span className="text-slate-400">
                        Council Top-up Grant:
                      </span>
                      <span className="text-emerald-400 font-extrabold">
                        +£4.50 / hr
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Youth Receives:</span>
                      <span className="text-emerald-300 font-extrabold">
                        £11.50 / hr
                      </span>
                    </div>
                    <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/30 text-indigo-300 text-[11px]">
                      ✓ 0 Recruitment Fees • Verified Local Youth Mentorship
                      Commitment
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. THE FLYWHEEL ECONOMICS: TREASURY-BACKED ROI
         ===================================================================== */}
      <section className="py-20 md:py-28 bg-slate-900/60 relative border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-widest font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              Civic Capital Efficiency
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              The Self-Reinforcing Economic Flywheel
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Springboard is not charity; it is high-yield civic capital
              allocation. By orchestrating tripartite co-funding, local
              authorities transform passive grant reserves into an active
              multiplier for the local economy.
            </p>
          </div>

          {/* Flywheel Equation Callout */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 rounded-3xl p-8 sm:p-12 border border-emerald-500/30 shadow-2xl mb-12 text-center space-y-6">
            <div className="max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-widest">
                HM TREASURY GREEN BOOK STANDARD
              </span>
              <h3 className="text-3xl sm:text-5xl font-black text-white">
                £1.00 Invested = £3.80 Local Economic Return
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Independent economic modeling aligned with Treasury Green Book
                appraisal proves that every £1.00 deployed in targeted wage
                subsidies delivers £3.80 in local economic and fiscal return.
              </p>
            </div>

            {/* Tripartite Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono font-bold text-slate-400 block">
                  SME Contribution
                </span>
                <span className="text-2xl font-black text-white block">
                  £7.00 / hr
                </span>
                <p className="text-xs text-slate-400">
                  Employer pays sustainable baseline for entry-level work.
                </p>
              </div>
              <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-2">
                <span className="text-[11px] font-mono font-bold text-emerald-400 block">
                  + Council Grant Top-Up
                </span>
                <span className="text-2xl font-black text-emerald-400 block">
                  £4.50 / hr
                </span>
                <p className="text-xs text-slate-400">
                  Funded from unspent UKSPF, Section 106, or Levy reserves.
                </p>
              </div>
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono font-bold text-teal-300 block">
                  = Youth Earnings
                </span>
                <span className="text-2xl font-black text-teal-300 block">
                  £11.50 / hr
                </span>
                <p className="text-xs text-slate-400">
                  Exceeds UK Real Living Wage target with zero debt.
                </p>
              </div>
            </div>
          </div>

          {/* Cohort Scenarios Table */}
          <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 overflow-x-auto">
            <h4 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Cohort Economic Modeling (24 Weeks @ 16 Hours / Week)</span>
            </h4>
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3">Cohort Scale</th>
                  <th className="pb-3">Council Investment</th>
                  <th className="pb-3">SME Co-Contribution</th>
                  <th className="pb-3">Youth Wages Injected</th>
                  <th className="pb-3 text-emerald-400">
                    Treasury Green Book ROI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-semibold text-slate-300">
                <tr>
                  <td className="py-3 text-white font-extrabold">
                    10 Youth (Ward Pilot)
                  </td>
                  <td className="py-3">£17,280</td>
                  <td className="py-3">£26,880</td>
                  <td className="py-3">£44,160</td>
                  <td className="py-3 text-emerald-400 font-black">£65,664</td>
                </tr>
                <tr>
                  <td className="py-3 text-white font-extrabold">
                    50 Youth (Borough Rollout)
                  </td>
                  <td className="py-3">£86,400</td>
                  <td className="py-3">£134,400</td>
                  <td className="py-3">£220,800</td>
                  <td className="py-3 text-emerald-400 font-black">£328,320</td>
                </tr>
                <tr>
                  <td className="py-3 text-white font-extrabold">
                    200 Youth (County/City-Wide)
                  </td>
                  <td className="py-3">£345,600</td>
                  <td className="py-3">£537,600</td>
                  <td className="py-3">£883,200</td>
                  <td className="py-3 text-emerald-400 font-black">
                    £1,313,280
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. FOOTER & FINAL PUSH
         ===================================================================== */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-slate-950 to-emerald-950 text-white relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <span className="text-xs uppercase tracking-widest font-black text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/30">
            The Procure-Ready Benchmark
          </span>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Stop Spending £15,000 on Failure.{" "}
            <br className="hidden sm:inline" />
            <span className="text-emerald-400">
              Deploy Real Living Wage Employment for £1,728.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Traditional, bureaucratically bloated youth training interventions
            burn between <strong>£12,000 and £18,000 per NEET candidate</strong>
            —delivering static certifications and zero guaranteed private sector
            payroll outcomes. Springboard places a verified, disadvantaged young
            person into a Living Wage role with a mentoring local employer for a
            total council grant cost of just <strong>£1,728</strong>.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={
                isAuthenticated && role === "council" ? "/council" : "/sign-in"
              }
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl text-base font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-xl shadow-emerald-900/40 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Launch Your Local Authority Pilot</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/matches"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition-all cursor-pointer"
            >
              <span>Explore Match Matrix</span>
            </Link>
          </div>

          <div className="pt-10 border-t border-slate-800/80 text-xs text-slate-400 space-y-2">
            <p>
              Pilot deployments available immediately for Unitary Authorities,
              Metropolitan Boroughs, and Combined Authorities. Compatible with
              UKSPF People & Skills, Section 106, and unallocated Apprenticeship
              Levy reserves.
            </p>
            <p className="text-[11px] text-slate-500">
              © 2026 Springboard UK Technologies Ltd. All rights reserved. HM
              Treasury Green Book Compliant • Crown Commercial Service Ready
              Architecture.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
