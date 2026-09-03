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
          <span className="text-[10px] text-slate-400 block">Council Cost</span>
          <span className="font-extrabold text-teal-300 text-sm">
            £{data.total_council_budget_required.toLocaleString()}
          </span>
        </div>
        <div className="bg-slate-950/80 p-3 rounded-xl border border-teal-500/20">
          <span className="text-[10px] text-slate-400 block">
            Employer Co-Fund
          </span>
          <span className="font-extrabold text-white text-sm">
            £{data.employer_co_contribution_total.toLocaleString()}
          </span>
        </div>
        <div className="bg-slate-950/80 p-3 rounded-xl border border-teal-500/20">
          <span className="text-[10px] text-slate-400 block">
            Wages Injected
          </span>
          <span className="font-extrabold text-emerald-400 text-sm">
            £{data.total_youth_wages_injected.toLocaleString()}
          </span>
        </div>
        <div className="bg-slate-950/80 p-3 rounded-xl border border-teal-500/20">
          <span className="text-[10px] text-slate-400 block">Social ROI</span>
          <span className="font-extrabold text-amber-400 text-sm">
            {data.social_mobility_multiplier}
          </span>
        </div>
      </div>

      {/* Detailed Parameters */}
      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 text-slate-300 font-mono">
        <div className="flex justify-between">
          <span className="text-slate-400">Cohort Size:</span>
          <span className="font-bold text-white">
            {data.youth_cohort_size} young workers
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Hourly Subsidy / Youth:</span>
          <span className="font-bold text-emerald-400">
            £{data.hourly_subsidy.toFixed(2)}/hr
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Weekly Commitment:</span>
          <span className="font-bold text-white">
            {data.hours_per_week} hrs/week
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Duration:</span>
          <span className="font-bold text-white">
            {data.duration_weeks} weeks ({data.duration_weeks / 4} months)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Cost per Placement:</span>
          <span className="font-bold text-teal-300">
            £{data.cost_per_placement.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Economic Benefit Card */}
      <div className="p-3 bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/30 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs text-emerald-200">
            Estimated Local Economic Benefit:
          </span>
        </div>
        <span className="text-sm font-extrabold text-emerald-300 font-mono">
          £{data.estimated_local_economic_benefit.toLocaleString()}
        </span>
      </div>
    </div>
  );
};
