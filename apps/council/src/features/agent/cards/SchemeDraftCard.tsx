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
            £{data.total_budget.toLocaleString("en-GB")}
          </span>
        </div>
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Top-up Rate</span>
          <span className="font-extrabold text-emerald-400 text-sm">
            £{data.hourly_rate.toFixed(2)}/hr
          </span>
        </div>
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Weekly Cap</span>
          <span className="font-bold text-slate-200">
            {data.max_hours_per_week} hrs/wk
          </span>
        </div>
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">
            Placement Max
          </span>
          <span className="font-bold text-slate-200">
            {data.duration_months} months
          </span>
        </div>
      </div>

      {/* Target Tags */}
      {(data.target_postcodes || data.target_sectors) && (
        <div className="space-y-1.5 text-xs">
          {data.target_postcodes && data.target_postcodes.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[11px] text-slate-400">Target Wards:</span>
              {data.target_postcodes.map((pc) => (
                <span
                  key={pc}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300"
                >
                  {pc}
                </span>
              ))}
            </div>
          )}
          {data.target_sectors && data.target_sectors.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-[11px] text-slate-400">Sectors:</span>
              {data.target_sectors.map((sec) => (
                <span
                  key={sec}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300"
                >
                  {sec}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      {isConfirmed ? (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Scheme Activated & Funded!</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-extrabold text-xs shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{submitting ? "Activating..." : "Launch & Fund Scheme"}</span>
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
