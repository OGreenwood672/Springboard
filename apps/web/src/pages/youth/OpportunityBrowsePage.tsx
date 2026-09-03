import React, { useState, useEffect, useCallback } from "react";
import { Opportunity, Match } from "@springboard/shared-types";
import {
  opportunitiesApi,
  OpportunityFilterOptions,
} from "../../api/opportunities";
import { matchesApi } from "../../api/matches";
import { OpportunityCard } from "../../components/youth/OpportunityCard";
import { OpportunityFilter } from "../../components/youth/OpportunityFilter";
import { ApplicationModal } from "../../components/youth/ApplicationModal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import {
  Briefcase,
  Sparkles,
  Frown,
  Zap,
  Lock,
  Bot,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

export const OpportunityBrowsePage: React.FC = () => {
  const { isAuthenticated, role, profile } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<OpportunityFilterOptions>({});
  const [selectedOppForApply, setSelectedOppForApply] =
    useState<Opportunity | null>(null);

  const isYouth = isAuthenticated && role === "youth";

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      if (isYouth) {
        // Enforce deterministic matching gate for young candidates
        const myMatches = await matchesApi.getMyMatches();
        setMatches(myMatches);

        // Extract opportunities that have been matched
        let matchedOpps = myMatches
          .map((m) => m.opportunity)
          .filter((opp): opp is Opportunity => Boolean(opp));

        // Apply any local filters (keyword query, opportunity type, etc.)
        if (filters.keyword) {
          const q = filters.keyword.toLowerCase();
          matchedOpps = matchedOpps.filter(
            (o) =>
              o.title.toLowerCase().includes(q) ||
              o.description.toLowerCase().includes(q) ||
              (o.business_name && o.business_name.toLowerCase().includes(q)),
          );
        }
        if (filters.opportunity_type) {
          matchedOpps = matchedOpps.filter(
            (o) => o.opportunity_type === filters.opportunity_type,
          );
        }
        if (filters.workplace_type) {
          matchedOpps = matchedOpps.filter(
            (o) => o.workplace_type === filters.workplace_type,
          );
        }
        setOpportunities(matchedOpps);
      } else {
        // Non-youth (e.g. employers or unauthenticated guests) see public directory
        const data = await opportunitiesApi.getOpportunities(filters);
        setOpportunities(data);
      }
    } catch {
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, [filters, isYouth]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-emerald-950/80 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-2xl">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            {isYouth ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deterministic Gate Active</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Living Wage Opportunities</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isYouth
              ? "Your Verified Matched Vacancies"
              : "Explore Vetted Local Vacancies"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isYouth
              ? "Under the Springboard NEET protocol, young candidates only browse roles deterministically scored for their skills, commute tolerance, and schedule."
              : "Every role guarantees the Real Living Wage (£11.44+/hr) through SME base wages and local council grant co-funding."}
          </p>
        </div>

        {isYouth ? (
          <div className="flex items-center gap-2">
            <Link
              to="/coach"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-950/50 transition-all shrink-0 self-start md:self-auto"
            >
              <Bot className="w-4 h-4" />
              <span>Unlock Roles via Job Coach</span>
            </Link>
          </div>
        ) : (
          <Link
            to="/sign-in"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-950/50 transition-all shrink-0 self-start md:self-auto"
          >
            <span>Sign In to Match</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Gating Notice for Youth Candidates */}
      {isYouth && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-300 shadow-sm">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-white block">
              Curated Candidate Protection
            </span>
            <p className="text-slate-400 leading-relaxed">
              Unmatched vacancies are hidden to protect candidate morale and
              eliminate rejection cycles. If you want to access roles in other
              sectors, talk to your{" "}
              <Link
                to="/coach"
                className="text-emerald-400 hover:underline font-bold"
              >
                AI Job Coach
              </Link>{" "}
              to unlock the required frontier aptitudes.
            </p>
          </div>
        </div>
      )}

      {/* Filter Component */}
      <OpportunityFilter
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs sm:text-sm font-mono font-semibold text-slate-400">
          Showing{" "}
          <span className="text-white font-bold">{opportunities.length}</span>{" "}
          {isYouth ? "matched" : "verified"} opportunit
          {opportunities.length === 1 ? "y" : "ies"}
        </p>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner
            size="lg"
            text="Querying geospatial wage opportunity ledger..."
          />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl p-12 text-center border border-slate-800 shadow-xl space-y-4 max-w-md mx-auto my-12">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Frown className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white">
            {isYouth ? "No matched roles found" : "No opportunities found"}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isYouth
              ? "You do not have any published opportunities matching your current profile and filter criteria. Chat with your AI Job Coach to map new skills or expand your commute zone."
              : "No vacancies currently match these specific filter parameters. Try adjusting your search query or radius."}
          </p>
          {isYouth ? (
            <Link
              to="/coach"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer shadow-md"
            >
              <Bot className="w-4 h-4" />
              <span>Talk to AI Job Coach</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer shadow-md"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onApplyClick={(o) => setSelectedOppForApply(o)}
            />
          ))}
        </div>
      )}

      {/* Application Modal */}
      <ApplicationModal
        opportunity={selectedOppForApply}
        isOpen={!!selectedOppForApply}
        onClose={() => setSelectedOppForApply(null)}
        onSuccess={() => {
          setSelectedOppForApply(null);
        }}
      />
    </div>
  );
};
