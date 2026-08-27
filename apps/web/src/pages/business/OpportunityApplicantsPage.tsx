import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Opportunity, Application, Match, ApplicationStatus } from '@springboard/shared-types';
import { opportunitiesApi } from '../../api/opportunities';
import { businessesApi } from '../../api/businesses';
import { applicationsApi } from '../../api/applications';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  OpportunityTypeBadge,
  ApplicationStatusBadge,
  WorkplaceBadge,
} from '../../components/common/Badge';
import {
  Users,
  Sparkles,
  ArrowLeft,
  Frown,
} from 'lucide-react';

export const OpportunityApplicantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<'applications' | 'matches'>('applications');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [oppData, appsData, matchesData] = await Promise.all([
        opportunitiesApi.getOpportunity(id),
        businessesApi.getOpportunityApplications(id),
        businessesApi.getOpportunityMatches(id),
      ]);
      setOpportunity(oppData);
      setApplications(appsData);
      setMatches(matchesData);
    } catch (err: any) {
      showToast(err.message || 'Failed to load applicant data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await applicationsApi.updateStatus(appId, newStatus);
      showToast(`Application updated to '${newStatus}'`, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update application status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" text="Loading applicants & candidate matches..." />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-3xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Listing not found</h2>
        <Link to="/business/opportunities" className="text-xs text-indigo-600 font-semibold mt-2 inline-block">
          Return to listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/business/opportunities"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to listings</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <OpportunityTypeBadge type={opportunity.opportunity_type} />
            <WorkplaceBadge type={opportunity.workplace_type} />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Postcode: <b>{opportunity.postcode || 'N/A'}</b>
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {opportunity.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review submitted youth candidate applications and discover algorithmically matched candidate talent.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Direct Applications ({applications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Matched Candidates ({matches.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4 max-w-md mx-auto my-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Frown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No applications received yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                When youth candidates apply to this listing, their applications, cover notes, and qualifications will appear here.
              </p>
            </div>
          ) : (
            applications.map((app) => {
              const youth = app.youth_profile;
              const appliedDate = new Date(app.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {youth?.full_name || 'Youth Candidate'}
                        </h3>
                        <ApplicationStatusBadge status={app.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Applied on {appliedDate} • Location: {youth?.postcode || youth?.preferred_location || 'UK'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">Update Status:</span>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white uk-focus-ring cursor-pointer"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Not Selected</option>
                      </select>
                    </div>
                  </div>

                  {app.cover_note && (
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 block">Candidate Note:</span>
                      <p className="leading-relaxed italic">"{app.cover_note}"</p>
                    </div>
                  )}

                  {youth && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                          Education & Qualifications
                        </span>
                        <p className="text-slate-800 font-medium capitalize">
                          Stage: {youth.education_stage?.replace('_', ' ') || 'Student'}
                        </p>
                        {youth.qualifications && youth.qualifications.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {youth.qualifications.map((q, i) => (
                              <p key={i} className="text-slate-600 text-[11px]">
                                • {q.name} ({q.grade ? `Grade ${q.grade}` : 'Passed'})
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                          Candidate Skills
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {youth.skills?.map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-[11px] font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                          Availability & Travel
                        </span>
                        <p className="text-slate-800 font-medium">
                          Available: {youth.availability?.days?.join(', ') || 'Flexible'}
                        </p>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Max travel limit: {youth.max_travel_km} km
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'matches' && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4 max-w-md mx-auto my-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Frown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matches generated yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                As young people register and complete their profiles, our algorithm will automatically rank compatible candidate matches.
              </p>
            </div>
          ) : (
            matches.map((match) => {
              const youth = match.youth_profile;
              const factors = match.factors || {};

              return (
                <div
                  key={match.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">
                        {youth?.full_name || 'Youth Candidate'}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        {youth?.postcode || 'UK'} • {youth?.education_stage?.replace('_', ' ') || 'Student'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        Skills Match: <b>{factors.skills_score || 0}/35</b>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        Location: <b>{factors.location_score || 0}/25</b>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        Schedule: <b>{factors.availability_score || 0}/10</b>
                      </span>
                      {factors.distance_km !== null && factors.distance_km !== undefined && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold">
                          📍 {factors.distance_km} km distance
                        </span>
                      )}
                    </div>

                    {youth?.skills && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {youth.skills.map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 min-w-[110px] shrink-0">
                    <span className="text-2xl font-black">{Math.round(match.score)}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                      Match Score
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
