import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  Settings,
  IndianRupee,
  Leaf,
  Zap,
  Gauge,
  CheckCircle2,
  Save,
  RotateCcw,
  Network,
  Home,
  GitBranch,
  Box,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export function EnergyConfigView() {
  const { telemetry, updateConfig, setActiveTab } = useEnergy();

  const [tariff, setTariff] = useState(telemetry.tariffRate || 8.0);
  const [peakMultiplier, setPeakMultiplier] = useState(1.25);
  const [peakStart, setPeakStart] = useState('18:00');
  const [peakEnd, setPeakEnd] = useState('22:00');
  const [carbonFactor, setCarbonFactor] = useState(0.82);
  const [sanctionedDemandW, setSanctionedDemandW] = useState(5000);
  const [monthlyBudgetKwh, setMonthlyBudgetKwh] = useState(350);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    const success = await updateConfig({
      tariff: Number(tariff),
      peakMultiplier: Number(peakMultiplier),
      carbonFactor: Number(carbonFactor),
      sanctionedDemandW: Number(sanctionedDemandW),
      monthlyBudgetKwh: Number(monthlyBudgetKwh)
    });

    if (success) {
      setSaveStatus('System parameters updated and synchronized with backend engine.');
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const handleReset = () => {
    setTariff(8.0);
    setPeakMultiplier(1.25);
    setPeakStart('18:00');
    setPeakEnd('22:00');
    setCarbonFactor(0.82);
    setSanctionedDemandW(5000);
    setMonthlyBudgetKwh(350);
  };

  const virtualLabModules = [
    {
      name: 'Virtual Energy Lab',
      route: 'virtual-lab',
      icon: Network,
      desc: 'Complete engineering laboratory workspace with component library and simulation controls'
    },
    {
      name: 'Virtual Rooms',
      route: 'virtual-rooms',
      icon: Home,
      desc: 'Room architecture builder, dimensioning, socket drops, and space energy telemetry'
    },
    {
      name: 'Electrical Topology',
      route: 'electrical-topology',
      icon: GitBranch,
      desc: 'Cisco Packet-Tracer style interactive schematic node editor and breaker trip engine'
    },
    {
      name: '3D Energy Simulation',
      route: '3d-simulation',
      icon: Box,
      desc: 'Real-time 3D isometric digital twin with glowing energy conduits and interactive raycasting'
    }
  ];

  return (
    <div className="space-y-6">

      {/* TOP HEADER */}
      <div className="glass-card rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/80 shadow-card">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#00A86B]" />
            System Configuration & Virtual Lab Studio
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Calibrate billing tiers, peak surcharge multiplier, and configure virtual digital twin modules
          </p>
        </div>

        {saveStatus && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#E8F8F0] border border-[#00A86B]/30 text-[#00A86B] text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* VIRTUAL ENERGY LAB CONFIGURATION MODULES */}
      <div className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00A86B]" />
            <h3 className="font-bold text-sm text-neutral-900">Virtual Energy Laboratory Modules</h3>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E8F8F0] text-[#00A86B] border border-[#00A86B]/20">
            DIGITAL TWIN V2.0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {virtualLabModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={idx}
                onClick={() => setActiveTab(mod.route)}
                className="p-4 rounded-2xl bg-white/80 hover:bg-[#E8F8F0]/40 border border-neutral-200/70 hover:border-[#00A86B]/40 flex items-start justify-between gap-3 transition-all cursor-pointer group shadow-xs hover:shadow-card-hover"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#061C16] text-[#19C37D] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-neutral-900 group-hover:text-[#00A86B] transition-colors">
                      {mod.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 leading-snug mt-0.5">
                      {mod.desc}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-[#00A86B] group-hover:translate-x-1 transition-transform mt-2">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONFIGURATION FORM */}
      <form onSubmit={handleSave} className="space-y-6">

        {/* 1. Electricity Tariff & Time-of-Day Parameters */}
        <div className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00A86B] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900">Electricity Tariff & TOD Multipliers</h3>
              <span className="text-xs text-neutral-400">Indian State Utility Domestic (LT-2a Standard)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">Base Flat Tariff (₹/kWh)</label>
              <input
                type="number"
                step="0.1"
                value={tariff}
                onChange={(e) => setTariff(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 font-mono"
              />
              <span className="text-[10px] text-neutral-400 block mt-1">Default: ₹8.00 / Unit</span>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">Peak Surcharge Factor</label>
              <input
                type="number"
                step="0.05"
                value={peakMultiplier}
                onChange={(e) => setPeakMultiplier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 font-mono"
              />
              <span className="text-[10px] text-neutral-400 block mt-1">1.25 = +25% peak premium</span>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">Peak Start Time (TOD)</label>
              <input
                type="text"
                value={peakStart}
                onChange={(e) => setPeakStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 font-mono"
              />
              <span className="text-[10px] text-neutral-400 block mt-1">24-hr format (e.g. 18:00)</span>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">Peak End Time (TOD)</label>
              <input
                type="text"
                value={peakEnd}
                onChange={(e) => setPeakEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 font-mono"
              />
              <span className="text-[10px] text-neutral-400 block mt-1">24-hr format (e.g. 22:00)</span>
            </div>
          </div>
        </div>

        {/* 2. Environmental & Sanction Thresholds */}
        <div className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#19C37D] flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900">Carbon Factor & Grid Capacity</h3>
              <span className="text-xs text-neutral-400">CEA Grid emission factor and sanctioned demand limits</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">Grid Carbon Factor (kg CO₂/kWh)</label>
              <input
                type="number"
                step="0.01"
                value={carbonFactor}
                onChange={(e) => setCarbonFactor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 font-mono"
              />
              <span className="text-[10px] text-neutral-400 block mt-1">Central Electricity Authority standard: 0.82</span>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">Sanctioned Peak Demand (Watts)</label>
              <input
                type="number"
                step="100"
                value={sanctionedDemandW}
                onChange={(e) => setSanctionedDemandW(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 font-mono"
              />
              <span className="text-[10px] text-neutral-400 block mt-1">5000 W = 5.0 kW Domestic Sanction</span>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1.5">Target Conservation Budget (kWh/mo)</label>
              <input
                type="number"
                step="10"
                value={monthlyBudgetKwh}
                onChange={(e) => setMonthlyBudgetKwh(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 font-mono"
              />
              <span className="text-[10px] text-neutral-400 block mt-1">Target threshold for conservation progress</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-bold border border-neutral-200 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00A86B] to-[#059669] hover:from-[#047857] hover:to-[#065f46] text-white text-xs font-bold shadow-emerald-glow transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
}
