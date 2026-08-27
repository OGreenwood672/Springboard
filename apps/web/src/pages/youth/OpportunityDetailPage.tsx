import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Opportunity } from '@springboard/shared-types';
import { opportunitiesApi } from '../../api/opportunities';
import { ApplicationModal } from '../../components/youth/ApplicationModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { OpportunityTypeBadge, WorkplaceBadge, OpportunityStatusBadge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  MapPin,
  Clock,
  Banknote,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Send,
} from 'lucide-react';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      opportunitiesApi
        .getOpportunity(id)
        .then((data) => setOpportunity(data))
        .catch(() => setOpportunity(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" text="Loading opportunity details..." />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Opportunity Not Found</h2>
        <p className="text-xs text-slate-500">
          This listing may have been removed or the URL is invalid.
        </p>
        <Link
          to="/opportunities"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </Link>
      </div>
    );
  }

  const deadlineFormatted = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/opportunities"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all opportunities</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <OpportunityTypeBadge type={opportunity.opportunity_type} />
            <WorkplaceBadge type={opportunity.workplace_type} />
            <OpportunityStatusBadge status={opportunity.status} />
          </div>

          {opportunity.deadline && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Deadline: {deadlineFormatted}</span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {opportunity.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mt-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              {opportunity.business_name || 'Verified Organisation'}
            </span>
            {opportunity.organisation_type && (
              <>
                <span>•</span>
                <span className="text-slate-500">{opportunity.organisation_type}</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider block">Location</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{opportunity.location_name || opportunity.postcode || 'United Kingdom'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider block">Pay / Compensation</span>
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{opportunity.pay_info || 'Voluntary / Unpaid'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider block">Schedule</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{opportunity.hours_or_commitment || 'Flexible hours'}</span>
            </div>
          </div>
        </div>

        {opportunity.status === 'published' && (
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            {isAuthenticated ? (
              role === 'youth' ? (
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Apply for this Opportunity</span>
                </button>
              ) : (
                <div className="text-xs text-slate-500">
                  You are viewing this listing as an employer.
                </div>
              )
            ) : (
              <Link
                to="/sign-up"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>Register to Apply</span>
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">About this Opportunity</h2>
            <div className="prose prose-slate text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Required Skills
            </h3>
            {opportunity.required_skills && opportunity.required_skills.length > 0 ? (
              <div className="space-y-2">
                {opportunity.required_skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-800 p-2 rounded-lg bg-emerald-50/70 border border-emerald-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No specific required skills listed (open to all beginners).</p>
            )}

            {opportunity.preferred_skills && opportunity.preferred_skills.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Preferred / Nice to have:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {opportunity.preferred_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ApplicationModal
        opportunity={opportunity}
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSuccess={() => {
          navigate('/applications');
        }}
      />
    </div>
  );
};
