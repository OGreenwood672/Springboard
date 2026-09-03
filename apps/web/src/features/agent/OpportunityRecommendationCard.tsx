import React from "react";
import { Link } from "react-router-dom";
import { OpportunityRecommendationCardData } from "@springboard/shared-types";
import {
  OpportunityTypeBadge,
  WorkplaceBadge,
} from "../../components/common/Badge";
import {
  Building2,
  MapPin,
  Sparkles,
  ArrowRight,
  Banknote,
  ShieldCheck,
} from "lucide-react";

interface OpportunityRecommendationCardProps {
  data: OpportunityRecommendationCardData;
  onApplyClick?: (oppId: string, title: string) => void;
}

export const OpportunityRecommendationCard: React.FC<
  OpportunityRecommendationCardProps
> = ({ data, onApplyClick }) => {
  const opp = data.opportunity;
  const score = data.match_score;

  const getScoreBadge = (sc: number) => {
    if (sc >= 80) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    if (sc >= 60) return "bg-teal-500/20 text-teal-300 border-teal-500/40";
    if (sc >= 40) return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  return (
    <div className="my-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-xl hover:border-slate-700 transition-all space-y-3.5 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <OpportunityTypeBadge type={opp.opportunity_type} size="sm" />
          <WorkplaceBadge type={opp.workplace_type} size="sm" />
        </div>

        {score !== undefined && score !== null && (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-black ${getScoreBadge(
              score,
            )}`}
          >
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>{score}% Match</span>
          </span>
        )}
      </div>

      {/* Role Title & Employer */}
      <div>
        <Link
          to={`/opportunities/${opp.id}`}
          className="text-base font-black text-white hover:text-emerald-400 transition-colors"
        >
          {opp.title}
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
          <span className="font-bold text-slate-300 flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 text-slate-500" />
            {opp.business_name || "Verified Local SME"}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
            {opp.location_name || opp.postcode || "UK"}
          </span>
        </div>
      </div>

      {/* Explanation Points */}
      {data.explanation_points && data.explanation_points.length > 0 && (
        <div className="rounded-xl bg-emerald-950/40 p-3 text-xs text-emerald-200 space-y-1.5 border border-emerald-500/20">
          <span className="block font-mono font-bold text-emerald-400 text-[10px] uppercase tracking-wider">
            Deterministic Fit Analysis:
          </span>
          {data.explanation_points.map((pt, idx) => (
            <p key={idx} className="flex items-start gap-1.5 leading-snug">
              <span className="text-emerald-400 font-bold">•</span>
              <span>{pt}</span>
            </p>
          ))}
        </div>
      )}

      {/* Skills */}
      {opp.required_skills && opp.required_skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {opp.required_skills.map((s, idx) => (
            <span
              key={idx}
              className="rounded-lg bg-slate-950 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-300 border border-slate-800"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Footer & Actions */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-3">
        {opp.pay_info ? (
          <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
            <Banknote className="h-3.5 w-3.5" />
            {opp.pay_info}
          </span>
        ) : (
          <span className="text-xs text-slate-400">
            {opp.hours_or_commitment || "Flexible hours"}
          </span>
        )}

        <div className="flex items-center gap-2">
          <Link
            to={`/opportunities/${opp.id}`}
            className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1"
          >
            Details
          </Link>

          {onApplyClick && (
            <button
              type="button"
              onClick={() => onApplyClick(opp.id, opp.title)}
              className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-3.5 py-1.5 text-xs font-black text-slate-950 hover:from-emerald-400 hover:to-teal-300 transition-all cursor-pointer shadow-md shadow-emerald-950/40"
            >
              <span>Apply via Coach</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
