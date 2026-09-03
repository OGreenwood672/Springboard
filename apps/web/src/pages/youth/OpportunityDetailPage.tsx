import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Opportunity, Match } from "@springboard/shared-types";
import { opportunitiesApi } from "../../api/opportunities";
import { matchesApi } from "../../api/matches";
import { ApplicationModal } from "../../components/youth/ApplicationModal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import {
  OpportunityTypeBadge,
  WorkplaceBadge,
  OpportunityStatusBadge,
} from "../../components/common/Badge";
import { useAuth } from "../../context/AuthContext";
import {
  Building2,
  MapPin,
  Clock,
  Banknote,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Send,
  ShieldCheck,
  Zap,
  Lock,
  Bot,
} from "lucide-react";

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [matchData, setMatchData] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const isYouth = isAuthenticated && role === "youth";

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([
        opportunitiesApi.getOpportunity(id),
        isYouth
          ? matchesApi.getMyMatches().catch(() => [])
          : Promise.resolve([]),
      ])
        .then(([oppData, myMatches]) => {
          setOpportunity(oppData);
          if (isYouth && Array.isArray(myMatches)) {
            const foundMatch = myMatches.find(
              (m) => m.opportunity_id === id || m.opportunity?.id === id,
            );
            setMatchData(foundMatch || null);
          }
        })
        .catch(() => setOpportunity(null))
        .finally(() => setLoading(false));
    }
  }, [id, isYouth]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center bg-slate-950">
        <LoadingSpinner
          size="lg"
          text="Loading opportunity requisition details..."
        />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4 text-slate-100">
        <h2 className="text-xl font-black text-white">Opportunity Not Found</h2>
        <p className="text-xs text-slate-400">
          This vacancy listing may have closed or the link is invalid.
        </p>
        <Link
          to={isYouth ? "/matches" : "/opportunities"}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {isYouth ? "Back to Matched Roles" : "Back to Opportunities"}
          </span>
        </Link>
      </div>
    );
  }

  const deadlineFormatted = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const isMatchedForYouth = !isYouth || Boolean(matchData);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      <Link
        to={isYouth ? "/matches" : "/opportunities"}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>
          {isYouth ? "Back to Matched Roles" : "Back to all vacancies"}
        </span>
      </Link>

      <div className="bg-slate-900/95 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <OpportunityTypeBadge type={opportunity.opportunity_type} />
            <WorkplaceBadge type={opportunity.workplace_type} />
            <OpportunityStatusBadge status={opportunity.status} />
            {isYouth && matchData && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {Math.round(matchData.score)}% Fit Score
              </span>
            )}
          </div>

          {opportunity.deadline && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Deadline: {deadlineFormatted}</span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {opportunity.title}
          </h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mt-2 font-mono">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-200">
              {opportunity.business_name || "Verified SME"}
            </span>
            <span>•</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>
              {opportunity.location_name ||
                opportunity.postcode ||
                "United Kingdom"}
            </span>
          </div>
        </div>

        {/* Real Living Wage Triple-Lock Card */}
        <div className="rounded-2xl p-4 bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-200">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-mono font-black uppercase tracking-wider text-white block">
              Real Living Wage Certified (£11.44+/hr)
            </span>
            <p className="text-emerald-300/80 leading-relaxed text-[11px]">
              This placement is co-funded through Local Authority regeneration
              capital. The employer base rate is topped up by the council to
              guarantee dignity and living wage parity.
            </p>
          </div>
        </div>

        {/* Quick Facts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">
              Living Wage
            </span>
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span>
                {opportunity.hourly_wage_subsidised
                  ? `£${opportunity.hourly_wage_subsidised.toFixed(2)}/hr`
                  : "£11.44/hr+"}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">
              Subsidy Status
            </span>
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <span>
                {opportunity.wage_subsidy_applied
                  ? "Council Top-Up Active"
                  : "Tripartite Eligible"}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">
              Wage Structure
            </span>
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <Banknote className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{opportunity.pay_info || "Voluntary / Unpaid"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">
              Schedule & Hours
            </span>
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{opportunity.hours_or_commitment || "Flexible hours"}</span>
            </div>
          </div>
        </div>

        {/* Gated Application Area */}
        {opportunity.status === "published" && (
          <div className="pt-2">
            {isAuthenticated ? (
              isYouth ? (
                isMatchedForYouth ? (
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Apply with Verified Profile</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-3">
                    <div className="flex items-center gap-2 font-black text-white text-xs">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Role Locked — Deterministic Match Required</span>
                    </div>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      You are not currently deterministically matched with this
                      role based on your mapped skills or travel radius.
                      Springboard protects candidates by preventing blind
                      un-matched submissions.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Link
                        to="/coach"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all"
                      >
                        <Bot className="w-4 h-4" />
                        <span>Ask Job Coach to Map Pathway</span>
                      </Link>
                      <Link
                        to="/matches"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all"
                      >
                        <span>View My Matched Vacancies</span>
                      </Link>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-xs text-slate-400 font-mono">
                  Viewing listing in Employer Preview Mode.
                </div>
              )
            ) : (
              <Link
                to="/sign-up"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-lg transition-all"
              >
                <span>Register to Match & Apply</span>
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div>
            <h2 className="text-base font-black text-white mb-3">
              Requisition Overview
            </h2>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Required Skills
            </h3>
            {opportunity.required_skills &&
            opportunity.required_skills.length > 0 ? (
              <div className="space-y-2">
                {opportunity.required_skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-300 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No prerequisites required (open entry level).
              </p>
            )}

            {opportunity.preferred_skills &&
              opportunity.preferred_skills.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Frontier / Advantageous Skills:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {opportunity.preferred_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-mono font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      <ApplicationModal
        opportunity={opportunity}
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSuccess={() => {
          navigate("/applications");
        }}
      />
    </div>
  );
};
