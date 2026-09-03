import React, { useState } from "react";
import { ConfirmationCardData } from "@springboard/shared-types";
import { Check, X, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";

interface ConfirmationCardProps {
  data: ConfirmationCardData;
  onConfirm: (pendingActionId: string) => Promise<void>;
  onCancel: (pendingActionId: string) => Promise<void>;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  data,
  onConfirm,
  onCancel,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [actionStatus, setActionStatus] = useState<string>(
    data.status || "pending",
  );

  const handleConfirm = async () => {
    const actionId = data.pending_action_id || data.action_id || "";
    if (!actionId) return;
    setSubmitting(true);
    try {
      await onConfirm(actionId);
      setActionStatus("confirmed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    const actionId = data.pending_action_id || data.action_id || "";
    if (!actionId) return;
    setSubmitting(true);
    try {
      await onCancel(actionId);
      setActionStatus("cancelled");
    } finally {
      setSubmitting(false);
    }
  };

  const isPending = actionStatus === "pending";

  return (
    <div className="my-3 rounded-2xl border border-amber-500/30 bg-slate-900/95 p-4 sm:p-5 shadow-xl text-slate-100 space-y-3.5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">{data.title}</h4>
            <span className="text-[11px] text-amber-300/90 font-mono font-medium flex items-center gap-1 pt-0.5">
              <ShieldCheck className="w-3 h-3" /> Requires explicit human
              confirmation
            </span>
          </div>
        </div>

        {/* Status Badge */}
        {!isPending && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${
              actionStatus === "confirmed"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
            }`}
          >
            {actionStatus === "confirmed" ? "✓ Confirmed" : "✕ Cancelled"}
          </span>
        )}
      </div>

      {/* Description */}
      {data.description && (
        <p className="text-xs text-slate-300 leading-relaxed">
          {data.description}
        </p>
      )}

      {/* Changes Diff / Key-Value Breakdown */}
      {data.diff_summary && Object.keys(data.diff_summary).length > 0 && (
        <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-xs space-y-2">
          <span className="block font-mono font-bold uppercase tracking-wider text-slate-400 text-[10px]">
            Proposed Modifications:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[11px]">
            {Object.entries(data.diff_summary).map(([key, val]) => (
              <div
                key={key}
                className="flex items-start justify-between gap-2 py-0.5 border-b border-slate-900 last:border-0"
              >
                <span className="text-slate-400 capitalize">{key}:</span>
                <span className="font-bold text-slate-100 text-right truncate max-w-[200px]">
                  {Array.isArray(val)
                    ? val.join(", ")
                    : typeof val === "object"
                      ? JSON.stringify(val)
                      : String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isPending ? (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2.5 text-xs font-black text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-md shadow-emerald-950/40 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>{submitting ? "Committing..." : "Confirm & Apply"}</span>
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-800 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50 transition-all cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      ) : (
        <p className="text-[11px] font-mono text-slate-400 italic">
          {actionStatus === "confirmed"
            ? "Action committed to database with full audit trail."
            : "Action cancelled. No database alterations made."}
        </p>
      )}
    </div>
  );
};
