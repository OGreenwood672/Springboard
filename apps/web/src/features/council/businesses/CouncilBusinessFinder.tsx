import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Star,
  Award,
  Sparkles,
  Building2,
  MapPin,
  Coins,
  ChevronRight,
  TrendingUp,
  Quote,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { CouncilMapMarker } from "@springboard/shared-types";
import { SubsidyStatusBadge } from "../../../components/council/Badge";

interface CouncilBusinessFinderProps {
  businesses: CouncilMapMarker[];
  onSelectBusiness?: (businessId: string) => void;
  onOfferSubsidy?: (business: CouncilMapMarker) => void;
  selectedBusinessId?: string | null;
}

export const CouncilBusinessFinder: React.FC<CouncilBusinessFinderProps> = ({
  businesses,
  onSelectBusiness,
  onOfferSubsidy,
  selectedBusinessId,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<
    "score" | "gap" | "catchment" | "employees"
  >("score");
  const [expandedResearchId, setExpandedResearchId] = useState<string | null>(
    null,
  );
  const cardRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-scroll and auto-expand details when a business is selected (e.g. clicked on map)
  useEffect(() => {
    if (!selectedBusinessId) return;
    setExpandedResearchId(selectedBusinessId);

    // If selected business is hidden by current filters, reset them so it becomes visible
    const isVisible = businesses.some(
      (b) =>
        (b.id === selectedBusinessId || b.business_id === selectedBusinessId) &&
        (selectedSector === "all" || b.organisation_type === selectedSector) &&
        (!searchTerm.trim() ||
          b.name.toLowerCase().includes(searchTerm.toLowerCase())),
    );

    if (!isVisible) {
      setSearchTerm("");
      setSelectedSector("all");
      setMinScore(0);
    }

    const timer = setTimeout(() => {
      const el =
        cardRefs.current[selectedBusinessId] ||
        cardRefs.current[
          businesses.find(
            (b) =>
              b.id === selectedBusinessId ||
              b.business_id === selectedBusinessId,
          )?.id || ""
        ];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [selectedBusinessId, businesses]);

  // Extract unique sectors
  const sectors = useMemo(() => {
    const set = new Set<string>();
    businesses.forEach((b) => {
      if (b.organisation_type) set.add(b.organisation_type);
    });
    return Array.from(set).sort();
  }, [businesses]);

  // Filter and Sort Businesses
  const rankedBusinesses = useMemo(() => {
    return businesses
      .filter((b) => {
        // Search Term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = b.name.toLowerCase().includes(q);
          const matchSector = b.organisation_type?.toLowerCase().includes(q);
          const matchAddr =
            b.address?.toLowerCase().includes(q) ||
            b.postcode?.toLowerCase().includes(q);
          const matchResearch = b.ai_research_summary
            ?.toLowerCase()
            .includes(q);
          if (!matchName && !matchSector && !matchAddr && !matchResearch)
            return false;
        }

        // Sector
        if (
          selectedSector !== "all" &&
          b.organisation_type !== selectedSector
        ) {
          return false;
        }

        // Min AI Score
        const score = b.ai_funding_score ?? 80;
        if (minScore > 0 && score < minScore) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "score") {
          return (b.ai_funding_score ?? 80) - (a.ai_funding_score ?? 80);
        }
        if (sortBy === "gap") {
          return b.hourly_wage_gap - a.hourly_wage_gap;
        }
        if (sortBy === "catchment") {
          return b.low_income_catchment_score - a.low_income_catchment_score;
        }
        if (sortBy === "employees") {
          return b.employee_count - a.employee_count;
        }
        return 0;
      });
  }, [businesses, searchTerm, selectedSector, minScore, sortBy]);

  return (
    <div className="bg-slate-900/95 rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[640px] overflow-hidden">
      {/* Header Banner */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Council Grant Matcher
            </span>
            <span className="text-xs font-mono text-slate-400">
              {rankedBusinesses.length} eligible employers
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
            <Award className="w-3 h-3 text-amber-400" />
            <span>AI Score Ranking Active</span>
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search businesses by name, sector, Chesham/Amersham ward, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
          {/* Sort selector */}
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400">Rank:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-bold cursor-pointer"
            >
              <option value="score" className="bg-slate-900">
                AI Funding Score
              </option>
              <option value="gap" className="bg-slate-900">
                Wage Gap (+£/hr)
              </option>
              <option value="catchment" className="bg-slate-900">
                Catchment Priority
              </option>
              <option value="employees" className="bg-slate-900">
                SME Size
              </option>
            </select>
          </div>

          {/* Sector selector */}
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400">Sector:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-transparent text-white focus:outline-none font-bold cursor-pointer max-w-[120px] truncate"
            >
              <option value="all" className="bg-slate-900">
                All Sectors
              </option>
              {sectors.map((sec) => (
                <option key={sec} value={sec} className="bg-slate-900">
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Min Score filter */}
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400">Score:</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="bg-transparent text-white focus:outline-none font-bold cursor-pointer"
            >
              <option value={0} className="bg-slate-900">
                Any
              </option>
              <option value={90} className="bg-slate-900">
                90+ (Tier 1)
              </option>
              <option value={85} className="bg-slate-900">
                85+ (High)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Ranked Business Cards Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {rankedBusinesses.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-slate-500 font-mono text-xs">
            <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No businesses found matching current criteria.</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedSector("all");
                setMinScore(0);
              }}
              className="text-emerald-400 hover:underline pt-2"
            >
              Reset filters
            </button>
          </div>
        ) : (
          rankedBusinesses.map((b, idx) => {
            const isSelected =
              selectedBusinessId === b.id ||
              selectedBusinessId === b.business_id;
            const aiScore = b.ai_funding_score ?? 85;
            const tier =
              b.ai_funding_tier ||
              (aiScore >= 92
                ? "Tier 1 — High Impact SROI"
                : "Tier 2 — Recommended");
            const isExpanded = expandedResearchId === b.id;

            return (
              <div
                key={b.id}
                ref={(el) => {
                  cardRefs.current[b.id] = el;
                  cardRefs.current[b.business_id] = el;
                }}
                className={`p-4 rounded-2xl transition-all border ${
                  isSelected
                    ? "bg-slate-950 border-emerald-500/90 ring-2 ring-emerald-500/30 shadow-2xl"
                    : "bg-slate-950/80 border-slate-800/90 hover:border-slate-700"
                } space-y-2.5`}
              >
                {isSelected && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                    <MapPin className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span>Selected on Map</span>
                  </div>
                )}

                {/* Header Row: Rank Badge, Name, and AI Score */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-white leading-tight hover:text-emerald-400 transition-colors">
                        {b.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                        <span className="text-slate-300">
                          {b.organisation_type}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {b.postcode || "Chesham"}
                        </span>
                        <span>•</span>
                        <span>{b.employee_count || 6} staff</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Funding Score Pill (Council Eyes Only) */}
                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-black text-xs shadow-sm">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{aiScore.toFixed(0)}/100</span>
                    </div>
                    <span className="block text-[9px] font-mono text-emerald-400/80 mt-0.5">
                      {tier.split("—")[0].trim()}
                    </span>
                  </div>
                </div>

                {/* Wage Gap & Subsidy Need Summary */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      Current Base
                    </span>
                    <span className="font-bold text-slate-300">
                      £{b.current_wage_offered.toFixed(2)}/hr
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      Wage Gap
                    </span>
                    <span className="font-black text-amber-300">
                      +£{b.hourly_wage_gap.toFixed(2)}/hr
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">
                      Target Living
                    </span>
                    <span className="font-bold text-emerald-400">
                      £{b.target_wage.toFixed(2)}/hr
                    </span>
                  </div>
                </div>

                {/* AI Research & Employee Reviews (Council-Only) */}
                <div className="space-y-1.5 text-xs">
                  {b.employee_reviews_summary && (
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 flex items-start gap-2">
                      <Quote className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed italic">
                        {b.employee_reviews_summary}
                      </p>
                    </div>
                  )}

                  {b.ai_research_summary && (
                    <div>
                      <p
                        className={`text-[11px] text-slate-400 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}
                      >
                        <strong className="text-emerald-300 font-mono not-italic mr-1">
                          AI SROI Viability:
                        </strong>
                        {b.ai_research_summary}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedResearchId(isExpanded ? null : b.id)
                        }
                        className="text-[10px] text-emerald-400 hover:underline font-mono mt-0.5 cursor-pointer"
                      >
                        {isExpanded ? "Show less" : "Read full AI analysis"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions: Locate on Map & Pledge Subsidy */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <SubsidyStatusBadge status={b.wage_subsidy_status} />
                    {b.open_opportunities_count > 0 && (
                      <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {b.open_opportunities_count} roles
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {onSelectBusiness && (
                      <button
                        type="button"
                        onClick={() => onSelectBusiness(b.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1"
                      >
                        <MapPin className="w-3 h-3 text-teal-400" />
                        <span>Map</span>
                      </button>
                    )}

                    {onOfferSubsidy && (
                      <button
                        type="button"
                        onClick={() => onOfferSubsidy(b)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-300 shadow-md shadow-emerald-950/30 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Pledge Subsidy</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
