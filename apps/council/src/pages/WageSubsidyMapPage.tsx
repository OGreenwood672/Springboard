import React, { useState, useEffect } from 'react';
import { councilsApi } from '../api/councils';
import { CouncilMapData, CouncilMapMarker } from '@springboard/shared-types';
import { WageSubsidyMap } from '../features/map/WageSubsidyMap';
import { OfferSubsidyModal } from '../features/subsidies/OfferSubsidyModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { MapPin, Info, Sparkles, Building2, Flame, Coins, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WageSubsidyMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [mapData, setMapData] = useState<CouncilMapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBusiness, setSelectedBusiness] = useState<CouncilMapMarker | null>(null);
  const [modalBusiness, setModalBusiness] = useState<CouncilMapMarker | null>(null);

  const loadData = async () => {
    try {
      const data = await councilsApi.getMapData();
      setMapData(data);
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAskAiAssess = (business: CouncilMapMarker) => {
    // Navigate to dashboard with chat prompt trigger
    navigate(`/?assess=${encodeURIComponent(business.name)}`);
  };

  if (loading || !mapData) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" text="Loading geospatial wage subsidy map..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              Council Spatial Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Wage Subsidy & Deprivation Catchment Map
          </h1>
          <p className="text-xs text-slate-400">
            Pinpoint micro & small enterprises unable to meet minimum wage and match them to low-income family ward catchments.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow-xl font-mono">
          <div className="text-right px-2 border-r border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-400">Average Wage Gap</p>
            <p className="text-xs font-black text-amber-400">£{mapData.summary.average_wage_gap}/hr</p>
          </div>
          <div className="text-right px-2">
            <p className="text-[10px] uppercase font-bold text-slate-400">Target Youth Reach</p>
            <p className="text-xs font-black text-emerald-400">
              {mapData.summary.estimated_youth_reach.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Map Component */}
      <div className="h-[calc(100vh-14rem)] min-h-[600px] w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        <WageSubsidyMap
          markers={mapData.markers}
          deprivationAreas={mapData.deprivation_areas}
          councilName={mapData.council?.name}
          selectedBusinessId={selectedBusiness?.id}
          onSelectBusiness={(b) => setSelectedBusiness(b)}
          onOfferSubsidy={(b) => setModalBusiness(b)}
          onAskAiAssess={handleAskAiAssess}
        />
      </div>

      {/* Offer Modal */}
      {modalBusiness && (
        <OfferSubsidyModal
          business={modalBusiness}
          onClose={() => setModalBusiness(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};
