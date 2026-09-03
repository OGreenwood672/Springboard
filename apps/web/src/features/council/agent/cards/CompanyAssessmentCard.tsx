import React from "react";
import {
  Building2,
  MapPin,
  Award,
  CheckCircle2,
  AlertCircle,
  Coins,
  ArrowRight,
  Eye,
} from "lucide-react";

interface CompanyAssessmentCardProps {
  data: {
    business_id: string;
    name: string;
    organisation_type: string;
    company_size: string;
    employee_count?: number;
    address?: string;
    postcode: string;
    current_wage: number;
    target_wage: number;
    hourly_wage_gap: number;
    recommended_hourly_subsidy?: number;
    catchment_score: number;
    status: string;
    mentorship: boolean;
    open_roles?: number;
    estimated_grant_24_weeks_16_hrs?: number;
  };
  onPledgeClick?: (
    businessId: string,
    businessName: string,
    recommendedRate: number,
  ) => void;
  onLocateMap?: (businessId: string) => void;
}

export const CompanyAssessmentCard: React.FC<CompanyAssessmentCardProps> = ({
  data,
  onPledgeClick,
  onLocateMap,
}) => {
  const isSubsidised = data.status === "active_subsidised";
  const isPledged = data.status === "pledged";

  return (
    <div className="bg-slate-900 rounded-2xl p-4.5 border border-slate-800 shadow-xl space-y-3.5 my-2 text-slate-100 transition-all hover:border-slate-700">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 border border-slate-700">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-sm text-white leading-tight">
              {data.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-0.5 flex-wrap font-mono">
              <span className="text-emerald-400">{data.organisation_type}</span>
              <span>•</span>
              <span className="capitalize">{data.company_size} Enterprise</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-slate-300 font-semibold">
                <MapPin className="w-3 h-3 text-slate-500" /> {data.postcode}
              </span>
            </div>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 border ${
            isSubsidised
              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
              : isPledged
                ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
                : "bg-amber-500/15 text-amber-300 border-amber-500/30"
          }`}
        >
          {isSubsidised
            ? "Active Subsidised"
            : isPledged
              ? "Pledge Committed"
              : "Subsidy Eligible"}
        </span>
      </div>

      {/* Wage Gap & Catchment Metrics */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center font-mono">
        <div>
          <span className="text-[10px] text-slate-400 block">
            Affordable Base
          </span>
          <span className="text-xs font-bold text-white">
            £{data.current_wage.toFixed(2)}/hr
          </span>
        </div>
        <div className="border-x border-slate-800">
          <span className="text-[10px] text-amber-400 font-bold block">
            Wage Gap
          </span>
          <span className="text-xs font-black text-amber-400">
            £{data.hourly_wage_gap.toFixed(2)}/hr
          </span>
        </div>
        <div>
          <span className="text-[10px] text-emerald-400 font-bold block">
            Catchment Priority
          </span>
          <span className="text-xs font-black text-emerald-400">
            {data.catchment_score.toFixed(0)}/100
          </span>
        </div>
      </div>

      {/* Mentorship & Open Roles */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
        <div className="flex items-center gap-1.5">
          {data.mentorship ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Youth Mentorship
              Committed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-500 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5" /> Mentorship unverified
            </span>
          )}
        </div>
        {data.open_roles !== undefined && data.open_roles > 0 && (
          <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-md border border-indigo-500/30">
            {data.open_roles} Open Vacancy
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
        {onLocateMap && (
          <button
            type="button"
            onClick={() => onLocateMap(data.business_id)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Map Pin</span>
          </button>
        )}
        {onPledgeClick && !isSubsidised && (
          <button
            type="button"
            onClick={() =>
              onPledgeClick(
                data.business_id,
                data.name,
                data.recommended_hourly_subsidy || data.hourly_wage_gap || 4.5,
              )
            }
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Pledge Wage Subsidy</span>
          </button>
        )}
      </div>
    </div>
  );
};
