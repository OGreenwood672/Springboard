import React, { useState } from "react";
import {
  Landmark,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Tag,
  Calendar,
  Coins,
} from "lucide-react";

interface SchemeDraftCardProps {
  data: {
    pending_action_id?: string;
    title: string;
    description?: string;
    total_budget: number;
    hourly_rate: number;
    max_hours_per_week: number;
    duration_months: number;
    target_postcodes?: string[];
    target_sectors?: string[];
    status?: string;
  };
  onConfirm?: (actionId: string) => Promise<void>;
  onCancel?: (actionId: string) => Promise<void>;
}

export const SchemeDraftCard: React.FC<SchemeDraftCardProps> = ({
  data,
  onConfirm,
  onCancel,
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

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-indigo-500/30 shadow-xl space-y-4 my-2">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            New Fund Scheme
          </span>
          <h4 className="font-extrabold text-sm text-white pt-0.5">
            {data.title}
          </h4>
        </div>
      </div>

      {data.description && (
        <p className="text-xs text-slate-300 leading-relaxed">
          {data.description}
        </p>
      )}

      {/* Fund Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Total Fund</span>
          <span className="font-extrabold text-indigo-300 text-sm">
            £{data.total_budget.toLocaleString()}
          </span>
        </div>
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Hourly Grant</span>
          <span className="font-extrabold text-emerald-400 text-sm">
            £{data.hourly_rate.toFixed(2)}/hr
          </span>
        </div>
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Max Hours</span>
          <span className="font-extrabold text-white text-sm">
            {data.max_hours_per_week}h/wk
          </span>
        </div>
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Duration</span>
          <span className="font-extrabold text-white text-sm">
            {data.duration_months} mo
          </span>
        </div>
      </div>

      {/* Actions */}
      {!isConfirmed && data.pending_action_id && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          )}
          {onConfirm && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black text-xs hover:from-indigo-400 hover:to-purple-400 shadow-md transition-all cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{submitting ? "Launching..." : "Launch Scheme Fund"}</span>
            </button>
          )}
        </div>
      )}

      {isConfirmed && (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4" />
          <span>Funding scheme launched and ring-fenced!</span>
        </div>
      )}
    </div>
  );
};
