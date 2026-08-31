import React, { useState } from "react";
import {
  Coins,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Building2,
  TrendingUp,
} from "lucide-react";

interface SubsidyOfferCardProps {
  data: {
    pending_action_id?: string;
    business_id?: string;
    business_name: string;
    scheme_id?: string;
    scheme_title?: string;
    hourly_subsidy: number;
    company_base_wage: number;
    combined_youth_wage: number;
    target_living_wage: number;
    max_hours_per_week: number;
    duration_weeks: number;
    total_grant_amount: number;
    scheme_remaining_budget?: number;
    notes?: string;
    status?: string;
  };
  onConfirm?: (actionId: string) => Promise<void>;
  onCancel?: (actionId: string) => Promise<void>;
  onSelectBusiness?: (businessId: string) => void;
}

export const SubsidyOfferCard: React.FC<SubsidyOfferCardProps> = ({
  data,
  onConfirm,
  onCancel,
  onSelectBusiness,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(
    data.status === "confirmed" ? "confirmed" : null,
  );

  const handleConfirm = async () => {
    if (!data.pending_action_id || !onConfirm) return;
    setSubmitting(true);
    try {
      await onConfirm(data.pending_action_id);
      setActionDone("confirmed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!data.pending_action_id || !onCancel) return;
    setSubmitting(true);
    try {
      await onCancel(data.pending_action_id);
      setActionDone("cancelled");
    } finally {
      setSubmitting(false);
    }
  };

  const isConfirmed = actionDone === "confirmed" || data.status === "confirmed";
  const isCancelled = actionDone === "cancelled" || data.status === "cancelled";

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-5 border border-emerald-500/30 shadow-xl space-y-4 my-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Grant Proposal
              </span>
              {data.scheme_title && (
                <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                  {data.scheme_title}
                </span>
              )}
            </div>
            <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5 pt-0.5">
              <span>{data.business_name}</span>
            </h4>
          </div>
        </div>

        {data.business_id && onSelectBusiness && (
          <button
            type="button"
            onClick={() => onSelectBusiness(data.business_id!)}
            className="text-[11px] text-emerald-300 hover:text-emerald-200 underline font-semibold cursor-pointer"
          >
            Locate on Map
          </button>
        )}
      </div>

      {/* Wage Bridge Breakdown */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-emerald-500/20 text-center">
        <div>
          <span className="text-[10px] text-slate-400 block">
            Employer Pays
          </span>
          <span className="text-sm font-bold text-slate-200">
            £{data.company_base_wage.toFixed(2)}/hr
          </span>
        </div>
        <div className="border-x border-slate-800">
          <span className="text-[10px] text-emerald-400 font-bold block">
            + Council Subsidy
          </span>
          <span className="text-sm font-extrabold text-emerald-300">
            £{data.hourly_subsidy.toFixed(2)}/hr
          </span>
        </div>
        <div>
          <span className="text-[10px] text-teal-300 block">= Living Wage</span>
          <span className="text-sm font-extrabold text-teal-300">
            £{data.combined_youth_wage.toFixed(2)}/hr
          </span>
        </div>
      </div>

      {/* Commitment Metrics */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> Weekly Hours
          </span>
          <span className="font-bold text-slate-100">
            {data.max_hours_per_week} hrs/wk
          </span>
        </div>
        <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-slate-400" /> Duration
          </span>
          <span className="font-bold text-slate-100">
            {data.duration_weeks} weeks
          </span>
        </div>
        <div className="bg-slate-900/80 p-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30">
          <span className="text-[10px] text-emerald-400 font-bold">
            Total Grant
          </span>
          <span className="font-extrabold text-emerald-300">
            £
            {data.total_grant_amount.toLocaleString("en-GB", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {data.notes && (
        <p className="text-[11px] text-slate-300 bg-slate-950/40 p-2 rounded-lg italic">
          "{data.notes}"
        </p>
      )}

      {/* Action Footer */}
      {isConfirmed ? (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Wage Subsidy Grant Authorized & Committed!</span>
        </div>
      ) : isCancelled ? (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
          <XCircle className="w-4 h-4 text-rose-400" />
          <span>Grant Proposal Cancelled.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-900/40 transition-all disabled:opacity-50 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {submitting ? "Authorizing..." : "Authorize & Commit Grant"}
            </span>
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
