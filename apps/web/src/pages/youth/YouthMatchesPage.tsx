import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Match, Opportunity } from "@springboard/shared-types";
import { matchesApi } from "../../api/matches";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import {
  OpportunityTypeBadge,
  WorkplaceBadge,
} from "../../components/common/Badge";
import { ApplicationModal } from "../../components/youth/ApplicationModal";
import {
  Sparkles,
  RefreshCw,
  Building2,
  CheckCircle2,
  ArrowRight,
  Frown,
  Zap,
  XCircle,
  RotateCcw,
} from "lucide-react";

export const YouthMatchesPage: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOppForApply, setSelectedOppForApply] =
    useState<Opportunity | null>(null);

  const dismissedStorageKey = `springboard_dismissed_matches_${profile?.id || "default"}`;
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(
        `springboard_dismissed_matches_${profile?.id || "default"}`,
      );
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleDismiss = (oppId: string, oppTitle: string) => {
    const updated = [...dismissedIds, oppId];
    setDismissedIds(updated);
    try {
      localStorage.setItem(dismissedStorageKey, JSON.stringify(updated));
    } catch {}
    showToast(`Removed "${oppTitle}" from your recommendations.`, "info");
  };

  const handleResetDismissals = () => {
    setDismissedIds([]);
    try {
      localStorage.removeItem(dismissedStorageKey);
    } catch {}
    showToast("Restored all previously dismissed opportunities.", "success");
  };

  const visibleMatches = matches.filter(
    (m) =>
      !dismissedIds.includes(m.opportunity_id) &&
      (!m.opportunity || !dismissedIds.includes(m.opportunity.id)),
  );

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await matchesApi.getMyMatches();
      setMatches(data);
    } catch (err: any) {
      showToast(err.message || "Failed to load matches", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleRefreshMatches = async () => {
    if (!profile) return;
    setRefreshing(true);
    try {
      const res = await matchesApi.generateMatches(profile.id);
      setMatches(res.matches);
      showToast(
        `Generated ${res.generated_count} updated match recommendations!`,
        "success",
      );
    } catch (err: any) {
      showToast(err.message || "Failed to generate matches", "error");
    } finally {
      setRefreshing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80)
      return "text-emerald-300 bg-emerald-500/20 border-emerald-500/40";
    if (score >= 60) return "text-teal-300 bg-teal-500/20 border-teal-500/40";
    if (score >= 40)
      return "text-amber-300 bg-amber-500/20 border-amber-500/40";
    return "text-slate-400 bg-slate-800 border-slate-700";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Deterministic 0–100 Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ranked Opportunities for Your Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every match is deterministically scored across Type Fit (25%),
            Skills Overlap (35%), Geodesic Commute (25%), Availability (10%),
            and Qualifications (5%).
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefreshMatches}
          disabled={refreshing || !profile}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-md shadow-emerald-950/50 transition-all shrink-0 self-start md:self-auto cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          <span>{refreshing ? "Recalculating..." : "Refresh Matches"}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner
            size="lg"
            text="Calculating deterministic match matrix..."
          />
        </div>
      ) : visibleMatches.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl p-12 text-center border border-slate-800 shadow-xl space-y-4 max-w-md mx-auto my-8 font-mono">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Frown className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white font-sans">
            {matches.length > 0
              ? "All active matches marked as Not Interested"
              : "No matches calculated yet"}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            {matches.length > 0
              ? "You have dismissed all recommended matches. You can restore them anytime or refresh with updated profile skills."
              : "Complete your profile skills and location to generate compatibility scores against published UK opportunities."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {matches.length > 0 && (
              <button
                type="button"
                onClick={handleResetDismissals}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-750 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Dismissals</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleRefreshMatches}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer shadow-md"
            >
              Recalculate Matches
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleMatches.map((match) => {
            const opp = match.opportunity;
            if (!opp) return null;

            const factors = match.factors || {};

            return (
              <div
                key={match.id}
                className="bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <OpportunityTypeBadge
                      type={opp.opportunity_type}
                      size="sm"
                    />
                    <WorkplaceBadge type={opp.workplace_type} size="sm" />

                    {factors.distance_km !== null &&
                      factors.distance_km !== undefined && (
                        <span className="text-xs text-slate-400 font-mono font-medium">
                          📍 {factors.distance_km} km commute
                        </span>
                      )}
                  </div>

                  <div>
                    <Link
                      to={`/opportunities/${opp.id}`}
                      className="text-lg font-black text-white hover:text-emerald-400 transition-colors"
                    >
                      {opp.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-bold text-slate-300">
                        {opp.business_name || "Organisation Name"}
                      </span>
                      {opp.pay_info && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-emerald-400">
                            {opp.pay_info}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      Type:{" "}
                      <b className="text-white">{factors.type_score || 0}/25</b>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      Skills:{" "}
                      <b className="text-white">
                        {factors.skills_score || 0}/35
                      </b>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      Commute:{" "}
                      <b className="text-white">
                        {factors.location_score || 0}/25
                      </b>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      Hours:{" "}
                      <b className="text-white">
                        {factors.availability_score || 0}/10
                      </b>
                    </span>
                    {(factors.qualification_score || 0) > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                        +5 Bonus
                      </span>
                    )}
                  </div>

                  {factors.matched_skills &&
                    factors.matched_skills.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-300 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                          Matching Aptitudes:{" "}
                          <b className="font-mono">
                            {factors.matched_skills.join(", ")}
                          </b>
                        </span>
                      </div>
                    )}
                </div>

                <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800 min-w-[140px]">
                  <div
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${getScoreColor(
                      match.score,
                    )} min-w-[110px] shadow-lg`}
                  >
                    <span className="text-2xl font-black font-mono">
                      {Math.round(match.score)}%
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                      Fit Score
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 w-full min-w-[130px]">
                    <button
                      type="button"
                      onClick={() => setSelectedOppForApply(opp)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDismiss(opp.id, opp.title)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer"
                      title="Not interested — remove and do not recommend again"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Not Interested</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {dismissedIds.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>
                {dismissedIds.length} role{dismissedIds.length === 1 ? "" : "s"}{" "}
                hidden as "Not Interested".
              </span>
              <button
                type="button"
                onClick={handleResetDismissals}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Dismissed Roles</span>
              </button>
            </div>
          )}
        </div>
      )}

      <ApplicationModal
        opportunity={selectedOppForApply}
        isOpen={!!selectedOppForApply}
        onClose={() => setSelectedOppForApply(null)}
        onSuccess={() => {
          showToast("Application submitted from Matches!", "success");
        }}
      />
    </div>
  );
};
