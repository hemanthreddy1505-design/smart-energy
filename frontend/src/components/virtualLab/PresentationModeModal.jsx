import React, { useState } from 'react';
import { useVirtualLab } from '../../context/VirtualLabContext';
import {
  Presentation,
  X,
  Zap,
  TrendingDown,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Leaf,
  IndianRupee,
  Clock,
  Server,
  Cpu,
  Layers,
  Activity
} from 'lucide-react';

export function PresentationModeModal() {
  const {
    isPresentationModeOpen,
    setIsPresentationModeOpen,
    totalActivePower,
    totalCurrent,
    gridVoltage,
    transformer,
    appliances,
    toggleDevicePower
  } = useVirtualLab();

  const [activeScenario, setActiveScenario] = useState('eco'); // 'baseline' | 'peak' | 'eco' | 'fault'

  if (!isPresentationModeOpen) return null;

  // Apply scenario preset
  const applyScenario = (scenarioKey) => {
    setActiveScenario(scenarioKey);
    if (scenarioKey === 'baseline') {
      // Normal evening baseline
      toggleDevicePower('AC001', true);
      toggleDevicePower('FR001', true);
      toggleDevicePower('TV001', true);
      toggleDevicePower('PC001', true);
      toggleDevicePower('LT001', true);
      toggleDevicePower('FN001', true);
      toggleDevicePower('WM001', false);
      toggleDevicePower('GH001', false);
    } else if (scenarioKey === 'peak') {
      // High-tariff uncoordinated peak stress (All heavy loads on)
      toggleDevicePower('AC001', true);
      toggleDevicePower('FR001', true);
      toggleDevicePower('TV001', true);
      toggleDevicePower('PC001', true);
      toggleDevicePower('LT001', true);
      toggleDevicePower('FN001', true);
      toggleDevicePower('WM001', true);
      toggleDevicePower('GH001', true);
    } else if (scenarioKey === 'eco') {
      // Eco Optimized (Heavy loads shifted to off-peak)
      toggleDevicePower('AC001', true);
      toggleDevicePower('FR001', true);
      toggleDevicePower('TV001', false);
      toggleDevicePower('PC001', true);
      toggleDevicePower('LT001', true);
      toggleDevicePower('FN001', true);
      toggleDevicePower('WM001', false);
      toggleDevicePower('GH001', false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#061C16]/95 backdrop-blur-2xl text-white overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between animate-fade-in select-none">
      
      {/* TOP HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00A86B] to-[#19C37D] text-white flex items-center justify-center shadow-emerald-glow">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Energy Lab Defense Presentation Mode
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00A86B]/20 text-[#19C37D] border border-[#00A86B]/30">
                LIVE ACADEMIC DECK
              </span>
            </div>
            <p className="text-xs text-emerald-200/70">
              Department of CSE · Academic Year 2026-27 · Smart Energy Conservation Digital Twin
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPresentationModeOpen(false)}
          className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* CENTER STAGE: COMPARATIVE ANALYSIS & LIVE METRICS */}
      <div className="space-y-6 my-6">

        {/* 1. SCENARIO SELECTOR STRIP */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-black/40 border border-white/10">
          <span className="text-xs font-bold text-neutral-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#19C37D]" />
            Presentation Scenarios:
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => applyScenario('baseline')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScenario === 'baseline'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10'
              }`}
            >
              1. Normal Baseline (1.9 kW)
            </button>

            <button
              onClick={() => applyScenario('peak')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScenario === 'peak'
                  ? 'bg-rose-600 text-white shadow-lg animate-pulse'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10'
              }`}
            >
              2. Peak Surcharge Stress (4.5 kW)
            </button>

            <button
              onClick={() => applyScenario('eco')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScenario === 'eco'
                  ? 'bg-[#00A86B] text-white shadow-emerald-glow'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10'
              }`}
            >
              3. Conservation & Load Shift (1.8 kW)
            </button>
          </div>
        </div>

        {/* 2. REAL-TIME TELEMETRY HUD TILES */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Simulated Grid Power</span>
            <span className="text-2xl font-mono font-extrabold text-[#19C37D]">
              {(totalActivePower / 1000).toFixed(2)} kW
            </span>
            <span className="text-[10px] text-neutral-400 block mt-1">{totalActivePower} Watts Active</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Line Current</span>
            <span className="text-2xl font-mono font-extrabold text-white">
              {totalCurrent.toFixed(1)} A
            </span>
            <span className="text-[10px] text-neutral-400 block mt-1">@ {gridVoltage.toFixed(0)}V Standard RMS</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Transformer Load</span>
            <span className="text-2xl font-mono font-extrabold text-white">
              {transformer.loadPercentage}%
            </span>
            <span className="text-[10px] text-neutral-400 block mt-1">10 kVA Virtual Substation</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Hourly Cost Burn</span>
            <span className="text-2xl font-mono font-extrabold text-amber-400">
              ₹{((totalActivePower / 1000) * 8.0).toFixed(2)}
            </span>
            <span className="text-[10px] text-neutral-400 block mt-1">₹8.00/kWh Domestic Tier</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">CO₂ Emission Rate</span>
            <span className="text-2xl font-mono font-extrabold text-emerald-400">
              {((totalActivePower / 1000) * 0.82).toFixed(2)}
            </span>
            <span className="text-[10px] text-neutral-400 block mt-1">kg CO₂ / Hour (CEA Grid)</span>
          </div>
        </div>

        {/* 3. BEFORE VS AFTER COMPARATIVE IMPACT MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Baseline Unoptimized */}
          <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <h3 className="font-bold text-sm text-rose-300">BEFORE: Uncoordinated Concurrent Loads</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-500/30">
                HIGH PEAK SURCHARGE
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              AC (1500W), Water Heater (2200W), and Washing Machine (700W) running concurrently during peak window (18:00–22:00) causes demand spikes exceeding 4.4 kW.
            </p>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-2">
              <div className="p-2.5 rounded-xl bg-black/40 border border-rose-500/20">
                <span className="text-[9px] text-neutral-400 block">PEAK DEMAND</span>
                <span className="font-bold text-rose-400 text-sm">4.40 kW</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-rose-500/20">
                <span className="text-[9px] text-neutral-400 block">MONTHLY BILL</span>
                <span className="font-bold text-rose-400 text-sm">₹4,320</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-rose-500/20">
                <span className="text-[9px] text-neutral-400 block">CARBON IMPACT</span>
                <span className="font-bold text-neutral-300 text-sm">118 kg CO₂</span>
              </div>
            </div>
          </div>

          {/* After Optimized */}
          <div className="p-5 rounded-2xl bg-emerald-950/30 border border-[#00A86B]/40 shadow-emerald-glow space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#00A86B]/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#19C37D] animate-pulse"></span>
                <h3 className="font-bold text-sm text-[#19C37D]">AFTER: Algorithmic Peak Load Shifting</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#19C37D] bg-[#00A86B]/20 px-2 py-0.5 rounded border border-[#00A86B]/30">
                SAVING ₹960 / MONTH
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Automated scheduler shifts Water Heater heating cycles to 22:30 (off-peak) and washing cycles to 14:00 (solar generation window), reducing coincident peak to 1.8 kW.
            </p>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-2">
              <div className="p-2.5 rounded-xl bg-black/40 border border-[#00A86B]/30">
                <span className="text-[9px] text-neutral-400 block">SHAVED DEMAND</span>
                <span className="font-bold text-[#19C37D] text-sm">1.80 kW (-59%)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-[#00A86B]/30">
                <span className="text-[9px] text-neutral-400 block">MONTHLY BILL</span>
                <span className="font-bold text-[#19C37D] text-sm">₹3,360 (-22%)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-[#00A86B]/30">
                <span className="text-[9px] text-neutral-400 block">AVOIDED CARBON</span>
                <span className="font-bold text-[#19C37D] text-sm">-32 kg CO₂/mo</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 font-mono">
        <span>Smart Energy Conservation System · Digital Twin & Virtual Lab Phase-II</span>
        <button
          onClick={() => setIsPresentationModeOpen(false)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00A86B] to-[#059669] text-white font-bold cursor-pointer"
        >
          Exit Presentation Mode
        </button>
      </div>

    </div>
  );
}
