import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Application } from "@springboard/shared-types";
import { applicationsApi } from "../../api/applications";
import { useToast } from "../../context/ToastContext";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import {
  OpportunityTypeBadge,
  ApplicationStatusBadge,
} from "../../components/common/Badge";
import { Building2, Calendar, ArrowRight, XCircle, Frown } from "lucide-react";

export const YouthApplicationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationsApi.getMyApplications();
      setApplications(data);
    } catch (err: any) {
      showToast(err.message || "Failed to fetch applications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (appId: string) => {
    if (
      !window.confirm("Are you sure you want to withdraw this application?")
    ) {
      return;
    }
    try {
      await applicationsApi.updateStatus(appId, "withdrawn");
      showToast("Application withdrawn", "info");
      fetchApplications();
    } catch (err: any) {
      showToast(err.message || "Could not withdraw application", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              My Applications
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              {applications.length} Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your applications and review employer status updates in real
            time.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" text="Loading your application status..." />
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl p-12 text-center border border-slate-800 shadow-xl space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Frown className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white">
            No applications submitted yet
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Discover your algorithmically matched roles in your Match Matrix or
            apply through your AI Job Coach.
          </p>
          <Link
            to="/matches"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 transition-all shadow-md"
          >
            <span>View Match Matrix</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const opp = app.opportunity;
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
                className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {opp && (
                      <OpportunityTypeBadge
                        type={opp.opportunity_type}
                        size="sm"
                      />
                    )}
                    <ApplicationStatusBadge status={app.status} />
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {opp ? (
                        <Link
                          to={`/opportunities/${opp.id}`}
                          className="hover:text-emerald-400 transition-colors"
                        >
                          {opp.title}
                        </Link>
                      ) : (
                        "Opportunity"
                      )}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        {opp?.business_name || "Organisation Name"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Applied on {appliedDate}
                      </span>
                    </div>
                  </div>

                  {app.cover_note && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                      <span className="font-bold text-white block mb-0.5">
                        Your Note:
                      </span>
                      <p className="italic">"{app.cover_note}"</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {opp && (
                    <Link
                      to={`/opportunities/${opp.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      <span>View Listing</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {app.status !== "withdrawn" &&
                    app.status !== "rejected" &&
                    app.status !== "accepted" && (
                      <button
                        type="button"
                        onClick={() => handleWithdraw(app.id)}
                        className="text-xs font-semibold text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Withdraw</span>
                      </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
