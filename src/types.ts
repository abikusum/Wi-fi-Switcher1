export interface WifiNetwork {
  id: string;
  ssid: string;
  bssid: string;
  signalStrengthDbm: number;
  frequencyGhz: number;
  channel: number;
  security: 'WPA3' | 'WPA2-PSK' | 'Open' | 'WPA2-Enterprise';
  connected?: boolean;
}

export interface WifiState {
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'connecting' | 'scanning';
  ssid: string;
  bssid: string;
  signalStrengthDbm: number;
  signalPercent: number;
  frequencyGhz: number;
  channel: number;
  ipAddress: string;
  macAddress: string;
  gateway: string;
  speedMbps: number;
  security: string;
  availableNetworks: WifiNetwork[];
}

export interface BluetoothDevice {
  id: string;
  name: string;
  type: 'headphones' | 'watch' | 'keyboard' | 'speaker' | 'phone' | 'tag';
  address: string;
  rssiDbm: number;
  connected: boolean;
  batteryPercent?: number;
  paired: boolean;
}

export interface BluetoothState {
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'pairing' | 'scanning';
  connectedDeviceName?: string;
  pairedDevices: BluetoothDevice[];
  availableDevices: BluetoothDevice[];
  discoverable: boolean;
}

export interface CellTower {
  id: string;
  name: string;
  operator: string;
  type: '5G-NR' | '4G-LTE' | '3G-UMTS';
  mcc: number; // Mobile Country Code
  mnc: number; // Mobile Network Code
  lac: number; // Location Area Code / TAC
  cellId: number; // eNodeB / CID
  rsrpDbm: number; // Reference Signal Received Power
  rsrqDb: number; // Reference Signal Received Quality
  timingAdvance: number; // in steps (approx 78m per step)
  lat: number;
  lng: number;
  distanceMeters: number;
  azimuthDeg: number;
  serving: boolean;
}

export interface TriangulationState {
  status: 'triangulating' | 'locked' | 'idle' | 'searching';
  estimatedLat: number;
  estimatedLng: number;
  accuracyRadiusMeters: number;
  altitudeMeters: number;
  speedKmh: number;
  headingDeg: number | null;
  timestamp: number;
  algorithm: 'Weighted Hyperbolic Multilateration' | 'Cell-ID Timing Advance' | 'Device-Assisted Hybrid';
  towers: CellTower[];
  servingTowerId: string;
  geohash: string;
  datum: string;
  confidenceScore: number;
  usingRealGps: boolean;
}

export interface BackgroundServiceState {
  isActive: boolean;
  intervalSeconds: number;
  batteryEfficiencyMode: 'adaptive' | 'ultra-low' | 'high-precision';
  lastBackgroundSync: number;
  notificationsEnabled: boolean;
  wakeLockAcquired: boolean;
  cyclesCompleted: number;
  batteryLevel: number;
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  type: 'wifi' | 'bluetooth' | 'cellular' | 'service' | 'location';
  message: string;
  details?: string;
}
