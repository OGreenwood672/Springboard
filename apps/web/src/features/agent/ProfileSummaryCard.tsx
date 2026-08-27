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
    <div className="my-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs space-y-2.5 text-slate-800">
      <div className="flex items-center gap-2 border-b border-emerald-200/80 pb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <UserCheck className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            {data.full_name || "Youth Profile"}
          </h4>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            {data.postcode && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-700" />
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
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Skills
          </span>
          <div className="flex flex-wrap gap-1">
            {data.skills.map((s, idx) => (
              <span
                key={idx}
                className="rounded-md bg-white border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-900"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      {data.availability?.days && data.availability.days.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
          <Calendar className="h-3.5 w-3.5 text-emerald-600" />
          <span className="font-semibold">Available:</span>
          <span>{data.availability.days.join(", ")}</span>
          {data.availability.hours_per_week && (
            <span>({data.availability.hours_per_week} hrs/wk)</span>
          )}
        </div>
      )}
    </div>
  );
};
