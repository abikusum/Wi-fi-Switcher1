import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Bluetooth, BluetoothOff, Battery, Navigation, Signal } from 'lucide-react';

interface AndroidStatusBarProps {
  wifiEnabled: boolean;
  wifiConnected: boolean;
  bluetoothEnabled?: boolean;
  bluetoothConnected?: boolean;
  cellularActive: boolean;
  batteryLevel?: number;
}

export function AndroidStatusBar({
  wifiEnabled,
  wifiConnected,
  bluetoothEnabled = false,
  bluetoothConnected = false,
  batteryLevel = 87,
}: AndroidStatusBarProps) {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="android-status-bar" className="w-full flex items-center justify-between px-5 py-2.5 select-none text-xs font-mono text-[#6B7280] border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md">
      {/* Left: Time and Operator */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[#1F2937] tracking-tight">{timeStr || '12:00'}</span>
        <span className="text-[10px] text-[#9CA3AF] border-l border-[#E5E7EB] pl-2 font-sans uppercase tracking-wider font-bold">Android Cellular</span>
      </div>

      {/* Right: Telephony, Wi-Fi, Bluetooth, GPS, Battery */}
      <div className="flex items-center gap-3">
        {/* GPS location fix active */}
        <div className="flex items-center text-[#3B82F6]" title="Location Provider Active">
          <Navigation className="w-3.5 h-3.5 fill-[#3B82F6]/20 text-[#3B82F6]" />
        </div>

        {/* Wi-Fi Icon */}
        <div title={wifiEnabled ? (wifiConnected ? 'Wi-Fi Connected' : 'Wi-Fi On (Scanning)') : 'Wi-Fi Disabled'}>
          {wifiEnabled ? (
            <Wifi className={`w-3.5 h-3.5 ${wifiConnected ? 'text-[#10B981]' : 'text-[#6B7280] animate-pulse'}`} />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-[#D1D5DB]" />
          )}
        </div>

        {/* Bluetooth Icon */}
        <div title={bluetoothEnabled ? (bluetoothConnected ? 'Bluetooth Connected' : 'Bluetooth Active') : 'Bluetooth Disabled'}>
          {bluetoothEnabled ? (
            <Bluetooth className={`w-3.5 h-3.5 ${bluetoothConnected ? 'text-[#2563EB]' : 'text-[#6B7280]'}`} />
          ) : (
            <BluetoothOff className="w-3.5 h-3.5 text-[#D1D5DB]" />
          )}
        </div>

        {/* Cellular Signal & 5G */}
        <div className="flex items-center gap-1 text-[#374151]" title="5G NR Standalone Cellular">
          <Signal className="w-3.5 h-3.5 text-[#10B981]" />
          <span className="text-[9px] font-bold tracking-tighter text-[#10B981]">5G</span>
        </div>

        {/* Battery */}
        <div className="flex items-center gap-1 text-[#6B7280]">
          <span className="text-[10px] font-medium">{batteryLevel}%</span>
          <Battery className="w-3.5 h-3.5 text-[#374151]" />
        </div>
      </div>
    </div>
  );
}
