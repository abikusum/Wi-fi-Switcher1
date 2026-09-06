import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CellTower } from '../types';
import { Radio, Crosshair, Layers, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface InteractiveMapViewProps {
  userLat: number;
  userLng: number;
  accuracyRadiusMeters: number;
  towers: CellTower[];
  triangulationStatus: 'triangulating' | 'locked' | 'idle' | 'searching';
  onTowerSelect?: (tower: CellTower) => void;
}

export function InteractiveMapView({
  userLat,
  userLng,
  accuracyRadiusMeters,
  towers,
  triangulationStatus,
  onTowerSelect,
}: InteractiveMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const towerMarkersGroupRef = useRef<L.LayerGroup | null>(null);
  const towerCirclesGroupRef = useRef<L.LayerGroup | null>(null);
  const triangulationLinesGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapTheme, setMapTheme] = useState<'light' | 'dark' | 'satellite'>('light');
  const [showSignalRadii, setShowSignalRadii] = useState<boolean>(true);
  const [showRays, setShowRays] = useState<boolean>(true);
  const [isFollowing, setIsFollowing] = useState<boolean>(true);

  // Initialize Leaflet Map with Clean Minimalism Light Cartography
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const tileUrls = {
      light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    };

    const map = L.map(mapContainerRef.current, {
      center: [userLat, userLng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(tileUrls[mapTheme], {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    const towerMarkersGroup = L.layerGroup().addTo(map);
    const towerCirclesGroup = L.layerGroup().addTo(map);
    const triangulationLinesGroup = L.layerGroup().addTo(map);

    towerMarkersGroupRef.current = towerMarkersGroup;
    towerCirclesGroupRef.current = towerCirclesGroup;
    triangulationLinesGroupRef.current = triangulationLinesGroup;

    // Clean Minimalist User Marker with Precision Blue Centroid & Pulsing Wave
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute inset-0 bg-[#3B82F6] opacity-15 rounded-full animate-ping"></div>
          <div class="absolute inset-1 bg-[#3B82F6] opacity-25 rounded-full animate-pulse"></div>
          <div class="relative w-4 h-4 rounded-full bg-[#3B82F6] border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.7)]"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const userMarker = L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
    userMarkerRef.current = userMarker;

    const accuracyCircle = L.circle([userLat, userLng], {
      radius: Math.max(accuracyRadiusMeters, 15),
      color: '#3B82F6',
      weight: 1.5,
      opacity: 0.7,
      fillColor: '#3B82F6',
      fillOpacity: 0.08,
      dashArray: '3, 3',
    }).addTo(map);
    accuracyCircleRef.current = accuracyCircle;

    mapInstanceRef.current = map;

    map.on('dragstart', () => setIsFollowing(false));

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapTheme]);

  // Update Coordinates
  useEffect(() => {
    if (!mapInstanceRef.current || !userMarkerRef.current || !accuracyCircleRef.current) return;

    userMarkerRef.current.setLatLng([userLat, userLng]);
    accuracyCircleRef.current.setLatLng([userLat, userLng]);
    accuracyCircleRef.current.setRadius(Math.max(accuracyRadiusMeters, 15));

    if (isFollowing) {
      mapInstanceRef.current.panTo([userLat, userLng], { animate: true, duration: 0.6 });
    }
  }, [userLat, userLng, accuracyRadiusMeters, isFollowing]);

  // Update Towers & Rays
  useEffect(() => {
    if (!mapInstanceRef.current || !towerMarkersGroupRef.current || !towerCirclesGroupRef.current || !triangulationLinesGroupRef.current) {
      return;
    }

    const markersGroup = towerMarkersGroupRef.current;
    const circlesGroup = towerCirclesGroupRef.current;
    const linesGroup = triangulationLinesGroupRef.current;

    markersGroup.clearLayers();
    circlesGroup.clearLayers();
    linesGroup.clearLayers();

    towers.forEach((tower) => {
      const isServing = tower.serving;
      const towerIcon = L.divIcon({
        className: 'custom-tower-marker',
        html: `
          <div class="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-105">
            <div class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
              isServing
                ? 'bg-[#10B981] text-white shadow-sm'
                : 'bg-white/95 text-[#374151] border border-[#E5E7EB] shadow-sm'
            } whitespace-nowrap mb-1 backdrop-blur-sm">
              ${tower.type} ${tower.rsrpDbm}dBm
            </div>
            <div class="relative flex items-center justify-center w-6 h-6 rounded-full ${
              isServing ? 'bg-[#10B981]/20 border-2 border-[#10B981]' : 'bg-white border-2 border-[#6B7280]'
            } shadow-sm">
              <div class="w-2 h-2 rounded-full ${isServing ? 'bg-[#10B981]' : 'bg-[#6B7280]'}"></div>
            </div>
          </div>
        `,
        iconSize: [80, 48],
        iconAnchor: [40, 40],
      });

      const marker = L.marker([tower.lat, tower.lng], { icon: towerIcon }).addTo(markersGroup);
      marker.on('click', () => {
        if (onTowerSelect) onTowerSelect(tower);
      });

      if (showSignalRadii) {
        L.circle([tower.lat, tower.lng], {
          radius: tower.distanceMeters,
          color: isServing ? '#10B981' : '#9CA3AF',
          weight: isServing ? 1.5 : 1,
          opacity: isServing ? 0.6 : 0.35,
          fillColor: isServing ? '#10B981' : '#9CA3AF',
          fillOpacity: isServing ? 0.05 : 0.02,
          dashArray: isServing ? undefined : '5, 5',
        }).addTo(circlesGroup);
      }

      if (showRays) {
        L.polyline(
          [
            [tower.lat, tower.lng],
            [userLat, userLng],
          ],
          {
            color: isServing ? '#10B981' : '#9CA3AF',
            weight: isServing ? 1.5 : 1,
            opacity: isServing ? 0.7 : 0.4,
            dashArray: '4, 4',
          }
        ).addTo(linesGroup);
      }
    });
  }, [towers, userLat, userLng, showSignalRadii, showRays, onTowerSelect]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    setIsFollowing(true);
    mapInstanceRef.current.flyTo([userLat, userLng], 15, { duration: 0.6 });
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div
      id="map-interface"
      className="relative w-full h-[340px] sm:h-[400px] rounded-3xl overflow-hidden border border-[#D1D5DB] bg-[#F3F4F6] shadow-sm"
    >
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Active Tracking Header Badge */}
      <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-xl shadow-sm border border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#3B82F6] shadow-[0_0_8px_#3B82F6] animate-pulse"></div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#3B82F6] leading-tight">Active Tracking</p>
            <p className="text-xs font-medium text-[#1F2937] leading-tight">
              {triangulationStatus === 'locked' ? 'Multilateration Lock' : 'Triangulating...'}
            </p>
          </div>
        </div>
      </div>

      {/* Map Control Buttons */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        {/* Recenter Button */}
        <button
          id="btn-recenter-map"
          onClick={handleRecenter}
          title="Center on Coordinates"
          className={`p-2.5 rounded-xl border backdrop-blur-sm transition-all shadow-sm active:scale-95 ${
            isFollowing
              ? 'bg-[#EFF6FF] text-[#3B82F6] border-[#BFDBFE]'
              : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#F9FAFB]'
          }`}
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Toggle Radii */}
        <button
          id="btn-toggle-radii"
          onClick={() => setShowSignalRadii((prev) => !prev)}
          title="Toggle Cell Radii"
          className={`p-2.5 rounded-xl border backdrop-blur-sm transition-all shadow-sm active:scale-95 ${
            showSignalRadii
              ? 'bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]'
              : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F9FAFB]'
          }`}
        >
          <Radio className="w-4 h-4" />
        </button>

        {/* Theme Switcher */}
        <button
          id="btn-map-theme"
          onClick={() =>
            setMapTheme((t) => (t === 'light' ? 'dark' : t === 'dark' ? 'satellite' : 'light'))
          }
          title={`Switch Style (Current: ${mapTheme})`}
          className="p-2.5 rounded-xl bg-white text-[#4B5563] border border-[#E5E7EB] backdrop-blur-sm hover:bg-[#F9FAFB] transition-all shadow-sm active:scale-95"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm backdrop-blur-sm">
          <button
            id="btn-zoom-in"
            onClick={handleZoomIn}
            className="p-2 text-[#4B5563] hover:bg-[#F9FAFB] border-b border-[#E5E7EB] transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="btn-zoom-out"
            onClick={handleZoomOut}
            className="p-2 text-[#4B5563] hover:bg-[#F9FAFB] transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 right-4 z-[400] flex items-center justify-between px-4 py-2 rounded-xl bg-white/95 border border-[#E5E7EB] backdrop-blur-sm text-[11px] text-[#6B7280] shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 font-medium text-[#1F2937]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shadow-[0_0_6px_rgba(59,130,246,0.6)]"></span>
            <span>Device Centroid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
            <span>Serving Base Station</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9CA3AF]"></span>
            <span>Neighbor Towers</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[#6B7280] font-mono text-[10px]">
          <Compass className="w-3 h-3 text-[#3B82F6]" />
          <span>WGS84 EPSG:4326</span>
        </div>
      </div>
    </div>
  );
}
