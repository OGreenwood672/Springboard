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
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold underline"
          >
            Inspect SME
          </button>
        )}
      </div>

      {/* Wage Top-Up Equation */}
      <div className="bg-slate-950/80 rounded-xl p-3 border border-emerald-500/20 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">SME Affordable Rate:</span>
          <span className="font-bold text-slate-200">
            £{data.company_base_wage.toFixed(2)}/hr
          </span>
        </div>
        <div className="flex items-center justify-between text-emerald-400 font-bold">
          <span>+ Council Grant Subsidy:</span>
          <span>+£{data.hourly_subsidy.toFixed(2)}/hr</span>
        </div>
        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
          <span className="font-extrabold text-white">
            Total Wage for Young Worker:
          </span>
          <span className="text-sm font-extrabold text-emerald-300">
            £{data.combined_youth_wage.toFixed(2)}/hr
          </span>
        </div>
      </div>

      {/* Grant Commitment Terms */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Commitment</span>
          <strong className="text-white">
            {data.max_hours_per_week} hrs/wk
          </strong>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Duration</span>
          <strong className="text-white">{data.duration_weeks} wks</strong>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Total Grant</span>
          <strong className="text-emerald-400 font-extrabold">
            £{data.total_grant_amount.toLocaleString()}
          </strong>
        </div>
      </div>

      {/* Actions */}
      {!isConfirmed && !isCancelled && data.pending_action_id && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Decline
            </button>
          )}
          {onConfirm && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-300 shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{submitting ? "Pledging..." : "Commit Grant Pledge"}</span>
            </button>
          )}
        </div>
      )}

      {isConfirmed && (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            Wage subsidy pledge committed and recorded in Council Ledger.
          </span>
        </div>
      )}

      {isCancelled && (
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <XCircle className="w-4 h-4" />
          <span>Grant proposal was declined.</span>
        </div>
      )}
    </div>
  );
};
