import React, { useState, useEffect, useMemo } from "react";
import { councilsApi } from "../api/councils";
import { EligibleBusiness } from "@springboard/shared-types";
import {
  SubsidyStatusBadge,
  CompanySizeBadge,
} from "../components/common/Badge";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { OfferSubsidyModal } from "../features/subsidies/OfferSubsidyModal";
import {
  Building2,
  Search,
  Filter,
  Coins,
  MapPin,
  Users,
  Briefcase,
  Sparkles,
  ArrowUpDown,
  ChevronRight,
} from "lucide-react";

export const EligibleCompaniesPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<EligibleBusiness[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBusiness, setSelectedBusiness] =
    useState<EligibleBusiness | null>(null);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const data = await councilsApi.getEligibleBusinesses({
        sector: sectorFilter,
        company_size: sizeFilter,
        status: statusFilter,
        search: searchQuery,
      });
      setBusinesses(data);
    } catch (err) {
      console.error("Failed to load eligible businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, [sectorFilter, sizeFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBusinesses();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
              Employer Directory
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Local Businesses & Wage Gap Roster
          </h1>
          <p className="text-xs text-slate-500">
            Assess local SME wage capacity, verify youth mentorship criteria,
            and allocate direct wage grants.
          </p>
        </div>

        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-2xs text-xs font-semibold text-slate-600">
          Total Companies:{" "}
          <strong className="text-slate-900">{businesses.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 min-w-[240px] relative"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company name, postcode, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
          >
            <option value="all">All Subsidy Statuses</option>
            <option value="eligible">Eligible for Subsidy</option>
            <option value="active_subsidised">Active Subsidised</option>
            <option value="pledged">Pledged / Review</option>
            <option value="ineligible">Ineligible (Large)</option>
          </select>

          {/* Size Filter */}
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
          >
            <option value="all">All Company Sizes</option>
            <option value="micro">Micro (&lt;10 employees)</option>
            <option value="small">Small (10-49 employees)</option>
            <option value="medium">Medium (50-249 employees)</option>
          </select>

          {/* Sector Filter */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700"
          >
            <option value="all">All Sectors</option>
            <option value="technology">Technology</option>
            <option value="hospitality">Hospitality & Food</option>
            <option value="retail">Retail & Trade</option>
            <option value="green">Green Energy & Trades</option>
            <option value="charity">Community & Charity</option>
          </select>
        </div>
      </div>

      {/* Companies Table / Grid */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner size="md" text="Loading company roster..." />
        </div>
      ) : businesses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700">
            No businesses match your filter criteria.
          </p>
          <p className="text-xs mt-1">
            Try broadening your search or resetting status filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="px-6 py-4">Organisation & Sector</th>
                  <th className="px-4 py-4">Size</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Affordable Base Wage</th>
                  <th className="px-4 py-4">Hourly Wage Gap</th>
                  <th className="px-4 py-4">Deprivation Catchment</th>
                  <th className="px-4 py-4">Live Roles</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {businesses.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Name & Sector */}
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">
                          {b.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-medium text-emerald-800">
                            {b.organisation_type}
                          </span>
                          <span>•</span>
                          <span>{b.postcode || "HP5 2UR"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-4 py-4">
                      <CompanySizeBadge size={b.company_size} />
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {b.employee_count} staff
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <SubsidyStatusBadge status={b.wage_subsidy_status} />
                    </td>

                    {/* Current Wage */}
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      £{b.current_wage_offered.toFixed(2)} / hr
                    </td>

                    {/* Hourly Wage Gap */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-extrabold text-xs border border-emerald-200">
                        +£{b.hourly_wage_gap.toFixed(2)} / hr
                      </span>
                    </td>

                    {/* Catchment Score */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-amber-700">
                          {b.low_income_catchment_score}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          / 100
                        </span>
                      </div>
                      <div className="w-16 bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${b.low_income_catchment_score}%` }}
                        />
                      </div>
                    </td>

                    {/* Opportunities */}
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {b.open_opportunities_count} live
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      {b.wage_subsidy_status === "active_subsidised" ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          Active Subsidy
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedBusiness(b)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>Offer Subsidy</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {selectedBusiness && (
        <OfferSubsidyModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onSuccess={() => {
            setSelectedBusiness(null);
            loadBusinesses();
          }}
        />
      )}
    </div>
  );
};
