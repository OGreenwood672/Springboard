import React, { useState, useEffect } from 'react';
import { councilsApi } from '../api/councils';
import { CouncilMapData, CouncilMapMarker } from '@springboard/shared-types';
import { WageSubsidyMap } from '../features/map/WageSubsidyMap';
import { OfferSubsidyModal } from '../features/subsidies/OfferSubsidyModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { MapPin, Info, Sparkles, Building2, Flame, Coins, ShieldCheck } from 'lucide-react';
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
      <div className="py-24">
        <LoadingSpinner size="lg" text="Loading geospatial wage subsidy map..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
              Council Spatial Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Wage Subsidy & Deprivation Catchment Map
          </h1>
          <p className="text-xs text-slate-500">
            Pinpoint micro & small enterprises unable to meet minimum wage and match them to low-income family ward catchments.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-right px-2 border-r border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-400">Average Wage Gap</p>
            <p className="text-xs font-extrabold text-slate-900">£{mapData.summary.average_wage_gap}/hr</p>
          </div>
          <div className="text-right px-2">
            <p className="text-[10px] uppercase font-bold text-slate-400">Target Youth</p>
            <p className="text-xs font-extrabold text-emerald-700">
              {mapData.summary.estimated_youth_reach.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Map Component */}
      <div className="h-[calc(100vh-14rem)] min-h-[600px] w-full">
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
