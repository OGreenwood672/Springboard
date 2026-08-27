import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Match, Opportunity } from '@springboard/shared-types';
import { matchesApi } from '../../api/matches';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { OpportunityTypeBadge, WorkplaceBadge } from '../../components/common/Badge';
import { ApplicationModal } from '../../components/youth/ApplicationModal';
import {
  Sparkles,
  RefreshCw,
  Building2,
  CheckCircle2,
  ArrowRight,
  Frown,
} from 'lucide-react';

export const YouthMatchesPage: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOppForApply, setSelectedOppForApply] = useState<Opportunity | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await matchesApi.getMyMatches();
      setMatches(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load matches', 'error');
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
      showToast(`Generated ${res.generated_count} updated match recommendations!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate matches', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 60) return 'text-teal-700 bg-teal-50 border-teal-300';
    if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-slate-700 bg-slate-100 border-slate-300';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deterministic Match Algorithm v1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Matched Opportunities for You
          </h1>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Recommendations scored based on your skills, travel radius, availability, and preferred opportunity types.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefreshMatches}
          disabled={refreshing || !profile}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-md transition-all shrink-0 self-start md:self-auto cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Recalculating...' : 'Refresh Matches'}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" text="Calculating your top opportunity matches..." />
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Frown className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No matches calculated yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Complete your profile skills and location to generate compatibility scores against published UK opportunities.
          </p>
          <button
            type="button"
            onClick={handleRefreshMatches}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all"
          >
            Generate Matches Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => {
            const opp = match.opportunity;
            if (!opp) return null;

            const factors = match.factors || {};

            return (
              <div
                key={match.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <OpportunityTypeBadge type={opp.opportunity_type} size="sm" />
                    <WorkplaceBadge type={opp.workplace_type} size="sm" />

                    {factors.distance_km !== null && factors.distance_km !== undefined && (
                      <span className="text-xs text-slate-500 font-medium">
                        📍 {factors.distance_km} km away
                      </span>
                    )}
                  </div>

                  <div>
                    <Link
                      to={`/opportunities/${opp.id}`}
                      className="text-lg font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                    >
                      {opp.title}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">{opp.business_name || 'Verified Organisation'}</span>
                      {opp.pay_info && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-emerald-800">{opp.pay_info}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      Type: <b>{factors.type_score || 0}/25</b>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      Skills: <b>{factors.skills_score || 0}/35</b>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      Location: <b>{factors.location_score || 0}/25</b>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      Availability: <b>{factors.availability_score || 0}/10</b>
                    </span>
                    {(factors.qualification_score || 0) > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
                        +5 Qual Bonus
                      </span>
                    )}
                  </div>

                  {factors.matched_skills && factors.matched_skills.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Matching Skills: <b>{factors.matched_skills.join(', ')}</b>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 min-w-[140px]">
                  <div
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${getScoreColor(
                      match.score
                    )} min-w-[100px] shadow-2xs`}
                  >
                    <span className="text-2xl font-black">{Math.round(match.score)}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Match Score</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOppForApply(opp)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ApplicationModal
        opportunity={selectedOppForApply}
        isOpen={!!selectedOppForApply}
        onClose={() => setSelectedOppForApply(null)}
        onSuccess={() => {
          showToast('Application submitted from Matches!', 'success');
        }}
      />
    </div>
  );
};
