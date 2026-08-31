import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { councilsApi } from '../api/councils';
import {
  CouncilMapData,
  WageSubsidyScheme,
  WageSubsidyAllocation,
  CouncilMapMarker,
} from '@springboard/shared-types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AllocationStatusBadge } from '../components/common/Badge';
import { WageSubsidyMap } from '../features/map/WageSubsidyMap';
import { CouncilAgentChat } from '../features/agent/CouncilAgentChat';
import { OfferSubsidyModal } from '../features/subsidies/OfferSubsidyModal';
import {
  Coins,
  Building2,
  Users,
  MapPin,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Sparkles,
  PlusCircle,
  Clock,
  Layers,
  Bot,
} from 'lucide-react';

export const CouncilDashboardPage: React.FC = () => {
  const { council, refreshCouncil } = useAuth();
  const [mapData, setMapData] = useState<CouncilMapData | null>(null);
  const [schemes, setSchemes] = useState<WageSubsidyScheme[]>([]);
  const [allocations, setAllocations] = useState<WageSubsidyAllocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected business & modal state
  const [selectedBusiness, setSelectedBusiness] = useState<CouncilMapMarker | null>(null);
  const [modalBusiness, setModalBusiness] = useState<CouncilMapMarker | null>(null);
  const [chatPrefill, setChatPrefill] = useState<string | undefined>(undefined);

  const loadData = async () => {
    try {
      const [mData, sData, aData] = await Promise.all([
        councilsApi.getMapData(),
        councilsApi.listSchemes(),
        councilsApi.listAllocations(),
      ]);
      setMapData(mData);
      setSchemes(sData);
      setAllocations(aData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalAllocated = council?.total_budget_allocated || 100000;
  const totalSpent = council?.total_budget_spent || 0;
  const remainingBudget = Math.max(0, totalAllocated - totalSpent);
  const percentUsed = Math.min(100, Math.round((totalSpent / totalAllocated) * 100));

  const handleAskAiAssess = (business: CouncilMapMarker) => {
    setChatPrefill(`Assess ${business.name} wage subsidy proposal and living wage gap`);
  };

  const handleSelectBusinessFromChat = (businessId: string) => {
    if (!mapData) return;
    const match = mapData.markers.find((m) => m.id === businessId || m.business_id === businessId);
    if (match) {
      setSelectedBusiness(match);
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" text="Loading council economic command center..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Welcome & Council Context Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
          <Coins className="w-80 h-80 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Youth Social Mobility & Real Living Wage Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {council?.name || 'Local Authority Council'}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Spatial Wage Subsidy Command Center: Identify micro and small businesses unable to afford minimum wage, and bridge the gap with hourly grants.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/schemes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-extrabold text-xs border border-slate-700 shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>New Subsidy Scheme</span>
            </Link>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Social ROI (£3.80x)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Allocated Budget */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Wage Fund Allocated</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">£{totalAllocated.toLocaleString()}</p>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
              <span>Spent: £{totalSpent.toLocaleString()}</span>
              <span className="font-bold text-emerald-700">{percentUsed}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percentUsed}%` }} />
            </div>
          </div>
        </div>

        {/* Available Budget */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Available Budget</span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-extrabold text-sky-950">£{remainingBudget.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Ready for SME wage top-ups</p>
          </div>
        </div>

        {/* Small Companies in Catchment */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Eligible SMEs</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">
              {mapData?.summary.eligible_for_subsidy || 4}
              <span className="text-xs font-medium text-slate-400"> / {mapData?.summary.total_businesses_in_area || 5}</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Avg wage gap: £{mapData?.summary.average_wage_gap || 4.44}/hr
            </p>
          </div>
        </div>

        {/* Low-Income Youth Reach */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Priority Youth Catchment</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-extrabold text-purple-950">
              {(mapData?.summary.estimated_youth_reach || 5500).toLocaleString()}
            </p>
            <p className="text-[10px] text-purple-700 font-semibold mt-0.5">Across 4 target IMD wards</p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          COMMAND CENTER: Split-Screen Map + Live AI Policy Director Agent
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (7 Cols): High-Fidelity Geospatial Map */}
        <div className="lg:col-span-7 flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-extrabold text-slate-900">Interactive Wage Subsidy Map</h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                {mapData?.markers.length || 0} Businesses Mapped
              </span>
            </div>
            <Link
              to="/map"
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Expand Map</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 min-h-[580px] w-full">
            {mapData && (
              <WageSubsidyMap
                markers={mapData.markers}
                deprivationAreas={mapData.deprivation_areas}
                councilName={council?.name}
                selectedBusinessId={selectedBusiness?.id}
                onSelectBusiness={(b) => setSelectedBusiness(b)}
                onOfferSubsidy={(b) => setModalBusiness(b)}
                onAskAiAssess={handleAskAiAssess}
              />
            )}
          </div>
        </div>

        {/* Right (5 Cols): Live Council AI Director Agent */}
        <div className="lg:col-span-5 flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-extrabold text-slate-900">Council AI Policy & Grant Director</h2>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              Agent Active
            </span>
          </div>

          <div className="flex-1 min-h-[580px] h-[580px]">
            <CouncilAgentChat
              onSelectBusiness={handleSelectBusinessFromChat}
              prefillMessage={chatPrefill}
            />
          </div>
        </div>
      </div>

      {/* Two Column Section: Active Schemes & Recent Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Active Subsidy Schemes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>Active Subsidy Schemes</span>
              </h3>
              <p className="text-xs text-slate-500">Designated funding pools for local youth</p>
            </div>
            <Link to="/schemes" className="text-xs font-bold text-emerald-700 hover:underline">
              Manage ({schemes.length})
            </Link>
          </div>

          <div className="space-y-3">
            {schemes.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No subsidy schemes created yet.</p>
            ) : (
              schemes.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{s.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{s.description}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      £{s.subsidy_rate_per_hour.toFixed(2)}/hr top-up
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                    <span>
                      Remaining: <strong>£{s.remaining_budget.toLocaleString()}</strong>
                    </span>
                    <span>Total Fund: £{s.total_budget.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Pledges & Allocations */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sky-600" />
                <span>Recent Wage Pledges</span>
              </h3>
              <p className="text-xs text-slate-500">Live wage top-up grants committed to employers</p>
            </div>
            <Link to="/allocations" className="text-xs font-bold text-sky-700 hover:underline">
              Ledger ({allocations.length})
            </Link>
          </div>

          <div className="space-y-3">
            {allocations.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No subsidy allocations recorded yet.</p>
            ) : (
              allocations.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{a.business_name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {a.max_hours_per_week} hrs/wk • {a.duration_weeks} weeks @ £{a.hourly_subsidy.toFixed(2)}/hr
                      </p>
                    </div>
                    <AllocationStatusBadge status={a.status} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">{a.scheme_title}</span>
                    <span className="font-extrabold text-emerald-700">
                      £{a.allocated_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Offer Wage Subsidy Modal */}
      {modalBusiness && (
        <OfferSubsidyModal
          business={modalBusiness}
          onClose={() => setModalBusiness(null)}
          onSuccess={() => {
            loadData();
            refreshCouncil();
          }}
        />
      )}
    </div>
  );
};
