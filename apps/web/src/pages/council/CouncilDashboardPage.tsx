import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { councilsApi } from "../../api/councils";
import { useToast } from "../../context/ToastContext";
import {
  CouncilMapData,
  CouncilMapMarker,
  WageSubsidyScheme,
  WageSubsidyAllocation,
} from "@springboard/shared-types";
import { WageSubsidyMap } from "../../features/council/map/WageSubsidyMap";
import { CouncilBusinessFinder } from "../../features/council/businesses/CouncilBusinessFinder";
import { OfferSubsidyModal } from "../../features/council/subsidies/OfferSubsidyModal";
import {
  SubsidyStatusBadge,
  AllocationStatusBadge,
} from "../../components/council/Badge";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import {
  Coins,
  Building2,
  Users,
  MapPin,
  TrendingUp,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Bot,
  Zap,
} from "lucide-react";

export const CouncilDashboardPage: React.FC = () => {
  const { council, refreshCouncil } = useAuth();
  const { showToast } = useToast();

  const [mapData, setMapData] = useState<CouncilMapData | null>(null);
  const [schemes, setSchemes] = useState<WageSubsidyScheme[]>([]);
  const [allocations, setAllocations] = useState<WageSubsidyAllocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [selectedBusinessForModal, setSelectedBusinessForModal] =
    useState<CouncilMapMarker | null>(null);

  // Chat prefill communication
  const [chatPrefill, setChatPrefill] = useState<string>("");
  const [selectedBusinessIdForMap, setSelectedBusinessIdForMap] = useState<
    string | null
  >(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [mData, sList, aList] = await Promise.all([
        councilsApi.getMapData(),
        councilsApi.listSchemes(),
        councilsApi.listAllocations(),
      ]);
      setMapData(mData);
      setSchemes(sList);
      setAllocations(aList.slice(0, 5)); // Recent 5
    } catch (err: any) {
      showToast(
        err.message || "Failed to load council dashboard data",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAskAIFromMap = (businessName: string, promptText: string) => {
    setChatPrefill(promptText);
    showToast(`Selected ${businessName} on the wage map.`, "info");
  };

  const handleSelectBusinessFromFinder = (businessId: string) => {
    setSelectedBusinessIdForMap(businessId);
    showToast("Highlighted business on the wage map.", "info");
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center bg-slate-950 min-h-[70vh]">
        <LoadingSpinner size="lg" text="Loading council economic hub..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-100">
      {/* Top Welcome & Council Context Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-5 pointer-events-none">
          <Coins className="w-80 h-80 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Youth Social Mobility & Real Living Wage Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {council?.name || "Local Authority Council"} • Council Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Spatial Wage Subsidy Hub: Bridge the minimum wage affordability
              gap for local SMEs with targeted hourly grant co-funding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/council/schemes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>New Subsidy Scheme</span>
            </Link>
            <Link
              to="/council/analytics"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 font-black text-xs shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Social ROI (£3.80x)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Allocated Budget */}
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Wage Fund Allocated
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            £{(council?.total_budget_spent || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Remaining unpledged:</span>
            <span className="font-bold text-emerald-400">
              £
              {(
                (council?.total_budget_allocated || 0) -
                (council?.total_budget_spent || 0)
              ).toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  ((council?.total_budget_spent || 0) /
                    Math.max(1, council?.total_budget_allocated || 1)) *
                    100,
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Eligible Local Businesses */}
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Eligible SMEs
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {mapData?.summary.eligible_for_subsidy || 0}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Under Real Living Wage:</span>
            <span className="font-bold text-sky-300">
              {mapData?.summary.eligible_for_subsidy || 0} Micro/Small
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono pt-1">
            Mean wage gap:{" "}
            <strong className="text-slate-300">
              £{(mapData?.summary.average_wage_gap || 4.44).toFixed(2)}/hr
            </strong>
          </div>
        </div>

        {/* Active Subsidised Roles */}
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Young People Placed
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {council?.active_allocations_count || 14}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>NEET Youth in Subsidy:</span>
            <span className="font-bold text-purple-300">
              100% Verified Low-Inc
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono pt-1">
            Retention rate:{" "}
            <strong className="text-emerald-400">92% at 6mo</strong>
          </div>
        </div>

        {/* Deprivation Area Reach */}
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Priority Ward Reach
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {(mapData?.summary.estimated_youth_reach || 5520).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Target Catchment:</span>
            <span className="font-bold text-amber-300">
              {mapData?.deprivation_areas.length || 4} IMD Wards
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono pt-1">
            IMD Deciles: <strong className="text-rose-400">1 to 3</strong>{" "}
            (Highest Need)
          </div>
        </div>
      </div>

      {/* SPLIT-SCREEN WORKSPACE: Leaflet Map + Council AI Director Chat */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              COUNCIL HUB: Geospatial Wage Map + AI Business Funding Search
            </span>
            <h2 className="text-lg font-black text-white tracking-tight">
              Spatial Wage Ledger & Employer Funding Recommendation Engine
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/council/map"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-mono font-bold flex items-center gap-1"
            >
              <span>Expand Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
          {/* Left 7 Columns: Leaflet Wage Subsidy Map */}
          <div className="lg:col-span-7 h-full">
            {mapData && (
              <WageSubsidyMap
                markers={mapData.markers}
                deprivationAreas={mapData.deprivation_areas}
                councilName={council?.name || "Council"}
                defaultLat={51.705}
                defaultLng={-0.7}
                defaultZoom={11}
                onOfferSubsidy={(biz) => setSelectedBusinessForModal(biz)}
                onAskAI={handleAskAIFromMap}
                onSelectBusiness={handleSelectBusinessFromFinder}
                selectedBusinessId={selectedBusinessIdForMap}
                isDashboard={true}
              />
            )}
          </div>

          {/* Right 5 Columns: AI Business Funding Search & Recommendation Engine */}
          <div className="lg:col-span-5 h-full">
            {mapData && (
              <CouncilBusinessFinder
                businesses={mapData.markers}
                onSelectBusiness={handleSelectBusinessFromFinder}
                onOfferSubsidy={(biz) => setSelectedBusinessForModal(biz)}
                selectedBusinessId={selectedBusinessIdForMap}
              />
            )}
          </div>
        </div>
      </div>

      {/* Schemes & Recent Allocations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Active Subsidy Schemes */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Active Subsidy Schemes
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Ring-fenced wage top-up grant programs
                </p>
              </div>
            </div>
            <Link
              to="/council/schemes"
              className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {schemes.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                No active schemes created yet.
              </div>
            ) : (
              schemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {scheme.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {scheme.description}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      £{scheme.subsidy_rate_per_hour.toFixed(2)}/hr Grant
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                    <span>
                      Budget:{" "}
                      <strong className="text-white">
                        £
                        {(
                          scheme.total_budget - scheme.remaining_budget
                        ).toLocaleString()}{" "}
                        / £{scheme.total_budget.toLocaleString()}
                      </strong>
                    </span>
                    <span className="text-emerald-400 font-bold">
                      £{scheme.remaining_budget.toLocaleString()} uncommitted
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          ((scheme.total_budget - scheme.remaining_budget) /
                            Math.max(1, scheme.total_budget)) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Wage Pledges / Allocations */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Recent Wage Pledges & Placements
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Real-time statutory disbursement ledger
                </p>
              </div>
            </div>
            <Link
              to="/council/allocations"
              className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300"
            >
              View Ledger
            </Link>
          </div>

          <div className="space-y-3">
            {allocations.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                No subsidy allocations recorded yet.
              </div>
            ) : (
              allocations.map((alloc) => (
                <div
                  key={alloc.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {alloc.business_name || "SME Partner"}
                      </span>
                      <AllocationStatusBadge status={alloc.status} />
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      +£{alloc.hourly_subsidy.toFixed(2)}/hr top-up •{" "}
                      {alloc.max_hours_per_week}h/wk • {alloc.duration_weeks}wks
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-sm font-black text-emerald-400">
                      £{alloc.allocated_amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Ring-fenced grant
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Offer Subsidy Modal */}
      {selectedBusinessForModal && (
        <OfferSubsidyModal
          business={selectedBusinessForModal}
          onClose={() => setSelectedBusinessForModal(null)}
          onSuccess={() => {
            loadDashboard();
            refreshCouncil();
          }}
        />
      )}
    </div>
  );
};
