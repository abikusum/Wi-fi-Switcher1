import { useState } from 'react';
import { WifiState, WifiNetwork } from '../types';
import { Wifi, WifiOff, RefreshCw, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WifiSwitchCardProps {
  wifiState: WifiState;
  onToggleWifi: (enabled: boolean) => void;
  onSelectNetwork: (network: WifiNetwork) => void;
  onScanNetworks: () => void;
}

export function WifiSwitchCard({
  wifiState,
  onToggleWifi,
  onSelectNetwork,
  onScanNetworks,
}: WifiSwitchCardProps) {
  const [showNetworkList, setShowNetworkList] = useState<boolean>(false);

  const handleToggle = () => {
    onToggleWifi(!wifiState.enabled);
  };

  return (
    <div
      id="wifi-switcher-card"
      className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm relative overflow-hidden transition-all"
    >
      {/* Eyebrow & Status */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[9px] uppercase tracking-wider font-bold text-[#9CA3AF]">
          Primary Wireless Interface
        </h2>
        <span
          className={`text-[8.5px] px-1.5 py-0.2 rounded-full font-mono font-bold tracking-wider uppercase transition-colors ${
            wifiState.enabled
              ? wifiState.status === 'connected'
                ? 'bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]'
                : 'bg-[#EFF6FF] text-[#3B82F6] border border-[#BFDBFE]'
              : 'bg-[#F3F4F6] text-[#9CA3AF] border border-[#E5E7EB]'
          }`}
        >
          {wifiState.enabled ? wifiState.status : 'OFF'}
        </span>
      </div>

      {/* Main Switch Row */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-300 ${
              wifiState.enabled
                ? 'bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]'
                : 'bg-[#F9FAFB] text-[#9CA3AF] border border-[#E5E7EB]'
            }`}
          >
            {wifiState.enabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1F2937] leading-tight">Wi-Fi Network</p>
            <p className="text-[11px] text-[#6B7280] truncate font-normal">
              {wifiState.enabled
                ? wifiState.status === 'connected'
                  ? `Connected: ${wifiState.ssid}`
                  : 'Searching for networks...'
                : 'Radio interface powered down'}
            </p>
          </div>
        </div>

        {/* Clean Minimalist Toggle Switch */}
        <button
          id="btn-toggle-wifi"
          role="switch"
          aria-checked={wifiState.enabled}
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            wifiState.enabled ? 'bg-[#10B981]' : 'bg-[#D1D5DB]'
          }`}
        >
          <span className="sr-only">Toggle Wireless Wi-Fi</span>
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`pointer-events-none inline-block h-4 w-4 mt-1 ml-1 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              wifiState.enabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Connected Network & List Panel */}
      <AnimatePresence>
        {wifiState.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {/* Network List Toggle */}
            <div className="mt-2 flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
              <button
                id="btn-toggle-network-list"
                onClick={() => setShowNetworkList((prev) => !prev)}
                className="flex items-center gap-1 text-[11px] font-medium text-[#6B7280] hover:text-[#1F2937] py-0.5 px-1.5 rounded hover:bg-[#F3F4F6]"
              >
                <span>Networks ({wifiState.availableNetworks.length})</span>
                {showNetworkList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button
                id="btn-scan-wifi"
                onClick={onScanNetworks}
                className="flex items-center gap-1 text-[10.5px] font-medium text-[#374151] hover:text-[#1F2937] bg-[#F9FAFB] hover:bg-[#F3F4F6] px-2 py-0.5 rounded-md border border-[#E5E7EB] shadow-sm active:scale-95"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${wifiState.status === 'scanning' ? 'animate-spin text-[#10B981]' : 'text-[#6B7280]'}`} />
                <span>{wifiState.status === 'scanning' ? 'Scanning' : 'Scan'}</span>
              </button>
            </div>

            {/* Network List Dropdown */}
            <AnimatePresence>
              {showNetworkList && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1.5 space-y-1 border-t border-[#F3F4F6] pt-1.5 max-h-44 overflow-y-auto"
                >
                  {wifiState.availableNetworks.map((network) => (
                    <div
                      key={network.id}
                      className={`flex items-center justify-between p-2 rounded-lg transition-all border ${
                        network.ssid === wifiState.ssid
                          ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                          : 'bg-[#F9FAFB] hover:bg-[#F3F4F6] border-[#F3F4F6] text-[#374151]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Wifi className={`w-3.5 h-3.5 shrink-0 ${network.ssid === wifiState.ssid ? 'text-[#10B981]' : 'text-[#9CA3AF]'}`} />
                        <div className="min-w-0">
                          <span className="text-[11px] font-semibold text-[#1F2937] block leading-tight truncate">{network.ssid}</span>
                          <span className="text-[9.5px] text-[#6B7280] font-mono">
                            {network.frequencyGhz}GHz · {network.signalStrengthDbm}dBm
                          </span>
                        </div>
                      </div>

                      {network.ssid === wifiState.ssid ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-[#10B981] bg-white px-1.5 py-0.5 rounded border border-[#A7F3D0]">
                          <Check className="w-2.5 h-2.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectNetwork(network)}
                          className="text-[9.5px] font-medium text-[#4B5563] hover:text-[#111827] bg-white border border-[#E5E7EB] px-2 py-0.5 rounded shadow-sm hover:bg-[#F9FAFB] active:scale-95"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
