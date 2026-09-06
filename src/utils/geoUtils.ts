import { CellTower } from '../types';

/**
 * Converts decimal coordinates into Degrees Minutes Seconds (DMS)
 */
export function decimalToDms(deg: number, isLat: boolean): string {
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
  const direction = isLat ? (deg >= 0 ? 'N' : 'S') : deg >= 0 ? 'E' : 'W';
  return `${degrees}°${minutes}'${seconds}" ${direction}`;
}

/**
 * Calculates haversine distance between two coordinates in meters
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculates bearing / azimuth in degrees from point 1 to point 2
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}

/**
 * Encodes latitude & longitude into a standard Geohash string
 */
export function encodeGeohash(latitude: number, longitude: number, precision: number = 8): string {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let latInterval = [-90.0, 90.0];
  let lonInterval = [-180.0, 180.0];
  let isEven = true;
  let bit = 0;
  let ch = 0;
  let geohash = '';

  while (geohash.length < precision) {
    if (isEven) {
      const mid = (lonInterval[0] + lonInterval[1]) / 2;
      if (longitude > mid) {
        ch |= 1 << (4 - bit);
        lonInterval[0] = mid;
      } else {
        lonInterval[1] = mid;
      }
    } else {
      const mid = (latInterval[0] + latInterval[1]) / 2;
      if (latitude > mid) {
        ch |= 1 << (4 - bit);
        latInterval[0] = mid;
      } else {
        latInterval[1] = mid;
      }
    }

    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return geohash;
}

/**
 * Computes cellular multilateration / weighted signal centroid estimate
 */
export function calculateMultilateration(towers: CellTower[]): {
  lat: number;
  lng: number;
  accuracy: number;
  confidence: number;
} {
  if (!towers || towers.length === 0) {
    return { lat: 37.7749, lng: -122.4194, accuracy: 50, confidence: 50 };
  }

  // Weight inversely proportional to estimated distance squared / signal loss
  let totalWeight = 0;
  let weightedLat = 0;
  let weightedLng = 0;

  for (const tower of towers) {
    // Convert RSRP (e.g. -70 to -115 dBm) into linear power weight
    // RSRP: -70 is strong, -115 is edge
    const normalizedPower = Math.max(0.01, (tower.rsrpDbm + 130) / 60);
    const distanceWeight = 1 / Math.max(10, tower.distanceMeters);
    const weight = normalizedPower * normalizedPower + distanceWeight * 10;

    totalWeight += weight;
    weightedLat += tower.lat * weight;
    weightedLng += tower.lng * weight;
  }

  const estimatedLat = weightedLat / totalWeight;
  const estimatedLng = weightedLng / totalWeight;

  // Approximate error boundary in meters based on geometry and tower count
  const baseError = towers.length >= 3 ? 12 : towers.length === 2 ? 35 : 85;
  const varianceFactor = towers.reduce((acc, t) => {
    const d = haversineDistanceMeters(estimatedLat, estimatedLng, t.lat, t.lng);
    return acc + Math.abs(d - t.distanceMeters);
  }, 0) / towers.length;

  const accuracy = Math.round(Math.min(120, Math.max(8, baseError + varianceFactor * 0.15)));
  const confidence = Math.min(99, Math.max(60, 100 - accuracy * 0.5 + (towers.length >= 3 ? 10 : 0)));

  return {
    lat: estimatedLat,
    lng: estimatedLng,
    accuracy,
    confidence: Math.round(confidence),
  };
}

/**
 * Generate synthetic cell base stations orbiting a center coordinate
 */
export function generateCellTowersAround(centerLat: number, centerLng: number): CellTower[] {
  const operators = ['Verizon 5G UW', 'T-Mobile Ultra Capacity', 'AT&T 5G+', 'Crown Castle Shared'];
  
  // 4 realistic cell base stations in cardinal/intercardinal quadrants
  const towerConfigs = [
    {
      id: 'tower-alpha',
      name: 'Cell Tower Alpha (eNodeB #48921)',
      operator: operators[0],
      type: '5G-NR' as const,
      mcc: 310,
      mnc: 410,
      lac: 28410,
      cellId: 4892101,
      distOffsetM: 420,
      bearingDeg: 35,
      rsrp: -78,
      rsrq: -8.5,
      ta: 5,
      serving: true,
    },
    {
      id: 'tower-bravo',
      name: 'Base Station Bravo (eNodeB #48922)',
      operator: operators[1],
      type: '4G-LTE' as const,
      mcc: 310,
      mnc: 260,
      lac: 28410,
      cellId: 4892202,
      distOffsetM: 780,
      bearingDeg: 140,
      rsrp: -89,
      rsrq: -11.2,
      ta: 10,
      serving: false,
    },
    {
      id: 'tower-charlie',
      name: 'Macro Tower Charlie (eNodeB #48923)',
      operator: operators[2],
      type: '5G-NR' as const,
      mcc: 310,
      mnc: 410,
      lac: 28410,
      cellId: 4892303,
      distOffsetM: 1150,
      bearingDeg: 245,
      rsrp: -96,
      rsrq: -13.8,
      ta: 15,
      serving: false,
    },
    {
      id: 'tower-delta',
      name: 'Rooftop Repeater Delta (SmallCell #194)',
      operator: operators[3],
      type: '4G-LTE' as const,
      mcc: 310,
      mnc: 120,
      lac: 28411,
      cellId: 4892404,
      distOffsetM: 1420,
      bearingDeg: 310,
      rsrp: -103,
      rsrq: -15.1,
      ta: 18,
      serving: false,
    },
  ];

  return towerConfigs.map((cfg) => {
    // Approximate latitude/longitude offset in degrees:
    // 1 deg lat ≈ 111,000 meters
    // 1 deg lon ≈ 111,000 * cos(lat)
    const latOffset = (cfg.distOffsetM * Math.cos((cfg.bearingDeg * Math.PI) / 180)) / 111000;
    const lonOffset =
      (cfg.distOffsetM * Math.sin((cfg.bearingDeg * Math.PI) / 180)) /
      (111000 * Math.cos((centerLat * Math.PI) / 180));

    const tLat = centerLat + latOffset;
    const tLng = centerLng + lonOffset;

    return {
      id: cfg.id,
      name: cfg.name,
      operator: cfg.operator,
      type: cfg.type,
      mcc: cfg.mcc,
      mnc: cfg.mnc,
      lac: cfg.lac,
      cellId: cfg.cellId,
      rsrpDbm: cfg.rsrp,
      rsrqDb: cfg.rsrq,
      timingAdvance: cfg.ta,
      lat: Number(tLat.toFixed(6)),
      lng: Number(tLng.toFixed(6)),
      distanceMeters: cfg.distOffsetM,
      azimuthDeg: cfg.bearingDeg,
      serving: cfg.serving,
    };
  });
}
