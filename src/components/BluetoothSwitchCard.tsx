import { useState } from 'react';
import { BluetoothState, BluetoothDevice } from '../types';
import {
  Bluetooth,
  BluetoothOff,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
  Headphones,
  Watch,
  Keyboard,
  Speaker,
  Smartphone,
  Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BluetoothSwitchCardProps {
  bluetoothState: BluetoothState;
  onToggleBluetooth: (enabled: boolean) => void;
  onConnectDevice: (device: BluetoothDevice) => void;
  onDisconnectDevice: (device: BluetoothDevice) => void;
  onScanDevices: () => void;
}

export function BluetoothSwitchCard({
  bluetoothState,
  onToggleBluetooth,
  onConnectDevice,
  onDisconnectDevice,
  onScanDevices,
}: BluetoothSwitchCardProps) {
  const [showDeviceList, setShowDeviceList] = useState<boolean>(false);

  const getDeviceIcon = (type: BluetoothDevice['type']) => {
    switch (type) {
      case 'headphones':
        return Headphones;
      case 'watch':
        return Watch;
      case 'keyboard':
        return Keyboard;
      case 'speaker':
        return Speaker;
      case 'phone':
        return Smartphone;
      case 'tag':
      default:
        return Tag;
    }
  };

  const connectedDevice = bluetoothState.pairedDevices.find((d) => d.connected);

  return (
    <div
      id="bluetooth-switcher-card"
      className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm relative overflow-hidden transition-all"
    >
      {/* Eyebrow & Status */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[9px] uppercase tracking-wider font-bold text-[#9CA3AF]">
          Short-Range Wireless Interface
        </h2>
        <span
          className={`text-[8.5px] px-1.5 py-0.2 rounded-full font-mono font-bold tracking-wider uppercase transition-colors ${
            bluetoothState.enabled
              ? bluetoothState.status === 'connected'
                ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]'
                : bluetoothState.status === 'scanning'
                ? 'bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]'
                : 'bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]'
              : 'bg-[#F3F4F6] text-[#9CA3AF] border border-[#E5E7EB]'
          }`}
        >
          {bluetoothState.enabled ? bluetoothState.status : 'OFF'}
        </span>
      </div>

      {/* Main Switch Row */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-300 ${
              bluetoothState.enabled
                ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]'
                : 'bg-[#F9FAFB] text-[#9CA3AF] border border-[#E5E7EB]'
            }`}
          >
            {bluetoothState.enabled ? <Bluetooth className="w-4 h-4" /> : <BluetoothOff className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1F2937] leading-tight">Bluetooth 5.3</p>
            <p className="text-[11px] text-[#6B7280] truncate font-normal">
              {bluetoothState.enabled
                ? connectedDevice
                  ? `Connected: ${connectedDevice.name}${connectedDevice.batteryPercent !== undefined ? ` (${connectedDevice.batteryPercent}%)` : ''}`
                  : 'Ready for device pairing'
                : 'Bluetooth radio powered down'}
            </p>
          </div>
        </div>

        {/* Clean Minimalist Toggle Switch */}
        <button
          id="btn-toggle-bluetooth"
          role="switch"
          aria-checked={bluetoothState.enabled}
          onClick={() => onToggleBluetooth(!bluetoothState.enabled)}
          className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            bluetoothState.enabled ? 'bg-[#2563EB]' : 'bg-[#D1D5DB]'
          }`}
        >
          <span className="sr-only">Toggle Bluetooth Radio</span>
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`pointer-events-none inline-block h-4 w-4 mt-1 ml-1 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              bluetoothState.enabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Extended Bluetooth Device Panel */}
      <AnimatePresence>
        {bluetoothState.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {/* Device List Controls */}
            <div className="mt-2 flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
              <button
                id="btn-toggle-bt-device-list"
                onClick={() => setShowDeviceList((prev) => !prev)}
                className="flex items-center gap-1 text-[11px] font-medium text-[#6B7280] hover:text-[#1F2937] py-0.5 px-1.5 rounded hover:bg-[#F3F4F6]"
              >
                <span>Devices ({bluetoothState.pairedDevices.length + bluetoothState.availableDevices.length})</span>
                {showDeviceList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button
                id="btn-scan-bluetooth"
                onClick={onScanDevices}
                className="flex items-center gap-1 text-[10.5px] font-medium text-[#374151] hover:text-[#1F2937] bg-[#F9FAFB] hover:bg-[#F3F4F6] px-2 py-0.5 rounded-md border border-[#E5E7EB] shadow-sm active:scale-95"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${bluetoothState.status === 'scanning' ? 'animate-spin text-[#2563EB]' : 'text-[#6B7280]'}`} />
                <span>{bluetoothState.status === 'scanning' ? 'Scanning' : 'Scan'}</span>
              </button>
            </div>

            {/* Device List Dropdown */}
            <AnimatePresence>
              {showDeviceList && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1.5 space-y-1 border-t border-[#F3F4F6] pt-1.5 max-h-44 overflow-y-auto"
                >
                  <div className="text-[8.5px] uppercase font-bold text-[#9CA3AF] tracking-wider px-1">
                    Paired Devices
                  </div>
                  {bluetoothState.pairedDevices.map((dev) => {
                    const IconComponent = getDeviceIcon(dev.type);
                    return (
                      <div
                        key={dev.id}
                        className={`flex items-center justify-between p-2 rounded-lg transition-all border ${
                          dev.connected
                            ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]'
                            : 'bg-[#F9FAFB] hover:bg-[#F3F4F6] border-[#F3F4F6] text-[#374151]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <IconComponent className={`w-3.5 h-3.5 shrink-0 ${dev.connected ? 'text-[#2563EB]' : 'text-[#9CA3AF]'}`} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] font-semibold text-[#1F2937] leading-tight truncate">{dev.name}</span>
                              {dev.batteryPercent !== undefined && (
                                <span className="text-[8.5px] font-mono px-1 rounded bg-white text-[#4B5563] border border-[#E5E7EB]">
                                  {dev.batteryPercent}%
                                </span>
                              )}
                            </div>
                            <span className="text-[9.5px] text-[#6B7280] font-mono">
                              {dev.address} · {dev.rssiDbm}dBm
                            </span>
                          </div>
                        </div>

                        {dev.connected ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-[#2563EB]">
                              <Check className="w-2.5 h-2.5" />
                              <span>Active</span>
                            </span>
                            <button
                              onClick={() => onDisconnectDevice(dev)}
                              className="text-[8.5px] font-medium text-[#6B7280] hover:text-[#DC2626] bg-white border border-[#E5E7EB] px-1.5 py-0.5 rounded shadow-sm"
                            >
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onConnectDevice(dev)}
                            className="text-[9.5px] font-medium text-[#4B5563] hover:text-[#111827] bg-white border border-[#E5E7EB] px-2 py-0.5 rounded shadow-sm hover:bg-[#F9FAFB] active:scale-95 shrink-0"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Available Nearby Devices */}
                  {bluetoothState.availableDevices.length > 0 && (
                    <>
                      <div className="text-[8.5px] uppercase font-bold text-[#9CA3AF] tracking-wider px-1 pt-1">
                        Available Devices
                      </div>
                      {bluetoothState.availableDevices.map((dev) => {
                        const IconComponent = getDeviceIcon(dev.type);
                        return (
                          <div
                            key={dev.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-[#F9FAFB] hover:bg-[#F3F4F6] border border-[#F3F4F6] text-[#374151]"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <IconComponent className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                              <div className="min-w-0">
                                <span className="text-[11px] font-semibold text-[#1F2937] block leading-tight truncate">{dev.name}</span>
                                <span className="text-[9.5px] text-[#6B7280] font-mono">
                                  {dev.address} · {dev.rssiDbm}dBm
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => onConnectDevice(dev)}
                              className="text-[9.5px] font-medium text-[#4B5563] hover:text-[#111827] bg-white border border-[#E5E7EB] px-2 py-0.5 rounded shadow-sm hover:bg-[#F9FAFB] active:scale-95 shrink-0"
                            >
                              Pair
                            </button>
                          </div>
                        );
                      })}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
