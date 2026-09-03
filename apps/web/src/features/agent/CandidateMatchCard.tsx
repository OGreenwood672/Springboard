import React from "react";
import { CandidateMatchCardData } from "@springboard/shared-types";
import {
  Sparkles,
  MapPin,
  GraduationCap,
  CheckCircle2,
  Shield,
  Zap,
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
    if (sc >= 80) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    if (sc >= 60) return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
    if (sc >= 40) return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  return (
    <div className="my-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-xl space-y-3.5 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs">
            {data.candidate_name.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-black text-white">
              {data.candidate_name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-400" />
                {data.postcode_area || "UK"}
                {data.distance_km !== null && data.distance_km !== undefined
                  ? ` (${data.distance_km} km)`
                  : ""}
              </span>
              {data.education_stage && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3 text-slate-500" />
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
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>{score}% Match</span>
        </span>
      </div>

      {/* Matched Skills */}
      {data.matched_skills && data.matched_skills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-mono text-[10px] uppercase font-bold mr-1">
            Skills Overlap:
          </span>
          {data.matched_skills.map((s, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-950/60 px-2 py-0.5 text-[11px] font-mono font-bold text-indigo-300 border border-indigo-500/30"
            >
              <CheckCircle2 className="h-2.5 w-2.5 text-indigo-400" />
              <span>{s}</span>
            </span>
          ))}
        </div>
      )}

      {/* Explanation Points */}
      {data.explanation_points && data.explanation_points.length > 0 && (
        <div className="rounded-xl bg-slate-950 p-3 text-xs text-slate-300 space-y-1.5 border border-slate-800">
          {data.explanation_points.map((pt, idx) => (
            <p key={idx} className="flex items-start gap-1.5 leading-snug">
              <span className="text-indigo-400 font-bold">•</span>
              <span>{pt}</span>
            </p>
          ))}
        </div>
      )}

      {/* Privacy Notice & Footer */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-2.5 text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <Shield className="h-3 w-3" />
          <span>ICO & GDPR Anonymized Profile</span>
        </span>

        {onExplainClick && (
          <button
            type="button"
            onClick={() =>
              onExplainClick(data.opportunity_id, data.youth_profile_id)
            }
            className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            Explain Match Factors →
          </button>
        )}
      </div>
    </div>
  );
};
