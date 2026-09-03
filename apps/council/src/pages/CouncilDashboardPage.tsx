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
  Zap,
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
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" text="Loading council economic command center..." />
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
              {council?.name || 'Local Authority Council'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Spatial Wage Subsidy Command Center: Bridge the minimum wage affordability gap for local SMEs with targeted hourly grant co-funding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/schemes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>New Subsidy Scheme</span>
            </Link>
            <Link
              to="/analytics"
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
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Wage Fund Allocated</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-white font-mono">£{totalAllocated.toLocaleString()}</p>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>Spent: £{totalSpent.toLocaleString()}</span>
              <span className="font-bold text-emerald-400">{percentUsed}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentUsed}%` }} />
            </div>
          </div>
        </div>

        {/* Available Budget */}
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Available Budget</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-sky-400 font-mono">£{remainingBudget.toLocaleString()}</p>
            <p className="text-[10px] font-mono text-slate-400 mt-1">Ready for SME wage top-ups</p>
          </div>
        </div>

        {/* Small Companies in Catchment */}
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Eligible SMEs</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-white font-mono">
              {mapData?.summary.eligible_for_subsidy || 4}
              <span className="text-xs font-normal text-slate-500"> / {mapData?.summary.total_businesses_in_area || 5}</span>
            </p>
            <p className="text-[10px] font-mono text-slate-400 mt-1">
              Avg wage gap: £{mapData?.summary.average_wage_gap || 4.44}/hr
            </p>
          </div>
        </div>

        {/* Low-Income Youth Reach */}
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Priority Youth Catchment</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-purple-300 font-mono">
              {(mapData?.summary.estimated_youth_reach || 5500).toLocaleString()}
            </p>
            <p className="text-[10px] font-mono text-purple-400/90 font-bold mt-1">Across 4 target IMD wards</p>
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
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-black text-white">Interactive Wage Subsidy Map</h2>
              <span className="text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md font-bold">
                {mapData?.markers.length || 0} Businesses Mapped
              </span>
            </div>
            <Link
              to="/map"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Expand Full Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 min-h-[580px] w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
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
              <Bot className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-black text-white">Council AI Policy & Grant Director</h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              Agent Active
            </span>
          </div>

          <div className="flex-1 min-h-[580px] h-[580px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-2xl">
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
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>Active Subsidy Schemes</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Designated funding pools for local youth</p>
            </div>
            <Link to="/schemes" className="text-xs font-bold text-emerald-400 hover:text-emerald-300">
              Manage ({schemes.length})
            </Link>
          </div>

          <div className="space-y-3">
            {schemes.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 font-mono">No subsidy schemes created yet.</p>
            ) : (
              schemes.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white">{s.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{s.description}</p>
                    </div>
                    <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                      £{s.subsidy_rate_per_hour.toFixed(2)}/hr top-up
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-900">
                    <span>
                      Remaining: <strong className="text-emerald-400">£{s.remaining_budget.toLocaleString()}</strong>
                    </span>
                    <span>Total Fund: £{s.total_budget.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Pledges & Allocations */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sky-400" />
                <span>Recent Wage Pledges</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Live wage top-up grants committed to employers</p>
            </div>
            <Link to="/allocations" className="text-xs font-bold text-sky-400 hover:text-sky-300">
              Ledger ({allocations.length})
            </Link>
          </div>

          <div className="space-y-3">
            {allocations.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 font-mono">No subsidy allocations recorded yet.</p>
            ) : (
              allocations.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white">{a.business_name}</h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {a.max_hours_per_week} hrs/wk • {a.duration_weeks} weeks @ £{a.hourly_subsidy.toFixed(2)}/hr
                      </p>
                    </div>
                    <AllocationStatusBadge status={a.status} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-900">
                    <span className="text-slate-400 truncate max-w-[200px]">{a.scheme_title}</span>
                    <span className="font-black text-emerald-400">
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
