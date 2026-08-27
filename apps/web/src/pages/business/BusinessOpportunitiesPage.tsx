import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Opportunity } from "@springboard/shared-types";
import { opportunitiesApi } from "../../api/opportunities";
import { useToast } from "../../context/ToastContext";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import {
  OpportunityTypeBadge,
  WorkplaceBadge,
  OpportunityStatusBadge,
} from "../../components/common/Badge";
import {
  PlusCircle,
  Users,
  Edit,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  Frown,
  Bot,
} from "lucide-react";

export const BusinessOpportunitiesPage: React.FC = () => {
  const { showToast } = useToast();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const data = await opportunitiesApi.getOpportunities({
        my_business_only: true,
      });
      setOpportunities(data);
    } catch (err: any) {
      showToast(err.message || "Failed to load your opportunities", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handlePublish = async (id: string) => {
    try {
      await opportunitiesApi.publishOpportunity(id);
      showToast("Opportunity published and live for applications!", "success");
      fetchOpportunities();
    } catch (err: any) {
      showToast(err.message || "Could not publish opportunity", "error");
    }
  };

  const handleClose = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to close this listing? It will stop receiving new applications.",
      )
    ) {
      return;
    }
    try {
      await opportunitiesApi.closeOpportunity(id);
      showToast("Opportunity closed", "info");
      fetchOpportunities();
    } catch (err: any) {
      showToast(err.message || "Could not close opportunity", "error");
    }
  };

  const filteredOpps =
    statusFilter === "all"
      ? opportunities
      : opportunities.filter((o) => o.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Opportunity Listings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
              {opportunities.length} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage your listings, review youth candidates, and inspect
            algorithmically matched profiles.
          </p>
        </div>

        <Link
          to="/business/assistant"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Bot className="w-4 h-4" />
          <span>Post Role via Recruiter AI</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {["all", "published", "draft", "closed"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              statusFilter === st
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {st} (
            {st === "all"
              ? opportunities.length
              : opportunities.filter((o) => o.status === st).length}
            )
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" text="Loading your listings..." />
        </div>
      ) : filteredOpps.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Frown className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            No opportunities found
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {statusFilter === "all"
              ? "You haven't posted any opportunities yet. Ask Recruiter AI in the chat to create your first vacancy."
              : `No listings currently marked as '${statusFilter}'.`}
          </p>
          <Link
            to="/business/assistant"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>Post a Role via Recruiter AI</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOpps.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <OpportunityTypeBadge type={opp.opportunity_type} size="sm" />
                  <WorkplaceBadge type={opp.workplace_type} size="sm" />
                  <OpportunityStatusBadge status={opp.status} size="sm" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {opp.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {opp.location_name || opp.postcode || "UK Location"}
                    </span>
                    {opp.pay_info && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-emerald-800">
                          {opp.pay_info}
                        </span>
                      </>
                    )}
                    {opp.hours_or_commitment && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {opp.hours_or_commitment}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed max-w-3xl">
                  {opp.description}
                </p>
              </div>

              <div className="flex flex-wrap lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2.5 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <Link
                  to={`/business/opportunities/${opp.id}/applicants`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    Applicants & Matches ({opp.applications_count || 0})
                  </span>
                </Link>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/business/opportunities/${opp.id}/edit`}
                    className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                    title="Edit listing"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  {opp.status === "draft" && (
                    <button
                      type="button"
                      onClick={() => handlePublish(opp.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Publish</span>
                    </button>
                  )}

                  {opp.status === "published" && (
                    <button
                      type="button"
                      onClick={() => handleClose(opp.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Close</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
