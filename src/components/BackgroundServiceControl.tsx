import { useState } from 'react';
import { BackgroundServiceState, ActivityLog } from '../types';
import { Server, Zap, ShieldCheck, Activity, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BackgroundServiceControlProps {
  serviceState: BackgroundServiceState;
  logs: ActivityLog[];
  onToggleService: (active: boolean) => void;
  onChangeEfficiencyMode: (mode: 'adaptive' | 'ultra-low' | 'high-precision') => void;
  onClearLogs: () => void;
}

export function BackgroundServiceControl({
  serviceState,
  logs,
  onToggleService,
  onChangeEfficiencyMode,
  onClearLogs,
}: BackgroundServiceControlProps) {
  const [showLogs, setShowLogs] = useState<boolean>(false);

  return (
    <div
      id="background-service-control"
      className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-5"
    >
      {/* Background Daemon Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-colors ${
              serviceState.isActive
                ? 'bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0] shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-[#F9FAFB] text-[#9CA3AF] border border-[#E5E7EB]'
            }`}
          >
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-[#1F2937] tracking-tight">Background Daemon</h3>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase ${
                  serviceState.isActive
                    ? 'bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]'
                    : 'bg-[#F3F4F6] text-[#9CA3AF] border border-[#E5E7EB]'
                }`}
              >
                {serviceState.isActive ? 'ACTIVE' : 'IDLE'}
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5 font-normal">
              {serviceState.isActive
                ? `Running in background every ${serviceState.intervalSeconds}s (Low-power wake lock)`
                : 'Background triangulation service is paused'}
            </p>
          </div>
        </div>

        {/* Minimalist Switch */}
        <button
          id="btn-toggle-background-service"
          role="switch"
          aria-checked={serviceState.isActive}
          onClick={() => onToggleService(!serviceState.isActive)}
          className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            serviceState.isActive ? 'bg-[#10B981]' : 'bg-[#D1D5DB]'
          }`}
        >
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`pointer-events-none inline-block h-6 w-6 mt-1 ml-1 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              serviceState.isActive ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Efficiency Modes Selector */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-[0.2em] block">
          Battery Optimization Mode
        </span>
        <div className="grid grid-cols-3 gap-2.5">
          {(
            [
              { id: 'ultra-low', label: 'Ultra-Low', desc: '15s Sync · 0.2%/h drain', icon: Zap },
              { id: 'adaptive', label: 'Adaptive', desc: '5s Sync · Balanced', icon: ShieldCheck },
              { id: 'high-precision', label: 'Realtime', desc: '2s Sync · Continuous', icon: Activity },
            ] as const
          ).map((mode) => {
            const isSelected = serviceState.batteryEfficiencyMode === mode.id;
            return (
              <button
                key={mode.id}
                id={`btn-mode-${mode.id}`}
                onClick={() => onChangeEfficiencyMode(mode.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF] shadow-sm'
                    : 'bg-[#F9FAFB] border-[#F3F4F6] hover:border-[#E5E7EB] text-[#6B7280]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <mode.icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'}`} />
                  <span className="text-xs font-semibold text-[#1F2937]">{mode.label}</span>
                </div>
                <span className="text-[10px] text-[#6B7280] block leading-tight">{mode.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Telemetry Stats Grid */}
      <div className="grid grid-cols-3 gap-3 text-[11px] font-mono pt-1">
        <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#F3F4F6]">
          <span className="text-[#9CA3AF] block text-[9px] uppercase font-bold tracking-wider">Sync Cycles</span>
          <span className="font-semibold text-[#1F2937]">{serviceState.cyclesCompleted} completed</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#F3F4F6]">
          <span className="text-[#9CA3AF] block text-[9px] uppercase font-bold tracking-wider">Battery Impact</span>
          <span className="font-semibold text-[#10B981]">
            {serviceState.batteryEfficiencyMode === 'ultra-low'
              ? '~0.2% / hr'
              : serviceState.batteryEfficiencyMode === 'adaptive'
              ? '~0.5% / hr'
              : '~1.1% / hr'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#F3F4F6]">
          <span className="text-[#9CA3AF] block text-[9px] uppercase font-bold tracking-wider">Wake Lock</span>
          <span className="font-semibold text-[#1F2937]">
            {serviceState.wakeLockAcquired ? 'Active (Lock)' : 'Optimized'}
          </span>
        </div>
      </div>

      {/* Background Activity Stream */}
      <div className="border-t border-[#F3F4F6] pt-3">
        <div className="flex items-center justify-between">
          <button
            id="btn-toggle-logs"
            onClick={() => setShowLogs((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#1F2937] transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Real-time Background Event Stream ({logs.length})</span>
            {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showLogs && (
            <button
              id="btn-clear-logs"
              onClick={onClearLogs}
              className="text-[10px] text-[#9CA3AF] hover:text-[#374151] font-mono uppercase font-bold tracking-wider"
            >
              Clear
            </button>
          )}
        </div>

        <AnimatePresence>
          {showLogs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2.5 p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] font-mono text-[10px] max-h-36 overflow-y-auto space-y-1.5"
            >
              {logs.length === 0 ? (
                <div className="text-[#9CA3AF] italic">No background events recorded yet.</div>
              ) : (
                logs.slice(-12).reverse().map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-[#4B5563]">
                    <span className="text-[#9CA3AF] select-none">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span
                      className={`px-1 rounded text-[9px] font-bold ${
                        log.type === 'wifi'
                          ? 'bg-[#EFF6FF] text-[#3B82F6]'
                          : log.type === 'cellular'
                          ? 'bg-[#ECFDF5] text-[#10B981]'
                          : 'bg-[#F3F4F6] text-[#4B5563]'
                      }`}
                    >
                      {log.type.toUpperCase()}
                    </span>
                    <span className="text-[#1F2937] truncate">{log.message}</span>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
