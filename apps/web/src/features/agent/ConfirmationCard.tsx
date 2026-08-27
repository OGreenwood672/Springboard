import React, { useState } from "react";
import { ConfirmationCardData } from "@springboard/shared-types";
import { Check, X, Clock, AlertCircle } from "lucide-react";

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
    setSubmitting(true);
    try {
      await onConfirm(data.pending_action_id);
      setActionStatus("confirmed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setSubmitting(true);
    try {
      await onCancel(data.pending_action_id);
      setActionStatus("cancelled");
    } finally {
      setSubmitting(false);
    }
  };

  const isPending = actionStatus === "pending";

  return (
    <div className="my-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 shadow-sm text-slate-800 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-amber-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-200 text-amber-900">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{data.title}</h4>
            <span className="text-[11px] text-amber-800 font-medium">
              Requires your explicit confirmation
            </span>
          </div>
        </div>

        {/* Status Badge */}
        {!isPending && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
              actionStatus === "confirmed"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {actionStatus === "confirmed" ? "✓ Confirmed" : "✕ Cancelled"}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-700 leading-relaxed">
        {data.description}
      </p>

      {/* Changes Diff / Key-Value Breakdown */}
      {data.diff_summary && Object.keys(data.diff_summary).length > 0 && (
        <div className="rounded-xl bg-white/90 p-3 border border-amber-200/60 text-xs space-y-1.5 shadow-2xs">
          <span className="block font-semibold uppercase tracking-wider text-slate-500 text-[10px]">
            Proposed Changes:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(data.diff_summary).map(([key, val]) => (
              <div
                key={key}
                className="flex items-start justify-between gap-2 py-0.5 border-b border-slate-100 last:border-0"
              >
                <span className="font-semibold text-slate-600 capitalize">
                  {key}:
                </span>
                <span className="font-medium text-slate-900 text-right truncate max-w-[200px]">
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

      {/* Action Buttons (Only visible when pending) */}
      {isPending && (
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-rose-600 disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
          >
            <X className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            <span>{submitting ? "Applying..." : "Confirm & Apply"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
