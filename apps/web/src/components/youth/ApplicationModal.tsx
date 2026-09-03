import React, { useState } from "react";
import { Opportunity } from "@springboard/shared-types";
import { applicationsApi } from "../../api/applications";
import { useToast } from "../../context/ToastContext";
import { X, Send, CheckCircle2 } from "lucide-react";
import { OpportunityTypeBadge } from "../common/Badge";

interface ApplicationModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [coverNote, setCoverNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !opportunity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await applicationsApi.apply({
        opportunity_id: opportunity.id,
        cover_note: coverNote.trim() || undefined,
      });
      showToast("Application submitted successfully!", "success");
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || "Failed to submit application", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-800 relative animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Submit Application
            </span>
            <h3 className="text-xl font-black text-white mt-1">
              {opportunity.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {opportunity.business_name || "Organisation Name"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Type:</span>
              <OpportunityTypeBadge
                type={opportunity.opportunity_type}
                size="sm"
              />
            </div>
            {opportunity.pay_info && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400">
                  Pay / Reward:
                </span>
                <span className="font-bold text-emerald-300">
                  {opportunity.pay_info}
                </span>
              </div>
            )}
            {opportunity.hours_or_commitment && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400">
                  Commitment:
                </span>
                <span className="text-slate-300">
                  {opportunity.hours_or_commitment}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Cover Note / Why are you interested? (Optional)
            </label>
            <textarea
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Tell the employer briefly why you'd like this opportunity and what skills you bring..."
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-emerald-500 uk-focus-ring resize-none"
            />
          </div>

          <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Your youth profile details and qualifications will be securely
              shared with the employer for review.
            </span>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-md shadow-emerald-950/40 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {submitting ? "Submitting..." : "Confirm Application"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
