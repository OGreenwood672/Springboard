import React, { useEffect, useState } from "react";
import { councilsApi } from "../../api/councils";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { CouncilMapData, CouncilMapMarker } from "@springboard/shared-types";
import { WageSubsidyMap } from "../../features/council/map/WageSubsidyMap";
import { OfferSubsidyModal } from "../../features/council/subsidies/OfferSubsidyModal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { MapPin, Coins, Sparkles, Building2, Zap } from "lucide-react";

export const WageSubsidyMapPage: React.FC = () => {
  const { council, refreshCouncil } = useAuth();
  const { showToast } = useToast();

  const [mapData, setMapData] = useState<CouncilMapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBusinessForModal, setSelectedBusinessForModal] =
    useState<CouncilMapMarker | null>(null);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const data = await councilsApi.getMapData();
      setMapData(data);
    } catch (err: any) {
      showToast(err.message || "Failed to load wage subsidy map", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center bg-slate-950 min-h-[70vh]">
        <LoadingSpinner size="lg" text="Loading spatial wage subsidy map..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Council Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Spatial Wage Ledger
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Geospatial Wage Subsidy Map
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Interactive UK administrative ward boundaries, IMD deprivation
            rankings, and real-time SME wage gap mapping.
          </p>
        </div>

        {/* Quick Stats Pill */}
        {mapData && (
          <div className="flex items-center gap-3 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 text-xs font-mono">
            <div className="px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">
                SMEs Mapped
              </span>
              <span className="font-bold text-white">
                {mapData.markers.length}
              </span>
            </div>
            <div className="px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">
                Subsidy Eligible
              </span>
              <span className="font-bold text-amber-400">
                {mapData.summary.eligible_for_subsidy}
              </span>
            </div>
            <div className="px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 block">Mean Gap</span>
              <span className="font-bold text-emerald-400">
                +£{mapData.summary.average_wage_gap.toFixed(2)}/hr
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Full-width Map View */}
      <div className="h-[750px] w-full">
        {mapData && (
          <WageSubsidyMap
            markers={mapData.markers}
            deprivationAreas={mapData.deprivation_areas}
            councilName={council?.name || "Council"}
            defaultLat={51.705}
            defaultLng={-0.7}
            defaultZoom={11}
            onOfferSubsidy={(biz) => setSelectedBusinessForModal(biz)}
          />
        )}
      </div>

      {/* Offer Subsidy Modal */}
      {selectedBusinessForModal && (
        <OfferSubsidyModal
          business={selectedBusinessForModal}
          onClose={() => setSelectedBusinessForModal(null)}
          onSuccess={() => {
            loadMapData();
            refreshCouncil();
          }}
        />
      )}
    </div>
  );
};
