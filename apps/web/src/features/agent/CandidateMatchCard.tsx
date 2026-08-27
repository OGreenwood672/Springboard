import React from "react";
import { CandidateMatchCardData } from "@springboard/shared-types";
import {
  Sparkles,
  MapPin,
  GraduationCap,
  CheckCircle2,
  Shield,
} from "lucide-react";

interface CandidateMatchCardProps {
  data: CandidateMatchCardData;
  onExplainClick?: (oppId: string, youthId: string) => void;
}

export const CandidateMatchCard: React.FC<CandidateMatchCardProps> = ({
  data,
  onExplainClick,
}) => {
  const score = data.match_score;

  const getScoreBadge = (sc: number) => {
    if (sc >= 80) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (sc >= 60) return "bg-indigo-100 text-indigo-800 border-indigo-300";
    if (sc >= 40) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-slate-100 text-slate-800 border-slate-300";
  };

  return (
    <div className="my-2.5 rounded-2xl border border-indigo-200/80 bg-white p-4 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">
            {data.candidate_name.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {data.candidate_name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-600" />
                {data.postcode_area || "UK"}
                {data.distance_km !== null && data.distance_km !== undefined
                  ? ` (${data.distance_km} km)`
                  : ""}
              </span>
              {data.education_stage && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3 text-slate-400" />
                    {data.education_stage
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-black ${getScoreBadge(
            score,
          )}`}
        >
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>{score}% Match</span>
        </span>
      </div>

      {/* Matched Skills */}
      {data.matched_skills && data.matched_skills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-slate-500 font-semibold text-[11px] mr-1">
            Matched Skills:
          </span>
          {data.matched_skills.map((s, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-0.5 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-100"
            >
              <CheckCircle2 className="h-2.5 w-2.5 text-indigo-500" />
              <span>{s}</span>
            </span>
          ))}
        </div>
      )}

      {/* Explanation Points */}
      {data.explanation_points && data.explanation_points.length > 0 && (
        <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 space-y-1">
          {data.explanation_points.map((pt, idx) => (
            <p key={idx} className="flex items-start gap-1.5 leading-snug">
              <span className="text-slate-400 font-bold">•</span>
              <span>{pt}</span>
            </p>
          ))}
        </div>
      )}

      {/* Privacy Notice & Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-emerald-600" />
          <span>Privacy-safe candidate profile</span>
        </span>

        {onExplainClick && (
          <button
            type="button"
            onClick={() =>
              onExplainClick(data.opportunity_id, data.youth_profile_id)
            }
            className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            Explain Match Factors
          </button>
        )}
      </div>
    </div>
  );
};
