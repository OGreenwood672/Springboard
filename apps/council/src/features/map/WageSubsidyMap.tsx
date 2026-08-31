import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import {
  MapPin,
  Layers,
  Search,
  Filter,
  Coins,
  ShieldCheck,
  Building2,
  TrendingUp,
  Sparkles,
  Info,
  Maximize2,
  Sun,
  Moon,
  Compass,
} from "lucide-react";
import type {
  CouncilMapMarker,
  DeprivationAreaBoundary,
} from "@springboard/shared-types";

interface WageSubsidyMapProps {
  markers: CouncilMapMarker[];
  deprivationAreas: DeprivationAreaBoundary[];
  councilName?: string;
  selectedBusinessId?: string | null;
  onSelectBusiness: (business: CouncilMapMarker | null) => void;
  onOfferSubsidy: (business: CouncilMapMarker) => void;
  onAskAiAssess?: (business: CouncilMapMarker) => void;
}

export const WageSubsidyMap: React.FC<WageSubsidyMapProps> = ({
  markers,
  deprivationAreas,
  councilName = "Buckinghamshire Council",
  selectedBusinessId,
  onSelectBusiness,
  onOfferSubsidy,
  onAskAiAssess,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const deprivationLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapTheme, setMapTheme] = useState<"dark" | "light">("dark");
  const [showDeprivation, setShowDeprivation] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMarker, setActiveMarker] = useState<CouncilMapMarker | null>(
    null,
  );

  // Sync activeMarker when selectedBusinessId prop changes
  useEffect(() => {
    if (selectedBusinessId) {
      const match = markers.find(
        (m) =>
          m.id === selectedBusinessId || m.business_id === selectedBusinessId,
      );
      if (match) {
        setActiveMarker(match);
        if (mapInstanceRef.current && match.latitude && match.longitude) {
          mapInstanceRef.current.flyTo([match.latitude, match.longitude], 15, {
            duration: 1.2,
          });
        }
      }
    }
  }, [selectedBusinessId, markers]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Calculate initial center
      const defaultLat =
        markers.length > 0 && markers[0].latitude
          ? markers[0].latitude
          : 51.706;
      const defaultLng =
        markers.length > 0 && markers[0].longitude
          ? markers[0].longitude
          : -0.612;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Layer groups
      const markersLayer = L.layerGroup().addTo(map);
      const deprivationLayer = L.layerGroup().addTo(map);

      markersLayerRef.current = markersLayer;
      deprivationLayerRef.current = deprivationLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch {
        // Safe unmount
      }
    };
  }, []);

  // Update Tile Layer when theme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing tile layers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    const tileUrl =
      mapTheme === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(mapInstanceRef.current);
  }, [mapTheme]);

  // Render Deprivation Circles
  useEffect(() => {
    if (!deprivationLayerRef.current) return;
    try {
      deprivationLayerRef.current.clearLayers();

      if (!showDeprivation) return;

      deprivationAreas.forEach((area) => {
        if (!area.center_lat || !area.center_lng) return;

        const color =
          area.deprivation_decile === 1
            ? "#ef4444" // Red
            : area.deprivation_decile === 2
              ? "#f97316" // Orange
              : "#eab308"; // Amber

        const circle = L.circle([area.center_lat, area.center_lng], {
          radius: area.radius_meters || 1800,
          color: color,
          fillColor: color,
          fillOpacity: 0.15,
          weight: 2,
          dashArray: "4, 8",
        });

        circle.bindTooltip(
          `<strong>${area.ward_name}</strong><br/>
           IMD Decile ${area.deprivation_decile} (Top Priority)<br/>
           ${area.low_income_family_percentage}% low-income households<br/>
           ~${area.youth_population_estimate.toLocaleString()} youth population`,
          { sticky: true, className: "leaflet-custom-tooltip" },
        );

        circle.addTo(deprivationLayerRef.current!);
      });
    } catch {
      // Graceful fallback in environments without full SVG renderer (e.g. tests)
    }
  }, [deprivationAreas, showDeprivation]);

  // Render Business Markers
  useEffect(() => {
    if (!markersLayerRef.current) return;
    try {
      markersLayerRef.current.clearLayers();

      const filtered = markers.filter((m) => {
        const matchesStatus =
          filterStatus === "all" ||
          (filterStatus === "subsidised" &&
            m.wage_subsidy_status === "active_subsidised") ||
          (filterStatus === "eligible" &&
            m.wage_subsidy_status === "eligible") ||
          (filterStatus === "pledged" && m.wage_subsidy_status === "pledged");

        const matchesSearch =
          !searchQuery ||
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.postcode
            ? m.postcode.toLowerCase().includes(searchQuery.toLowerCase())
            : false) ||
          (m.organisation_type
            ? m.organisation_type
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            : false);

        return matchesStatus && matchesSearch;
      });

      filtered.forEach((m) => {
        if (!m.latitude || !m.longitude) return;

        const isSubsidised = m.wage_subsidy_status === "active_subsidised";
        const isPledged = m.wage_subsidy_status === "pledged";
        const isEligible = m.wage_subsidy_status === "eligible";

        const pinBg = isSubsidised
          ? "bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/30"
          : isPledged
            ? "bg-sky-500 text-slate-950 ring-4 ring-sky-500/30"
            : "bg-amber-500 text-slate-950 ring-4 ring-amber-500/30";

        const pulseClass = isSubsidised
          ? "marker-pulse-green"
          : isEligible
            ? "marker-pulse-amber"
            : "";

        const iconHtml = `
          <div class="relative cursor-pointer group">
            <div class="w-8 h-8 rounded-2xl ${pinBg} ${pulseClass} flex items-center justify-center font-extrabold text-xs shadow-lg transition-transform hover:scale-110">
              ${isSubsidised ? "✓" : "£"}
            </div>
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700 whitespace-nowrap shadow-md pointer-events-none">
              +£${m.hourly_wage_gap.toFixed(2)}/h gap
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "custom-leaflet-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([m.latitude, m.longitude], {
          icon: customIcon,
        });

        marker.on("click", () => {
          setActiveMarker(m);
          onSelectBusiness(m);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([m.latitude, m.longitude], 15, {
              duration: 0.8,
            });
          }
        });

        marker.addTo(markersLayerRef.current!);
      });
    } catch {
      // Safe fallback in test environments
    }
  }, [markers, filterStatus, searchQuery, mapTheme]);

  const recenterMap = () => {
    if (mapInstanceRef.current && markers.length > 0) {
      const lat = markers[0].latitude || 51.706;
      const lng = markers[0].longitude || -0.612;
      mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[540px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-950 flex flex-col">
      {/* Map Header Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Search Input */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 shadow-xl pointer-events-auto w-full sm:w-72">
          <Search className="w-4 h-4 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SME, ward, postcode..."
            className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none font-semibold"
          />
        </div>

        {/* Filter & View Mode Badges */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Status Filters */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 shadow-xl text-xs font-bold text-slate-300">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === "all"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "hover:text-white"
              }`}
            >
              All ({markers.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("eligible")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === "eligible"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "hover:text-white"
              }`}
            >
              🟡 Eligible
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("subsidised")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === "subsidised"
                  ? "bg-emerald-500 text-slate-950 shadow-sm"
                  : "hover:text-white"
              }`}
            >
              🟢 Subsidised
            </button>
          </div>

          {/* Deprivation Layer Toggle */}
          <button
            type="button"
            onClick={() => setShowDeprivation(!showDeprivation)}
            className={`p-2.5 rounded-2xl border shadow-xl transition-all cursor-pointer ${
              showDeprivation
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white"
            }`}
            title="Toggle Index of Multiple Deprivation (IMD) Catchment Layer"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => setMapTheme(mapTheme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white shadow-xl transition-all cursor-pointer"
            title="Toggle Map Cartography Mode"
          >
            {mapTheme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Recenter */}
          <button
            type="button"
            onClick={recenterMap}
            className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white shadow-xl transition-all cursor-pointer"
            title="Recenter Map View"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leaflet Canvas Container */}
      <div ref={mapContainerRef} className="w-full flex-1 min-h-[500px]" />

      {/* Selected Business Drawer / Slide-Over */}
      {activeMarker && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[400] bg-slate-900/95 backdrop-blur-xl text-white rounded-3xl p-5 border border-emerald-500/30 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 pb-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activeMarker.wage_subsidy_status === "active_subsidised"
                    ? "Active Subsidised"
                    : "Subsidy Eligible"}
                </span>
                <span className="text-xs text-slate-400">
                  {activeMarker.organisation_type}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white">
                {activeMarker.name}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {activeMarker.address}, {activeMarker.postcode}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveMarker(null);
                onSelectBusiness(null);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Wage Affordability Comparison */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block">
                Base Wage
              </span>
              <span className="text-xs font-bold text-slate-200">
                £{activeMarker.current_wage_offered.toFixed(2)}/h
              </span>
            </div>
            <div className="border-x border-slate-800">
              <span className="text-[10px] text-amber-400 font-bold block">
                Hourly Gap
              </span>
              <span className="text-xs font-extrabold text-amber-300">
                £{activeMarker.hourly_wage_gap.toFixed(2)}/h
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 font-bold block">
                Catchment Index
              </span>
              <span className="text-xs font-extrabold text-emerald-300">
                {activeMarker.low_income_catchment_score.toFixed(0)}/100
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            {onAskAiAssess && (
              <button
                type="button"
                onClick={() => onAskAiAssess(activeMarker)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 text-xs font-extrabold border border-emerald-500/30 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Ask AI to Assess</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOfferSubsidy(activeMarker)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>Offer Subsidy Grant</span>
            </button>
          </div>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-[400] bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 shadow-xl hidden md:flex items-center gap-4 text-[11px] font-semibold text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />{" "}
          Active Subsidised
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30" />{" "}
          Subsidy Eligible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/40 border border-rose-500" />{" "}
          IMD Deprivation Ward
        </span>
      </div>
    </div>
  );
};
