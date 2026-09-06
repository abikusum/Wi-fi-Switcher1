import { TriangulationState } from '../types';
import { haversineDistanceMeters } from '../utils/geoUtils';
import { Navigation2, RefreshCw } from 'lucide-react';

interface CellularTriangulationHUDProps {
  triangulation: TriangulationState;
  onRefreshTriangulation?: () => void;
}

// 1 St Francis Pl, San Francisco, CA 94107 coordinates
const TARGET_DESTINATION = {
  name: '1 St Francis Pl, San Francisco, CA 94107',
  shortName: '1 St Francis Pl, SF, CA 94107',
  lat: 37.78418,
  lng: -122.39709,
};

export function CellularTriangulationHUD({
  triangulation,
  onRefreshTriangulation,
}: CellularTriangulationHUDProps) {
  // Calculate distance in meters, miles, and km
  const distanceMeters = haversineDistanceMeters(
    triangulation.estimatedLat,
    triangulation.estimatedLng,
    TARGET_DESTINATION.lat,
    TARGET_DESTINATION.lng
  );

  const distanceMiles = distanceMeters * 0.000621371;
  const distanceKm = distanceMeters / 1000;

  return (
    <div
      id="cellular-triangulation-hud"
      className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm space-y-2"
    >
      {/* Eyebrow & Action Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Navigation2 className="w-3.5 h-3.5 text-[#2563EB]" />
          <h2 className="text-xs font-semibold text-[#1F2937] tracking-tight">
            Distance from Target
          </h2>
        </div>

        {onRefreshTriangulation && (
          <button
            id="btn-refresh-triangulation"
            onClick={onRefreshTriangulation}
            title="Recalculate Cellular Triangulation"
            className="flex items-center gap-1 text-[10.5px] font-medium text-[#374151] hover:text-[#1F2937] bg-[#F9FAFB] hover:bg-[#F3F4F6] px-2 py-0.5 rounded-md border border-[#E5E7EB] shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${triangulation.status === 'triangulating' ? 'animate-spin text-[#2563EB]' : 'text-[#6B7280]'}`} />
            <span>Recalculate</span>
          </button>
        )}
      </div>

      {/* Target Address & Distance Metric Card */}
      <div className="p-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-bold text-[#2563EB] tracking-wider block mb-0.5">
              Reference Target
            </span>
            <p className="text-[11px] font-medium text-[#1F2937] font-sans truncate">
              {TARGET_DESTINATION.name}
            </p>
          </div>

          <div className="flex items-baseline gap-1 shrink-0 text-right">
            <span className="text-sm font-mono font-bold text-[#1E40AF]">
              {distanceMiles < 0.1
                ? `${Math.round(distanceMeters)} m`
                : `${distanceMiles.toFixed(2)} mi`}
            </span>
            <span className="text-[9.5px] font-mono text-[#4B5563]">
              ({distanceKm >= 1 ? `${distanceKm.toFixed(1)} km` : `${Math.round(distanceMeters)} m`})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
