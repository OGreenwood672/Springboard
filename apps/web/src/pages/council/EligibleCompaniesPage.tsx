import React, { useState, useEffect } from "react";
import { councilsApi } from "../../api/councils";
import { EligibleBusiness } from "@springboard/shared-types";
import {
  SubsidyStatusBadge,
  CompanySizeBadge,
} from "../../components/council/Badge";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { OfferSubsidyModal } from "../../features/council/subsidies/OfferSubsidyModal";
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
  Star,
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
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
            Eligible Local Businesses
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            Audit micro and small businesses operating below the Real Living
            Wage within your regeneration catchments.
          </p>
        </div>

        <div className="bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Total Businesses Evaluated:</span>{" "}
          <strong className="text-emerald-400 font-bold">
            {businesses.length}
          </strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3 font-mono text-xs">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by organisation name, sector, or postcode..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Sector */}
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Sectors</option>
              <option value="Community & Services">Community & Services</option>
              <option value="Retail & Trade">Retail & Trade</option>
              <option value="Green Economy & Craft">
                Green Economy & Craft
              </option>
              <option value="Creative & Media">Creative & Media</option>
              <option value="Technology & Digital">Technology & Digital</option>
            </select>

            {/* Size */}
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Sizes</option>
              <option value="micro">Micro (&lt;10)</option>
              <option value="small">Small (10-49)</option>
              <option value="medium">Medium (50-249)</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="eligible">Eligible</option>
              <option value="pledged">Pledged</option>
              <option value="active_subsidised">Active Subsidised</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Business Table */}
      {loading ? (
        <div className="py-20 flex justify-center bg-slate-950 min-h-[50vh]">
          <LoadingSpinner size="md" text="Loading business database..." />
        </div>
      ) : businesses.length === 0 ? (
        <div className="bg-slate-900/90 rounded-3xl p-12 text-center border border-slate-800 text-slate-400 font-mono">
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
            <table className="w-full text-left border-collapse font-mono min-w-[1100px]">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4 whitespace-nowrap">
                    Organisation Name & Sector
                  </th>
                  <th className="px-4 py-4 whitespace-nowrap">Size</th>
                  <th className="px-4 py-4 whitespace-nowrap">Status</th>
                  <th className="px-4 py-4 whitespace-nowrap">Base Wage</th>
                  <th className="px-4 py-4 whitespace-nowrap">Hourly Gap</th>
                  <th className="px-4 py-4 whitespace-nowrap">
                    AI Funding Rating
                  </th>
                  <th className="px-4 py-4 whitespace-nowrap">
                    Deprivation Catchment
                  </th>
                  <th className="px-4 py-4 whitespace-nowrap">Live Roles</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                {businesses.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Name & Sector */}
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-4 py-4 whitespace-nowrap">
                      <CompanySizeBadge size={b.company_size} />
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {b.employee_count || 12} staff
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <SubsidyStatusBadge status={b.wage_subsidy_status} />
                    </td>

                    {/* Base Wage */}
                    <td className="px-4 py-4 whitespace-nowrap font-bold text-white">
                      £{b.current_wage_offered.toFixed(2)} / hr
                    </td>

                    {/* Hourly Gap */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 text-xs">
                        +£{b.hourly_wage_gap.toFixed(2)} / hr
                      </span>
                    </td>

                    {/* AI Funding Rating (Council-Only) */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-emerald-300 font-mono text-xs">
                          {(b.ai_funding_score ?? 85).toFixed(0)}/100
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[130px] font-mono">
                        ★ {b.employee_review_rating ?? 4.8} (
                        {b.employee_review_count ?? 12} reviews)
                      </span>
                    </td>

                    {/* Catchment Score */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              b.low_income_catchment_score >= 80
                                ? "bg-rose-500"
                                : b.low_income_catchment_score >= 60
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                            style={{
                              width: `${b.low_income_catchment_score}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-200">
                          {b.low_income_catchment_score.toFixed(0)}/100
                        </span>
                      </div>
                    </td>

                    {/* Live Roles */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {b.open_opportunities_count > 0 ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          {b.open_opportunities_count} Open
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">0</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {b.wage_subsidy_status === "active_subsidised" ? (
                        <span className="text-emerald-400 font-bold text-xs inline-flex items-center gap-1">
                          Subsidised
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedBusiness(b)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-300 shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>Pledge Grant</span>
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

      {/* Offer Subsidy Modal */}
      {selectedBusiness && (
        <OfferSubsidyModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onSuccess={() => {
            loadBusinesses();
          }}
        />
      )}
    </div>
  );
};
