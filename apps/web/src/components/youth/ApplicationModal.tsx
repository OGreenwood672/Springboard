import React, { useState } from 'react';
import { Opportunity } from '@springboard/shared-types';
import { applicationsApi } from '../../api/applications';
import { useToast } from '../../context/ToastContext';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { OpportunityTypeBadge } from '../common/Badge';

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
  const [coverNote, setCoverNote] = useState('');
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
      showToast('Application submitted successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Submit Application
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{opportunity.title}</h3>
            <p className="text-xs text-slate-500">{opportunity.business_name || 'Organisation'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Type:</span>
              <OpportunityTypeBadge type={opportunity.opportunity_type} size="sm" />
            </div>
            {opportunity.pay_info && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Pay / Reward:</span>
                <span className="font-bold text-emerald-700">{opportunity.pay_info}</span>
              </div>
            )}
            {opportunity.hours_or_commitment && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Commitment:</span>
                <span className="text-slate-600">{opportunity.hours_or_commitment}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Cover Note / Why are you interested? (Optional)
            </label>
            <textarea
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Tell the employer briefly why you'd like this opportunity and what skills you bring..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white uk-focus-ring resize-none"
            />
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Your youth profile details and qualifications will be securely shared with the organisation for review.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Confirm Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
