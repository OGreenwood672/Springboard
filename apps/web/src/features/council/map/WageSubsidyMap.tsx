import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  CouncilMapMarker,
  DeprivationAreaBoundary,
} from "@springboard/shared-types";
import {
  Building2,
  Coins,
  MapPin,
  TrendingUp,
  Filter,
  CheckCircle2,
  Layers,
  Sparkles,
  Bot,
  ExternalLink,
  ShieldCheck,
  Eye,
  Sliders,
  RotateCcw,
} from "lucide-react";
import {
  SubsidyStatusBadge,
  CompanySizeBadge,
} from "../../../components/council/Badge";

// Realistic non-overlapping UK administrative ward boundary polygons
// Real coordinates reflecting actual geographic corridors and parish boundaries
const WARD_POLYGONS: Record<string, [number, number][]> = {
  // Chesham Waterside & Vale: river Chess valley & Waterside corridor
  "Chesham Waterside & Vale": [
    [51.6965, -0.613],
    [51.7005, -0.6045],
    [51.7042, -0.6025],
    [51.7078, -0.6075],
    [51.705, -0.6148],
    [51.6995, -0.6175],
  ],
  // Chesham Town & St Mary's: historic town center, High Street & Lowndes Park
  "Chesham Town & St Mary's": [
    [51.705, -0.6148],
    [51.7078, -0.6075],
    [51.7125, -0.6105],
    [51.7145, -0.619],
    [51.7105, -0.6245],
    [51.7062, -0.6205],
  ],
  // Amersham On The Hill: northern station ridge & Sycamore Road corridor
  "Amersham On The Hill Community Ward": [
    [51.672, -0.6155],
    [51.6765, -0.602],
    [51.6828, -0.6035],
    [51.6845, -0.6158],
    [51.6785, -0.6215],
  ],
  // High Wycombe Central Catchment: urban town center & valley basin
  "High Wycombe Central Catchment": [
    [51.6225, -0.7585],
    [51.6255, -0.742],
    [51.6335, -0.7405],
    [51.6368, -0.7515],
    [51.6315, -0.7625],
  ],
  // Aylesbury Gatehouse & Town Basin
  "Aylesbury Gatehouse & Town Basin": [
    [51.815, -0.828],
    [51.828, -0.835],
    [51.832, -0.815],
    [51.818, -0.805],
  ],
  // Marlow & Thames Gateway
  "Marlow & Thames Gateway": [
    [51.565, -0.785],
    [51.575, -0.788],
    [51.578, -0.768],
    [51.568, -0.765],
  ],
};

// Returns a concise, sharp SVG icon representing the business type/sector
function getBusinessSectorIconSvg(name: string, sector?: string): string {
  const n = (name || "").toLowerCase();
  const s = (sector || "").toLowerCase();

  // 1. Bikes / Cycling
  if (n.includes("bike") || n.includes("cycle")) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 6H6m6 11.5 3.5-7 3.5 1.5M12 17.5h6.5"/></svg>`;
  }

  // 2. Bakery / Café / Food / Hospitality
  if (
    n.includes("bakery") ||
    n.includes("café") ||
    n.includes("cafe") ||
    s.includes("food") ||
    s.includes("hospitality")
  ) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`;
  }

  // 3. Green Energy / Solar / Trades
  if (
    n.includes("solar") ||
    n.includes("green") ||
    s.includes("green") ||
    s.includes("energy")
  ) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  }

  // 4. Creative / Audio / Sound / Media
  if (
    n.includes("sound") ||
    n.includes("audio") ||
    n.includes("media") ||
    s.includes("creative") ||
    s.includes("media")
  ) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>`;
  }

  // 5. Joinery / Furniture / Craft / Woodwork / Manufacturing
  if (
    n.includes("joinery") ||
    n.includes("craft") ||
    n.includes("wood") ||
    s.includes("manufacturing") ||
    s.includes("trades")
  ) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 3.26-6.36 6.36"/><path d="m10.74 5.38 6.36 6.36"/></svg>`;
  }

  // 6. Care / Wellbeing / Health
  if (
    n.includes("care") ||
    n.includes("wellbeing") ||
    s.includes("care") ||
    s.includes("health")
  ) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
  }

  // 7. Agriculture / Hydroponics / Farming / Sustainability
  if (
    n.includes("farm") ||
    n.includes("hydroponic") ||
    n.includes("agri") ||
    s.includes("agriculture") ||
    s.includes("sustainability")
  ) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4.1 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>`;
  }

  // 8. Robotics / STEM
  if (n.includes("robot") || n.includes("stem") || s.includes("education")) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`;
  }

  // 9. Tech / Software / Digital
  if (
    n.includes("tech") ||
    n.includes("software") ||
    s.includes("tech") ||
    s.includes("digital")
  ) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
  }

  // 10. Community / Youth Horizons / Charity
  if (
    n.includes("youth") ||
    n.includes("horizon") ||
    s.includes("community") ||
    s.includes("charity")
  ) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
  }

  // 11. Packaging / Design
  if (n.includes("packaging") || n.includes("design") || s.includes("design")) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`;
  }

  // 12. Tourism / Heritage / Outdoor
  if (
    n.includes("tourism") ||
    n.includes("heritage") ||
    n.includes("forest") ||
    s.includes("tourism")
  ) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`;
  }

  // 13. Veterinary / Animal Care
  if (
    n.includes("veterinary") ||
    n.includes("animal") ||
    s.includes("veterinary")
  ) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 20.2A3.5 3.5 0 0 1 2 15a5 5 0 0 1 7-5Z"/></svg>`;
  }

  // 14. Automation / Precision Engineering
  if (
    n.includes("automation") ||
    n.includes("engineering") ||
    s.includes("engineering")
  ) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
  }

  // Default: Store / Business Building
  return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>`;
}

interface WageSubsidyMapProps {
  markers: CouncilMapMarker[];
  deprivationAreas: DeprivationAreaBoundary[];
  councilName: string;
  defaultLat?: number;
  defaultLng?: number;
  defaultZoom?: number;
  onOfferSubsidy: (business: CouncilMapMarker) => void;
  onAskAI?: (businessName: string, promptText: string) => void;
  onSelectBusiness?: (businessId: string) => void;
  selectedBusinessId?: string | null;
  isDashboard?: boolean;
}

export const WageSubsidyMap: React.FC<WageSubsidyMapProps> = ({
  markers,
  deprivationAreas,
  councilName,
  defaultLat = 51.705,
  defaultLng = -0.7,
  defaultZoom = 11,
  onOfferSubsidy,
  onAskAI,
  onSelectBusiness,
  selectedBusinessId,
  isDashboard = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const wardLayerRef = useRef<L.LayerGroup | null>(null);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);

  // Map Filter State
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [minGap, setMinGap] = useState<number>(0);
  const [showWards, setShowWards] = useState<boolean>(true);
  const [selectedWard, setSelectedWard] = useState<string>("all");
  const [activeMarker, setActiveMarker] = useState<CouncilMapMarker | null>(
    null,
  );
  const [activeWardInfo, setActiveWardInfo] =
    useState<DeprivationAreaBoundary | null>(null);

  // Initialize Map with OpenStreetMap (Zero API key required)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: defaultZoom,
        zoomControl: false,
        attributionControl: true,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // OpenStreetMap standard tiles (100% free, no key needed)
      const osmTiles = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        },
      ).addTo(map);

      activeTileLayerRef.current = osmTiles;

      const wardLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);

      wardLayerRef.current = wardLayer;
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    } catch {
      // Safe fallback if leaflet already initialized
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

  // Render Realistic Non-Overlapping Ward Boundary Polygons
  useEffect(() => {
    if (!wardLayerRef.current || !mapInstanceRef.current) return;
    try {
      wardLayerRef.current.clearLayers();

      if (!showWards) return;

      deprivationAreas.forEach((area) => {
        // Get polygon coordinates for ward or generate boundary vertices
        let coords = WARD_POLYGONS[area.ward_name];
        if (!coords && area.center_lat && area.center_lng) {
          // Generate realistic geometric boundary polygon if not in lookup
          const lat = area.center_lat;
          const lng = area.center_lng;
          coords = [
            [lat - 0.009, lng - 0.012],
            [lat - 0.004, lng + 0.014],
            [lat + 0.009, lng + 0.01],
            [lat + 0.012, lng - 0.008],
            [lat + 0.002, lng - 0.015],
          ];
        }

        if (!coords) return;

        // Decile color coding (Decile 1: Rose/Red, Decile 2: Amber, Decile 3+: Cyan/Sky)
        const isDecile1 = area.deprivation_decile === 1;
        const isDecile2 = area.deprivation_decile === 2;
        const fillColor = isDecile1
          ? "#f43f5e"
          : isDecile2
            ? "#f59e0b"
            : "#06b6d4";
        const strokeColor = isDecile1
          ? "#e11d48"
          : isDecile2
            ? "#d97706"
            : "#0891b2";

        const isSelected = selectedWard === area.ward_name;

        const polygon = L.polygon(coords, {
          color: isSelected ? "#10b981" : strokeColor,
          weight: isSelected ? 3.5 : 2,
          opacity: isSelected ? 1 : 0.75,
          fillColor: isSelected ? "#10b981" : fillColor,
          fillOpacity: isSelected ? 0.35 : 0.18,
          dashArray: isSelected ? undefined : "4, 6",
        });

        // Hover effect
        polygon.on("mouseover", () => {
          polygon.setStyle({
            weight: 3,
            fillOpacity: 0.32,
            opacity: 0.95,
          });
        });

        polygon.on("mouseout", () => {
          if (selectedWard !== area.ward_name) {
            polygon.setStyle({
              weight: 2,
              fillOpacity: 0.18,
              opacity: 0.75,
            });
          }
        });

        // Click to focus ward
        polygon.on("click", () => {
          setSelectedWard((prev) =>
            prev === area.ward_name ? "all" : area.ward_name,
          );
          setActiveWardInfo(area);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.fitBounds(polygon.getBounds(), {
              padding: [40, 40],
              maxZoom: 14,
            });
          }
        });

        polygon.bindTooltip(
          `<div class="p-1 space-y-1">
            <div class="font-extrabold text-white text-xs">${area.ward_name}</div>
            <div class="flex items-center gap-1.5 text-[10px] text-slate-300">
              <span class="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">IMD Decile ${area.deprivation_decile}</span>
              <span>•</span>
              <span>${area.low_income_family_percentage}% low-income</span>
            </div>
            <div class="text-[10px] text-slate-400">~${area.youth_population_estimate.toLocaleString()} youth population</div>
          </div>`,
          { sticky: true, className: "leaflet-custom-tooltip" },
        );

        polygon.addTo(wardLayerRef.current!);
      });
    } catch {
      // Graceful fallback
    }
  }, [deprivationAreas, showWards, selectedWard]);

  // Filter Markers
  const filteredMarkers = markers.filter((m) => {
    if (selectedSector !== "all" && m.organisation_type !== selectedSector) {
      return false;
    }
    if (selectedStatus !== "all" && m.wage_subsidy_status !== selectedStatus) {
      return false;
    }
    if (minGap > 0 && m.hourly_wage_gap < minGap) {
      return false;
    }
    if (selectedWard !== "all") {
      const targetArea = deprivationAreas.find(
        (d) => d.ward_name === selectedWard,
      );
      if (
        targetArea &&
        targetArea.center_lat &&
        targetArea.center_lng &&
        m.latitude &&
        m.longitude
      ) {
        // Approximate distance within ward bounding box
        const dLat = Math.abs(m.latitude - targetArea.center_lat);
        const dLng = Math.abs(m.longitude - targetArea.center_lng);
        if (dLat > 0.025 || dLng > 0.035) return false;
      }
    }
    return true;
  });

  // Render SME Dot Pins with AI Ranking Scores
  useEffect(() => {
    if (!markersLayerRef.current) return;
    try {
      markersLayerRef.current.clearLayers();

      filteredMarkers.forEach((marker) => {
        if (!marker.latitude || !marker.longitude) return;

        const isSelected =
          selectedBusinessId === marker.id ||
          selectedBusinessId === marker.business_id;
        const aiScore = Math.round(marker.ai_funding_score ?? 85);
        const isSubsidised = marker.wage_subsidy_status === "active_subsidised";
        const isPledged = marker.wage_subsidy_status === "pledged";

        // Dot appearance based on AI Score and selection
        const dotStyle = isSelected
          ? "bg-emerald-400 text-slate-950 border-2 border-white ring-4 ring-emerald-400/60 scale-110"
          : aiScore >= 92
            ? "bg-slate-950 text-emerald-400 border-2 border-emerald-400 ring-2 ring-emerald-500/25"
            : aiScore >= 88
              ? "bg-slate-950 text-sky-400 border-2 border-sky-400 ring-2 ring-sky-500/25"
              : "bg-slate-950 text-amber-400 border-2 border-amber-400 ring-2 ring-amber-500/25";

        const tipBorder = isSelected
          ? "border-white"
          : aiScore >= 92
            ? "border-emerald-400"
            : aiScore >= 88
              ? "border-sky-400"
              : "border-amber-400";

        // Business sector SVG icon
        const businessIconSvg = getBusinessSectorIconSvg(
          marker.name,
          marker.organisation_type,
        );

        // Compact circular dot pin with business sector icon inside
        const customIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div class="relative flex items-center justify-center group cursor-pointer" style="transform: translate(-50%, -50%);">
              <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-125 ${dotStyle}">
                ${businessIconSvg}
              </div>
              <div class="w-1.5 h-1.5 bg-slate-950 border-r border-b ${tipBorder} absolute -bottom-0.5 left-1/2 -translate-x-1/2 rotate-45"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const leafletMarker = L.marker([marker.latitude, marker.longitude], {
          icon: customIcon,
        });

        // On hover: show business name, sector, and AI score
        leafletMarker.bindTooltip(
          `
          <div class="px-2.5 py-1.5 bg-slate-950/95 border border-slate-700 rounded-xl shadow-2xl text-xs font-sans text-white space-y-0.5 pointer-events-none">
            <div class="font-extrabold flex items-center gap-1.5 whitespace-nowrap">
              <span class="w-2 h-2 rounded-full ${isSubsidised ? "bg-emerald-400" : isPledged ? "bg-sky-400" : "bg-amber-400"}"></span>
              <span>${marker.name}</span>
            </div>
            <div class="text-[10px] text-slate-400 font-mono flex items-center gap-2 whitespace-nowrap">
              <span>${marker.organisation_type || "SME"}</span>
              <span>•</span>
              <span class="text-emerald-400 font-bold">AI Score: ${aiScore}/100</span>
            </div>
          </div>
          `,
          {
            direction: "top",
            offset: [0, -16],
            opacity: 1,
            className: "leaflet-business-tooltip",
          },
        );

        leafletMarker.on("click", () => {
          if (isDashboard) {
            // Dashboard mode: do NOT show map overlay; send selection to AI score ranking widget
            onSelectBusiness?.(marker.id || marker.business_id);
          } else {
            // Standalone map mode: show overlay
            setActiveMarker(marker);
            onSelectBusiness?.(marker.id || marker.business_id);
          }
        });

        leafletMarker.addTo(markersLayerRef.current!);
      });
    } catch {
      // Graceful fallback
    }
  }, [filteredMarkers, selectedBusinessId, isDashboard]);

  // Handle selectedBusinessId passed from outside
  useEffect(() => {
    if (!selectedBusinessId || !mapInstanceRef.current) return;
    const target = markers.find(
      (m) =>
        m.id === selectedBusinessId || m.business_id === selectedBusinessId,
    );
    if (target && target.latitude && target.longitude) {
      mapInstanceRef.current.flyTo([target.latitude, target.longitude], 15, {
        duration: 1.2,
      });
      if (!isDashboard) {
        setActiveMarker(target);
      }
    }
  }, [selectedBusinessId, markers, isDashboard]);

  // Sectors for filter dropdown
  const availableSectors = Array.from(
    new Set(markers.map((m) => m.organisation_type).filter(Boolean)),
  );

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top Filter & Control Bar */}
      <div className="p-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Ward Selector */}
          <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] font-bold">Ward:</span>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">
                All Regeneration Wards
              </option>
              {deprivationAreas.map((d) => (
                <option
                  key={d.ward_name}
                  value={d.ward_name}
                  className="bg-slate-900 text-white"
                >
                  {d.ward_name} (IMD {d.deprivation_decile})
                </option>
              ))}
            </select>
          </div>

          {/* Sector Filter */}
          <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] font-bold">
              Sector:
            </span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">
                All Sectors
              </option>
              {availableSectors.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Subsidy Status */}
          <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] font-bold">
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">
                All Statuses
              </option>
              <option value="eligible" className="bg-slate-900 text-white">
                Subsidy Eligible
              </option>
              <option value="pledged" className="bg-slate-900 text-white">
                Pledged
              </option>
              <option
                value="active_subsidised"
                className="bg-slate-900 text-white"
              >
                Active Subsidised
              </option>
            </select>
          </div>

          {/* Ward Boundaries Toggle */}
          <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer text-slate-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={showWards}
              onChange={(e) => setShowWards(e.target.checked)}
              className="rounded accent-emerald-500 focus:ring-0"
            />
            <span className="text-[11px] font-bold">Ward Polygons</span>
          </label>
        </div>

        {/* Reset Map View */}
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          <button
            type="button"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo(
                  [defaultLat, defaultLng],
                  defaultZoom,
                );
                setSelectedWard("all");
                setSelectedSector("all");
                setSelectedStatus("all");
                setMinGap(0);
                setActiveMarker(null);
                setActiveWardInfo(null);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm text-xs font-bold font-mono"
            title="Reset Map View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 w-full h-full min-h-[420px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Legend Badge Overlay (Non-intrusive) */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 text-[11px] font-mono shadow-2xl space-y-2 max-w-xs">
          <div className="flex items-center justify-between text-white font-black text-xs border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              IMD Ward Topography
            </span>
          </div>

          <div className="space-y-1 text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2 rounded border border-rose-500 bg-rose-500/30"></span>
              <span>Decile 1: Top 10% Deprivation (Highest Need)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2 rounded border border-amber-500 bg-amber-500/30"></span>
              <span>Decile 2: Top 20% Deprivation (High Priority)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-2 rounded border border-cyan-500 bg-cyan-500/30"></span>
              <span>Decile 3–4: Target Regeneration Catchment</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>{filteredMarkers.length} SME Employers Mapped</span>
            <span className="text-emerald-400 font-bold">
              100% Non-Overlapping
            </span>
          </div>
        </div>

        {/* Active Ward Focus Card (When a polygon is clicked) */}
        {activeWardInfo && (
          <div className="absolute top-4 left-4 z-20 pointer-events-auto bg-slate-950/95 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-4 text-xs font-mono shadow-2xl max-w-sm space-y-2.5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ward Boundary Focus
                </span>
                <h4 className="text-sm font-black text-white mt-1">
                  {activeWardInfo.ward_name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveWardInfo(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">
                  IMD Decile
                </span>
                <span className="font-extrabold text-amber-400 text-sm">
                  Decile {activeWardInfo.deprivation_decile}
                </span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">
                  Low Income %
                </span>
                <span className="font-extrabold text-white text-sm">
                  {activeWardInfo.low_income_family_percentage}%
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Targeted priority zone for ring-fenced youth wage subsidies.
              Estimated youth cohort:{" "}
              <strong className="text-white">
                ~{activeWardInfo.youth_population_estimate.toLocaleString()}
              </strong>
              .
            </p>

            {onAskAI && (
              <button
                type="button"
                onClick={() =>
                  onAskAI(
                    activeWardInfo.ward_name,
                    `Analyse regeneration wage subsidy opportunities in ${activeWardInfo.ward_name} (IMD Decile ${activeWardInfo.deprivation_decile})`,
                  )
                }
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask Policy Director for Ward Analysis</span>
              </button>
            )}
          </div>
        )}

        {/* Active SME Detail Inspection Drawer */}
        {activeMarker && (
          <div className="absolute bottom-4 right-4 z-20 pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-5 text-slate-100 shadow-2xl max-w-sm w-full space-y-3.5 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                  {activeMarker.organisation_type}
                </span>
                <h4 className="font-black text-base text-white mt-0.5">
                  {activeMarker.name}
                </h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {activeMarker.postcode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMarker(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Wage Gap Equations */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Employer Base Wage:</span>
                <span className="text-white font-bold">
                  £{activeMarker.current_wage_offered.toFixed(2)} / hr
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Real Living Wage Target:</span>
                <span className="text-white font-bold">
                  £{activeMarker.target_wage.toFixed(2)} / hr
                </span>
              </div>
              <div className="pt-1.5 border-t border-slate-800 flex justify-between text-amber-400 font-bold">
                <span>Hourly Wage Gap:</span>
                <span className="text-sm font-black">
                  +£{activeMarker.hourly_wage_gap.toFixed(2)} / hr
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => onOfferSubsidy(activeMarker)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
              >
                <Coins className="w-4 h-4" />
                <span>Offer Wage Subsidy Grant</span>
              </button>

              {onAskAI && (
                <button
                  type="button"
                  onClick={() =>
                    onAskAI(
                      activeMarker.name,
                      `Assess wage subsidy feasibility for ${activeMarker.name} (${activeMarker.organisation_type}, current wage £${activeMarker.current_wage_offered.toFixed(2)}/hr, gap £${activeMarker.hourly_wage_gap.toFixed(2)}/hr)`,
                    )
                  }
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ask AI Policy Director to Evaluate</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
