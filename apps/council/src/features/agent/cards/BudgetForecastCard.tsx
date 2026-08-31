import React from "react";
import {
  TrendingUp,
  Users,
  Coins,
  Sparkles,
  Building,
  Landmark,
  CheckCircle,
} from "lucide-react";

interface BudgetForecastCardProps {
  data: {
    youth_cohort_size: number;
    hourly_subsidy: number;
    hours_per_week: number;
    duration_weeks: number;
    base_employer_wage: number;
    combined_hourly_rate: number;
    cost_per_placement: number;
    total_council_budget_required: number;
    employer_co_contribution_total: number;
    total_youth_wages_injected: number;
    social_mobility_multiplier: string;
    estimated_local_economic_benefit: number;
    affordable_from_current_balance?: boolean;
  };
}

export const BudgetForecastCard: React.FC<BudgetForecastCardProps> = ({
  data,
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-teal-500/30 shadow-xl space-y-4 my-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Economic Modeling
              </span>
              <span className="text-xs font-bold text-slate-300">
                {data.youth_cohort_size} Youth Placements Cohort
              </span>
            </div>
            <h4 className="font-extrabold text-sm text-white pt-0.5">
              Budget & Treasury Green Book ROI Projections
            </h4>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
        <div className="bg-slate-950/80 p-3 rounded-xl border border-teal-500/20">
          <span className="text-[10px] text-slate-400 block">
            Council Funding
          </span>
          <span className="font-extrabold text-teal-300 text-base">
            £
            {data.total_council_budget_required.toLocaleString("en-GB", {
              minimumFractionDigits: 0,
            })}
          </span>
          <span className="text-[10px] text-slate-400 block pt-0.5">
            (£{data.hourly_subsidy.toFixed(2)}/hr × {data.hours_per_week}h)
          </span>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">
            SME Contribution
          </span>
          <span className="font-extrabold text-slate-200 text-base">
            £
            {data.employer_co_contribution_total.toLocaleString("en-GB", {
              minimumFractionDigits: 0,
            })}
          </span>
          <span className="text-[10px] text-slate-400 block pt-0.5">
            (£{data.base_employer_wage.toFixed(2)}/hr base)
          </span>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">
            Total Youth Wages
          </span>
          <span className="font-extrabold text-emerald-400 text-base">
            £
            {data.total_youth_wages_injected.toLocaleString("en-GB", {
              minimumFractionDigits: 0,
            })}
          </span>
          <span className="text-[10px] text-emerald-400/80 block pt-0.5">
            £{data.combined_hourly_rate.toFixed(2)}/hr living wage
          </span>
        </div>

        <div className="bg-gradient-to-br from-teal-950/60 to-emerald-950/60 p-3 rounded-xl border border-emerald-500/40">
          <span className="text-[10px] text-emerald-300 font-bold block">
            Local Economic Benefit
          </span>
          <span className="font-extrabold text-emerald-300 text-base">
            £
            {data.estimated_local_economic_benefit.toLocaleString("en-GB", {
              minimumFractionDigits: 0,
            })}
          </span>
          <span className="text-[10px] text-emerald-400 font-extrabold block pt-0.5">
            {data.social_mobility_multiplier} Multiplier
          </span>
        </div>
      </div>

      {/* Cohort Specs */}
      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <span>
          <strong>Placement Duration:</strong> {data.duration_weeks} weeks (
          {data.duration_weeks / 4} months)
        </span>
        <span>
          <strong>Unit Cost per Youth:</strong> £
          {data.cost_per_placement.toLocaleString("en-GB")}
        </span>
        {data.affordable_from_current_balance !== undefined && (
          <span
            className={`font-bold ${data.affordable_from_current_balance ? "text-emerald-400" : "text-amber-400"}`}
          >
            {data.affordable_from_current_balance
              ? "✓ Within Budget"
              : "⚠️ Exceeds Current Balance"}
          </span>
        )}
      </div>
    </div>
  );
};
