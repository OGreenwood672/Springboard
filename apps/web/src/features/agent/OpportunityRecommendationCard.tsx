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
    if (sc >= 80) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (sc >= 60) return "bg-teal-100 text-teal-800 border-teal-300";
    if (sc >= 40) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-slate-100 text-slate-800 border-slate-300";
  };

  return (
    <div className="my-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-all space-y-3">
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
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>{score}% Match</span>
          </span>
        )}
      </div>

      {/* Role Title & Employer */}
      <div>
        <Link
          to={`/opportunities/${opp.id}`}
          className="text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors"
        >
          {opp.title}
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
          <Building2 className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">
            {opp.business_name || "Verified Organisation"}
          </span>
          <span>•</span>
          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
          <span>{opp.location_name || opp.postcode || "UK"}</span>
        </div>
      </div>

      {/* Explanation Points */}
      {data.explanation_points && data.explanation_points.length > 0 && (
        <div className="rounded-xl bg-emerald-50/70 p-2.5 text-xs text-emerald-950 space-y-1 border border-emerald-100">
          <span className="block font-bold text-emerald-900 text-[11px] uppercase tracking-wider">
            Why this suits you:
          </span>
          {data.explanation_points.map((pt, idx) => (
            <p key={idx} className="flex items-start gap-1.5 leading-snug">
              <span className="text-emerald-600 font-bold">•</span>
              <span>{pt}</span>
            </p>
          ))}
        </div>
      )}

      {/* Skills */}
      {opp.required_skills && opp.required_skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {opp.required_skills.map((s, idx) => (
            <span
              key={idx}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Footer & Actions */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
        {opp.pay_info ? (
          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
            <Banknote className="h-3.5 w-3.5 text-emerald-600" />
            {opp.pay_info}
          </span>
        ) : (
          <span className="text-xs text-slate-500">
            {opp.hours_or_commitment || "Flexible hours"}
          </span>
        )}

        <div className="flex items-center gap-2">
          <Link
            to={`/opportunities/${opp.id}`}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Details
          </Link>

          {onApplyClick && (
            <button
              type="button"
              onClick={() => onApplyClick(opp.id, opp.title)}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-2xs"
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
