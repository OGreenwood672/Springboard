import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Opportunity,
  Application,
  Match,
  ApplicationStatus,
} from "@springboard/shared-types";
import { opportunitiesApi } from "../../api/opportunities";
import { businessesApi } from "../../api/businesses";
import { applicationsApi } from "../../api/applications";
import { useToast } from "../../context/ToastContext";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import {
  OpportunityTypeBadge,
  ApplicationStatusBadge,
  WorkplaceBadge,
} from "../../components/common/Badge";
import { Users, Sparkles, ArrowLeft, Frown } from "lucide-react";

export const OpportunityApplicantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<"applications" | "matches">(
    "applications",
  );
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
      showToast(err.message || "Failed to load applicant data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleStatusChange = async (
    appId: string,
    newStatus: ApplicationStatus,
  ) => {
    try {
      await applicationsApi.updateStatus(appId, newStatus);
      showToast(`Application updated to '${newStatus}'`, "success");
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Failed to update application status", "error");
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner
          size="lg"
          text="Loading applicants & candidate matches..."
        />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-slate-900 p-8 rounded-3xl border border-slate-800 text-slate-100">
        <h2 className="text-xl font-bold text-white">Listing not found</h2>
        <Link
          to="/business/opportunities"
          className="text-xs text-indigo-400 font-semibold mt-2 inline-block hover:underline"
        >
          Return to listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      <Link
        to="/business/opportunities"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to listings</span>
      </Link>

      <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <OpportunityTypeBadge type={opportunity.opportunity_type} />
            <WorkplaceBadge type={opportunity.workplace_type} />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Postcode:{" "}
            <b className="text-white">{opportunity.postcode || "N/A"}</b>
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {opportunity.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review submitted youth candidate applications and discover
            algorithmically matched candidate talent.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("applications")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "applications"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-950/40 font-black"
                : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Direct Applications ({applications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("matches")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "matches"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-950/40 font-black"
                : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Matched Candidates ({matches.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "applications" && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-slate-900/90 rounded-3xl p-12 text-center border border-slate-800 shadow-xl space-y-4 max-w-md mx-auto my-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-850 text-slate-500 flex items-center justify-center mx-auto border border-slate-800">
                <Frown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                No applications received yet
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When youth candidates apply to this listing, their applications,
                cover notes, and qualifications will appear here.
              </p>
            </div>
          ) : (
            applications.map((app) => {
              const youth = app.youth_profile;
              const appliedDate = new Date(app.created_at).toLocaleDateString(
                "en-GB",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                },
              );

              return (
                <div
                  key={app.id}
                  className="bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white">
                          {youth?.full_name || "Youth Candidate"}
                        </h3>
                        <ApplicationStatusBadge status={app.status} />
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        Applied on {appliedDate} • Location:{" "}
                        {youth?.postcode ||
                          youth?.preferred_location ||
                          "Buckinghamshire"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Update Status:
                      </span>
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(
                            app.id,
                            e.target.value as ApplicationStatus,
                          )
                        }
                        className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:bg-slate-900 focus:border-indigo-500 uk-focus-ring cursor-pointer"
                      >
                        <option
                          value="submitted"
                          className="bg-slate-900 text-white"
                        >
                          Submitted
                        </option>
                        <option
                          value="reviewed"
                          className="bg-slate-900 text-white"
                        >
                          Reviewed
                        </option>
                        <option
                          value="shortlisted"
                          className="bg-slate-900 text-white"
                        >
                          Shortlisted
                        </option>
                        <option
                          value="accepted"
                          className="bg-slate-900 text-white"
                        >
                          Accepted
                        </option>
                        <option
                          value="rejected"
                          className="bg-slate-900 text-white"
                        >
                          Not Selected
                        </option>
                      </select>
                    </div>
                  </div>

                  {app.cover_note && (
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
                      <span className="font-bold text-white block">
                        Candidate Note:
                      </span>
                      <p className="leading-relaxed italic text-slate-300">
                        "{app.cover_note}"
                      </p>
                    </div>
                  )}

                  {youth && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pt-4 border-t border-slate-800">
                      <div>
                        <span className="text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider block mb-1">
                          Education & Qualifications
                        </span>
                        <p className="text-white font-medium capitalize">
                          Stage:{" "}
                          {youth.education_stage?.replace("_", " ") ||
                            "Student"}
                        </p>
                        {youth.qualifications &&
                          youth.qualifications.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {youth.qualifications.map((q, i) => (
                                <p
                                  key={i}
                                  className="text-slate-400 text-[11px] font-mono"
                                >
                                  • {q.name} (
                                  {q.grade ? `Grade ${q.grade}` : "Passed"})
                                </p>
                              ))}
                            </div>
                          )}
                      </div>

                      <div>
                        <span className="text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider block mb-1">
                          Candidate Skills
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {youth.skills?.map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider block mb-1">
                          Availability & Travel
                        </span>
                        <p className="text-white font-medium">
                          Available:{" "}
                          {youth.availability?.days?.join(", ") || "Flexible"}
                        </p>
                        <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                          Max travel limit:{" "}
                          <span className="text-emerald-400 font-bold">
                            {youth.max_travel_km} km
                          </span>
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

      {activeTab === "matches" && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="bg-slate-900/90 rounded-3xl p-12 text-center border border-slate-800 shadow-xl space-y-4 max-w-md mx-auto my-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-850 text-slate-500 flex items-center justify-center mx-auto border border-slate-800">
                <Frown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                No matches generated yet
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                As young people register and complete their profiles, our
                algorithm will automatically rank compatible candidate matches.
              </p>
            </div>
          ) : (
            matches.map((match) => {
              const youth = match.youth_profile;
              const factors = match.factors || {};

              return (
                <div
                  key={match.id}
                  className="bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-white">
                        {youth?.full_name || "Youth Candidate"}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        {youth?.postcode || "UK"} •{" "}
                        {youth?.education_stage?.replace("_", " ") || "Student"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        Skills Match:{" "}
                        <b className="text-indigo-400">
                          {factors.skills_score || 0}/35
                        </b>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        Location:{" "}
                        <b className="text-indigo-400">
                          {factors.location_score || 0}/25
                        </b>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        Schedule:{" "}
                        <b className="text-indigo-400">
                          {factors.availability_score || 0}/10
                        </b>
                      </span>
                      {factors.distance_km !== null &&
                        factors.distance_km !== undefined && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                            📍 {factors.distance_km} km distance
                          </span>
                        )}
                    </div>

                    {youth?.skills && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {youth.skills.map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-mono"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 min-w-[110px] shrink-0 font-mono">
                    <span className="text-2xl font-black text-white">
                      {Math.round(match.score)}%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
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
