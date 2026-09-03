import React, { useState, useEffect } from "react";
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
  Zap,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              Employer Directory
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Local Businesses & Wage Gap Roster
          </h1>
          <p className="text-xs text-slate-400">
            Assess local SME wage capacity, verify youth mentorship criteria,
            and allocate direct hourly wage grants.
          </p>
        </div>

        <div className="bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800 shadow-xl text-xs font-mono text-slate-300">
          Total Companies:{" "}
          <strong className="text-white font-black">{businesses.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 p-4 rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 min-w-[240px] relative"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by company name, postcode, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300 focus:outline-none"
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
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300 focus:outline-none"
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
            className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300 focus:outline-none"
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
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="md" text="Loading company roster..." />
        </div>
      ) : businesses.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl p-12 text-center border border-slate-800 text-slate-400">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-white">
            No businesses match your filter criteria.
          </p>
          <p className="text-xs mt-1 text-slate-500">
            Try broadening your search or resetting status filters.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Organisation Name & Sector</th>
                  <th className="px-4 py-4">Size</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Base Wage</th>
                  <th className="px-4 py-4">Hourly Gap</th>
                  <th className="px-4 py-4">Deprivation Catchment</th>
                  <th className="px-4 py-4">Live Roles</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
                {businesses.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-850/50 transition-colors"
                  >
                    {/* Name & Sector */}
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-white text-sm block font-sans">
                          {b.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                          <span className="text-emerald-400">
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
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {b.employee_count} staff
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <SubsidyStatusBadge status={b.wage_subsidy_status} />
                    </td>

                    {/* Current Wage */}
                    <td className="px-4 py-4 font-bold text-white">
                      £{b.current_wage_offered.toFixed(2)} / hr
                    </td>

                    {/* Hourly Wage Gap */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                        +£{b.hourly_wage_gap.toFixed(2)} / hr
                      </span>
                    </td>

                    {/* Catchment Score */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-black text-amber-400">
                          {b.low_income_catchment_score}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          / 100
                        </span>
                      </div>
                      <div className="w-16 bg-slate-950 rounded-full h-1 mt-1 overflow-hidden border border-slate-800">
                        <div
                          className="bg-amber-400 h-full rounded-full"
                          style={{ width: `${b.low_income_catchment_score}%` }}
                        />
                      </div>
                    </td>

                    {/* Opportunities */}
                    <td className="px-4 py-4 font-bold text-white">
                      {b.open_opportunities_count} live
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      {b.wage_subsidy_status === "active_subsidised" ? (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                          Active Subsidy
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedBusiness(b)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-black shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
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
