/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  WifiState,
  WifiNetwork,
  BluetoothState,
  BluetoothDevice,
  CellTower,
  TriangulationState,
  BackgroundServiceState,
  ActivityLog,
} from './types';
import {
  generateCellTowersAround,
  calculateMultilateration,
  encodeGeohash,
} from './utils/geoUtils';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { WifiSwitchCard } from './components/WifiSwitchCard';
import { BluetoothSwitchCard } from './components/BluetoothSwitchCard';
import { CellularTriangulationHUD } from './components/CellularTriangulationHUD';

const INITIAL_NETWORKS: WifiNetwork[] = [
  {
    id: 'net-1',
    ssid: 'Nexus_5G_Mesh',
    bssid: '84:A9:3E:11:F2:A0',
    signalStrengthDbm: -48,
    frequencyGhz: 5.8,
    channel: 149,
    security: 'WPA3',
    connected: true,
  },
  {
    id: 'net-2',
    ssid: 'Pixel_Fiber_Ultra',
    bssid: '30:B5:C2:88:41:9B',
    signalStrengthDbm: -62,
    frequencyGhz: 5.2,
    channel: 36,
    security: 'WPA2-PSK',
  },
  {
    id: 'net-3',
    ssid: 'Public_Transit_FastGuest',
    bssid: '00:14:22:90:3A:C4',
    signalStrengthDbm: -75,
    frequencyGhz: 2.4,
    channel: 6,
    security: 'Open',
  },
  {
    id: 'net-4',
    ssid: 'Enterprise_Secure_IoT',
    bssid: 'AC:8B:A9:43:0E:17',
    signalStrengthDbm: -81,
    frequencyGhz: 2.4,
    channel: 11,
    security: 'WPA2-Enterprise',
  },
];

const INITIAL_PAIRED_DEVICES: BluetoothDevice[] = [
  {
    id: 'bt-dev-1',
    name: 'Sony WH-1000XM5',
    type: 'headphones',
    address: 'CC:98:8B:42:19:FA',
    rssiDbm: -52,
    connected: true,
    batteryPercent: 84,
    paired: true,
  },
  {
    id: 'bt-dev-2',
    name: 'Pixel Watch 2',
    type: 'watch',
    address: 'F0:72:EA:91:0D:44',
    rssiDbm: -58,
    connected: false,
    batteryPercent: 71,
    paired: true,
  },
  {
    id: 'bt-dev-3',
    name: 'Logitech MX Mechanical',
    type: 'keyboard',
    address: '00:1F:20:EE:54:12',
    rssiDbm: -64,
    connected: false,
    paired: true,
  },
];

const INITIAL_NEARBY_DEVICES: BluetoothDevice[] = [
  {
    id: 'bt-dev-4',
    name: 'Bose SoundLink Flex',
    type: 'speaker',
    address: '28:11:A5:B9:4C:E1',
    rssiDbm: -72,
    connected: false,
    paired: false,
  },
  {
    id: 'bt-dev-5',
    name: 'Smart Tag Tracker #09',
    type: 'tag',
    address: 'E4:5F:01:8A:22:CC',
    rssiDbm: -79,
    connected: false,
    paired: false,
  },
];

export default function App() {
  // 1. Wi-Fi State
  const [wifiState, setWifiState] = useState<WifiState>({
    enabled: true,
    status: 'connected',
    ssid: 'Nexus_5G_Mesh',
    bssid: '84:A9:3E:11:F2:A0',
    signalStrengthDbm: -48,
    signalPercent: 88,
    frequencyGhz: 5.8,
    channel: 149,
    ipAddress: '192.168.1.142',
    macAddress: 'F4:F5:D8:92:4A:1C',
    gateway: '192.168.1.1',
    speedMbps: 866,
    security: 'WPA3-Personal',
    availableNetworks: INITIAL_NETWORKS,
  });

  // 2. Bluetooth State
  const [bluetoothState, setBluetoothState] = useState<BluetoothState>({
    enabled: true,
    status: 'connected',
    connectedDeviceName: 'Sony WH-1000XM5',
    pairedDevices: INITIAL_PAIRED_DEVICES,
    availableDevices: INITIAL_NEARBY_DEVICES,
    discoverable: true,
  });

  // Base coordinates (San Francisco default if browser GPS is blocked/unavailable)
  const [coords, setCoords] = useState<{ lat: number; lng: number; altitude: number }>({
    lat: 37.7749,
    lng: -122.4194,
    altitude: 18,
  });

  const [towers, setTowers] = useState<CellTower[]>(() =>
    generateCellTowersAround(37.7749, -122.4194)
  );

  // 3. Triangulation State
  const [triangulation, setTriangulation] = useState<TriangulationState>({
    status: 'locked',
    estimatedLat: 37.7749,
    estimatedLng: -122.4194,
    accuracyRadiusMeters: 14,
    altitudeMeters: 18,
    speedKmh: 0,
    headingDeg: null,
    timestamp: Date.now(),
    algorithm: 'Weighted Hyperbolic Multilateration',
    towers: [],
    servingTowerId: 'tower-alpha',
    geohash: encodeGeohash(37.7749, -122.4194),
    datum: 'WGS84 (EPSG:4326)',
    confidenceScore: 96,
    usingRealGps: false,
  });

  // 4. Background Service State
  const [serviceState, setServiceState] = useState<BackgroundServiceState>({
    isActive: true,
    intervalSeconds: 5,
    batteryEfficiencyMode: 'adaptive',
    lastBackgroundSync: Date.now(),
    notificationsEnabled: true,
    wakeLockAcquired: false,
    cyclesCompleted: 1,
    batteryLevel: 89,
  });

  // 5. Activity Logs
  const [logs, setLogs] = useState<ActivityLog[]>([
    {
      id: 'log-init',
      timestamp: Date.now(),
      type: 'service',
      message: 'Cellular triangulation engine started in optimized background mode.',
    },
  ]);

  const addLog = useCallback((type: ActivityLog['type'], message: string) => {
    setLogs((prev) => [
      ...prev.slice(-49),
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
        type,
        message,
      },
    ]);
  }, []);

  // Sync Geolocation from Browser if available
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      addLog('cellular', 'Browser GPS unavailable. Using simulated Cellular Triangulation.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, altitude, accuracy } = position.coords;
        setCoords({
          lat: latitude,
          lng: longitude,
          altitude: altitude ? Math.round(altitude) : 18,
        });

        const newTowers = generateCellTowersAround(latitude, longitude);
        setTowers(newTowers);

        const multi = calculateMultilateration(newTowers);
        setTriangulation((prev) => ({
          ...prev,
          status: 'locked',
          estimatedLat: latitude,
          estimatedLng: longitude,
          accuracyRadiusMeters: Math.round(accuracy || multi.accuracy),
          altitudeMeters: altitude ? Math.round(altitude) : 18,
          timestamp: Date.now(),
          towers: newTowers,
          geohash: encodeGeohash(latitude, longitude),
          confidenceScore: multi.confidence,
          usingRealGps: true,
        }));

        addLog(
          'location',
          `GPS Lock acquired: ${latitude.toFixed(5)}°, ${longitude.toFixed(5)}° (±${Math.round(
            accuracy || 12
          )}m)`
        );
      },
      (err) => {
        console.warn('Geolocation access fallback:', err.message);
        const fallbackTowers = generateCellTowersAround(37.7749, -122.4194);
        setTowers(fallbackTowers);
        const multi = calculateMultilateration(fallbackTowers);
        setTriangulation((prev) => ({
          ...prev,
          towers: fallbackTowers,
          estimatedLat: multi.lat,
          estimatedLng: multi.lng,
          accuracyRadiusMeters: multi.accuracy,
          confidenceScore: multi.confidence,
          geohash: encodeGeohash(multi.lat, multi.lng),
          usingRealGps: false,
        }));
        addLog('cellular', 'Running Cellular Triangulation via base station antennas.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [addLog]);

  // Background Service Loop
  useEffect(() => {
    if (!serviceState.isActive) return;

    const intervalMs = serviceState.intervalSeconds * 1000;
    const intervalTimer = setInterval(() => {
      setTowers((prevTowers) => {
        return prevTowers.map((tower) => {
          const deltaDbm = Math.floor(Math.random() * 3) - 1;
          const newRsrp = Math.min(-65, Math.max(-118, tower.rsrpDbm + deltaDbm));
          return {
            ...tower,
            rsrpDbm: newRsrp,
          };
        });
      });

      setServiceState((prev) => ({
        ...prev,
        cyclesCompleted: prev.cyclesCompleted + 1,
        lastBackgroundSync: Date.now(),
      }));

      setWifiState((prev) => {
        if (!prev.enabled || prev.status !== 'connected') return prev;
        const driftSpeed = Math.max(450, Math.min(950, prev.speedMbps + (Math.floor(Math.random() * 21) - 10)));
        return {
          ...prev,
          speedMbps: driftSpeed,
        };
      });
    }, intervalMs);

    return () => clearInterval(intervalTimer);
  }, [serviceState.isActive, serviceState.intervalSeconds]);

  // Handle Wi-Fi Switch Toggle
  const handleToggleWifi = (newEnabled: boolean) => {
    if (newEnabled) {
      setWifiState((prev) => ({
        ...prev,
        enabled: true,
        status: 'connecting',
      }));
      addLog('wifi', 'Wi-Fi radio turned ON. Scanning for 2.4/5GHz access points...');

      setTimeout(() => {
        setWifiState((prev) => ({
          ...prev,
          status: 'connected',
          ssid: 'Nexus_5G_Mesh',
          ipAddress: '192.168.1.142',
          speedMbps: 866,
        }));
        addLog('wifi', 'Connected to "Nexus_5G_Mesh" (192.168.1.142, WPA3).');
      }, 700);
    } else {
      setWifiState((prev) => ({
        ...prev,
        enabled: false,
        status: 'disconnected',
      }));
      addLog('wifi', 'Wi-Fi radio turned OFF. Cellular modem handling data routing.');
    }
  };

  // Handle Bluetooth Switch Toggle
  const handleToggleBluetooth = (newEnabled: boolean) => {
    if (newEnabled) {
      setBluetoothState((prev) => ({
        ...prev,
        enabled: true,
        status: 'scanning',
      }));
      addLog('bluetooth', 'Bluetooth radio turned ON. Adapter initialized in discoverable mode.');

      setTimeout(() => {
        setBluetoothState((prev) => {
          const hasConnected = prev.pairedDevices.some((d) => d.connected);
          return {
            ...prev,
            status: hasConnected ? 'connected' : 'disconnected',
          };
        });
        addLog('bluetooth', 'Bluetooth adapter ready. Reconnected to primary paired peripherals.');
      }, 600);
    } else {
      setBluetoothState((prev) => ({
        ...prev,
        enabled: false,
        status: 'disconnected',
        pairedDevices: prev.pairedDevices.map((d) => ({ ...d, connected: false })),
      }));
      addLog('bluetooth', 'Bluetooth radio turned OFF to save battery.');
    }
  };

  // Handle Bluetooth Connect
  const handleConnectBluetoothDevice = (device: BluetoothDevice) => {
    setBluetoothState((prev) => ({
      ...prev,
      status: 'pairing',
    }));
    addLog('bluetooth', `Pairing and establishing ACL link with "${device.name}"...`);

    setTimeout(() => {
      setBluetoothState((prev) => {
        const updatedPaired = prev.pairedDevices.map((d) => ({
          ...d,
          connected: d.id === device.id,
        }));

        // If it was in available list, move to paired list
        const isAlreadyPaired = prev.pairedDevices.some((d) => d.id === device.id);
        const nextPaired = isAlreadyPaired
          ? updatedPaired
          : [...updatedPaired, { ...device, connected: true, paired: true }];
        const nextAvailable = prev.availableDevices.filter((d) => d.id !== device.id);

        return {
          ...prev,
          status: 'connected',
          connectedDeviceName: device.name,
          pairedDevices: nextPaired,
          availableDevices: nextAvailable,
        };
      });
      addLog('bluetooth', `Connected to "${device.name}" (${device.address}) via Bluetooth LE.`);
    }, 700);
  };

  // Handle Bluetooth Disconnect
  const handleDisconnectBluetoothDevice = (device: BluetoothDevice) => {
    setBluetoothState((prev) => ({
      ...prev,
      status: 'disconnected',
      connectedDeviceName: undefined,
      pairedDevices: prev.pairedDevices.map((d) =>
        d.id === device.id ? { ...d, connected: false } : d
      ),
    }));
    addLog('bluetooth', `Disconnected from "${device.name}".`);
  };

  // Handle Bluetooth Scan
  const handleScanBluetoothDevices = () => {
    setBluetoothState((prev) => ({ ...prev, status: 'scanning' }));
    addLog('bluetooth', 'Scanning for nearby BLE advertisements & legacy Bluetooth devices...');

    setTimeout(() => {
      setBluetoothState((prev) => ({
        ...prev,
        status: prev.pairedDevices.some((d) => d.connected) ? 'connected' : 'disconnected',
      }));
      addLog('bluetooth', 'Bluetooth scan complete. Device list refreshed.');
    }, 900);
  };

  // Handle Network Selection
  const handleSelectNetwork = (network: WifiNetwork) => {
    setWifiState((prev) => ({
      ...prev,
      status: 'connecting',
      ssid: network.ssid,
    }));
    addLog('wifi', `Connecting to "${network.ssid}"...`);

    setTimeout(() => {
      const randomIp = `192.168.${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 200) + 10}`;
      setWifiState((prev) => ({
        ...prev,
        status: 'connected',
        ssid: network.ssid,
        bssid: network.bssid,
        signalStrengthDbm: network.signalStrengthDbm,
        signalPercent: Math.min(100, Math.max(10, Math.round(((network.signalStrengthDbm + 100) / 70) * 100))),
        frequencyGhz: network.frequencyGhz,
        channel: network.channel,
        security: network.security,
        ipAddress: randomIp,
        speedMbps: network.frequencyGhz > 5 ? 866 : 144,
      }));
      addLog('wifi', `Connected to "${network.ssid}" (${randomIp}).`);
    }, 600);
  };

  // Handle Scan Networks
  const handleScanNetworks = () => {
    setWifiState((prev) => ({ ...prev, status: 'scanning' }));
    addLog('wifi', 'Broadcasting 802.11 probe requests...');

    setTimeout(() => {
      setWifiState((prev) => ({
        ...prev,
        status: prev.enabled ? 'connected' : 'disconnected',
        availableNetworks: [
          ...INITIAL_NETWORKS.map((n) => ({
            ...n,
            signalStrengthDbm: n.signalStrengthDbm + (Math.floor(Math.random() * 7) - 3),
          })),
        ],
      }));
      addLog('wifi', `Scan complete. Found ${INITIAL_NETWORKS.length} nearby wireless networks.`);
    }, 900);
  };

  // Handle Triangulation Refresh
  const handleRefreshTriangulation = () => {
    setTriangulation((prev) => ({ ...prev, status: 'triangulating' }));
    addLog('cellular', 'Recalculating hyperbolic multilateration centroid across all towers...');

    setTimeout(() => {
      const updatedTowers = generateCellTowersAround(coords.lat, coords.lng);
      setTowers(updatedTowers);
      const multi = calculateMultilateration(updatedTowers);

      setTriangulation((prev) => ({
        ...prev,
        status: 'locked',
        estimatedLat: coords.lat,
        estimatedLng: coords.lng,
        accuracyRadiusMeters: multi.accuracy,
        confidenceScore: multi.confidence,
        timestamp: Date.now(),
        towers: updatedTowers,
        geohash: encodeGeohash(coords.lat, coords.lng),
      }));
      addLog('cellular', `Triangulation lock confirmed: ±${multi.accuracy}m accuracy.`);
    }, 650);
  };

  // Efficiency mode change
  const handleChangeEfficiencyMode = (mode: 'adaptive' | 'ultra-low' | 'high-precision') => {
    const intervals = {
      'ultra-low': 15,
      adaptive: 5,
      'high-precision': 2,
    };
    setServiceState((prev) => ({
      ...prev,
      batteryEfficiencyMode: mode,
      intervalSeconds: intervals[mode],
    }));
    addLog('service', `Background efficiency mode switched to "${mode}" (${intervals[mode]}s interval).`);
  };

  const isBluetoothConnected = bluetoothState.enabled && bluetoothState.pairedDevices.some((d) => d.connected);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1F2937] flex flex-col items-center justify-start p-2 sm:p-3 font-sans">
      {/* Centered Minimalist Android Device Frame */}
      <main className="w-full max-w-md flex flex-col rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
        {/* Android Phone Status Bar */}
        <AndroidStatusBar
          wifiEnabled={wifiState.enabled}
          wifiConnected={wifiState.status === 'connected'}
          bluetoothEnabled={bluetoothState.enabled}
          bluetoothConnected={isBluetoothConnected}
          cellularActive={true}
          batteryLevel={serviceState.batteryLevel}
        />

        {/* Main Content Area */}
        <div className="p-3 space-y-2.5 bg-[#F8F9FA]">
          {/* 1. Wireless Wi-Fi Switcher Card */}
          <WifiSwitchCard
            wifiState={wifiState}
            onToggleWifi={handleToggleWifi}
            onSelectNetwork={handleSelectNetwork}
            onScanNetworks={handleScanNetworks}
          />

          {/* 2. Bluetooth Switcher Card (Directly below Primary Wireless Interface) */}
          <BluetoothSwitchCard
            bluetoothState={bluetoothState}
            onToggleBluetooth={handleToggleBluetooth}
            onConnectDevice={handleConnectBluetoothDevice}
            onDisconnectDevice={handleDisconnectBluetoothDevice}
            onScanDevices={handleScanBluetoothDevices}
          />

          {/* 3. Cellular Triangulation HUD & Live Coordinates */}
          <CellularTriangulationHUD
            triangulation={{ ...triangulation, towers }}
            onRefreshTriangulation={handleRefreshTriangulation}
          />
        </div>
      </main>
    </div>
  );
}
