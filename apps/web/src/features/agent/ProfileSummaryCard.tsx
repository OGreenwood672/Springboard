import React from "react";
import { ProfileSummaryCardData } from "@springboard/shared-types";
import {
  UserCheck,
  MapPin,
  Sparkles,
  GraduationCap,
  Calendar,
} from "lucide-react";

interface ProfileSummaryCardProps {
  data: ProfileSummaryCardData;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  data,
}) => {
  return (
    <div className="my-2.5 rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-4 sm:p-5 shadow-xl space-y-3 text-slate-100">
      <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black">
          <UserCheck className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-sm font-black text-white">
            {data.full_name || "Extracted Youth Profile"}
          </h4>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {data.postcode && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-400" />
                {data.postcode} (within {data.max_travel_km || 15} km)
              </span>
            )}
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

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            Extracted Skills
          </span>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s, idx) => (
              <span
                key={idx}
                className="rounded-lg bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-xs font-mono font-bold text-emerald-300"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      {data.availability?.days && data.availability.days.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
          <Calendar className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-bold text-white">Schedule:</span>
          <span>{data.availability.days.join(", ")}</span>
          {data.availability.hours_per_week && (
            <span className="text-slate-400 font-mono">({data.availability.hours_per_week} hrs/wk)</span>
          )}
        </div>
      )}
    </div>
  );
};
