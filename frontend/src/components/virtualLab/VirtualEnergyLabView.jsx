import React from 'react';
import { useVirtualLab } from '../../context/VirtualLabContext';
import {
  Zap,
  Power,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Activity,
  ArrowRight,
  Radio,
  Home,
  CheckCircle2,
  Box
} from 'lucide-react';

const APPLIANCE_IMAGES = {
  'AC001': '/appliances/AC001.png',
  'FR001': '/appliances/FR001.png',
  'TV001': '/appliances/TV001.png',
  'PC001': '/appliances/PC001.png',
  'LT001': '/appliances/LT001.png',
  'FN001': '/appliances/FN001.png',
  'WM001': '/appliances/WM001.png',
  'GH001': '/appliances/WH001.png',
  'WH001': '/appliances/WH001.png',
  'CH01': '/appliances/AC001.png',
  'CH02': '/appliances/FR001.png',
  'CH03': '/appliances/TV001.png',
  'CH04': '/appliances/PC001.png',
  'CH05': '/appliances/LT001.png',
  'CH06': '/appliances/FN001.png',
  'CH07': '/appliances/WM001.png',
  'CH08': '/appliances/WH001.png',
};

export function VirtualEnergyLabView() {
  const {
    appliances,
    totalActivePower,
    totalEnergyTodayKwh,
    isSimRunning,
    toggleSimulation,
    resetSimulation,
    toggleDevicePower,
    labToast
  } = useVirtualLab();

  const activeCount = appliances.filter(a => a.isOn).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">

      {/* FLOATING ACTION TOAST */}
      {labToast && (
        <div className="p-4 rounded-2xl bg-[#E8F8F0] border-2 border-[#00A86B] text-[#00A86B] text-base font-bold flex items-center gap-3 animate-fade-in shadow-md">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <span>{labToast}</span>
        </div>
      )}

      {/* TOP TITLE & SIMPLE CONTROLS */}
      <div className="glass-card rounded-[26px] p-6 border-2 border-white shadow-card flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-r from-white/95 to-[#F7FAF8]">
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00A86B] to-[#059669] flex items-center justify-center text-white shadow-md">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Virtual Energy Laboratory
            </h1>
            <p className="text-base text-neutral-500 font-medium">
              Watch electricity travel from the power grid into your appliances
            </p>
          </div>
        </div>

        {/* Start / Pause & Reset Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSimulation}
            className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-base font-extrabold transition-all cursor-pointer shadow-md ${
              isSimRunning
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300'
                : 'bg-gradient-to-r from-[#00A86B] to-[#059669] hover:from-[#047857] hover:to-[#065f46] text-white ring-4 ring-[#00A86B]/20'
            }`}
          >
            {isSimRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start</span>
              </>
            )}
          </button>

          <button
            onClick={resetSimulation}
            className="p-3.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer border border-neutral-300 shadow-2xs"
            title="Reset Simulation"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* 3 LARGE SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div className="glass-card rounded-[24px] p-6 border-2 border-white shadow-card bg-white flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-[#00A86B] shrink-0">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
              Total Power
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#00A86B] tracking-tight">
              {totalActivePower.toLocaleString()} <span className="text-xl font-bold text-neutral-400">W</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[24px] p-6 border-2 border-white shadow-card bg-white flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
              Energy Today
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-purple-700 tracking-tight">
              {totalEnergyTodayKwh} <span className="text-xl font-bold text-neutral-400">kWh</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[24px] p-6 border-2 border-white shadow-card bg-white flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">
              Devices ON
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              {activeCount} <span className="text-xl font-bold text-neutral-400">/ {appliances.length}</span>
            </div>
          </div>
        </div>

      </div>

      {/* SIMPLE VISUAL ELECTRICITY JOURNEY (LEFT TO RIGHT FLOW) */}
      <div className="glass-card rounded-[26px] p-7 border-2 border-white shadow-card bg-gradient-to-br from-[#061C16] to-[#0a2e23] text-white">
        
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse"></span>
            How Electricity Travels to Your Flat
          </h2>
        </div>

        {/* 4 Connected Visual Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative items-center">
          
          {/* Step 1: Power Grid */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-[#10B981] mx-auto flex items-center justify-center mb-3">
              <Zap className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-[#10B981] uppercase tracking-wider">Step 1</div>
            <div className="text-lg font-bold text-white mt-0.5">Power Grid</div>
            <div className="text-xs text-neutral-300 font-mono mt-1">230 V · 50 Hz</div>
          </div>

          {/* Step 2: Transformer */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-[#10B981] mx-auto flex items-center justify-center mb-3">
              <Radio className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-[#10B981] uppercase tracking-wider">Step 2</div>
            <div className="text-lg font-bold text-white mt-0.5">Transformer</div>
            <div className="text-xs text-neutral-300 font-mono mt-1">10 kVA Substation</div>
          </div>

          {/* Step 3: Living Room */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-[#10B981] mx-auto flex items-center justify-center mb-3">
              <Home className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-[#10B981] uppercase tracking-wider">Step 3</div>
            <div className="text-lg font-bold text-white mt-0.5">Living Room</div>
            <div className="text-xs text-neutral-300 font-mono mt-1">Distribution Hub</div>
          </div>

          {/* Step 4: Appliances */}
          <div className="p-5 rounded-2xl bg-emerald-500/20 backdrop-blur-md border-2 border-[#10B981] text-center shadow-emerald-glow">
            <div className="w-12 h-12 rounded-xl bg-[#10B981] text-white mx-auto flex items-center justify-center mb-3">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-[#10B981] uppercase tracking-wider">Step 4</div>
            <div className="text-lg font-bold text-white mt-0.5">Your Appliances</div>
            <div className="text-xs text-[#10B981] font-mono font-bold mt-1">{totalActivePower.toLocaleString()} W Active</div>
          </div>

        </div>

      </div>

      {/* YOUR APPLIANCES SECTION */}
      <div className="space-y-5">
        
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Your Appliances
          </h2>
          <p className="text-base text-neutral-500 font-medium">
            Turn appliances ON or OFF to see electricity consumption change in real time
          </p>
        </div>

        {/* 8 Real Appliance Image Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {appliances.map((app) => {
            const imageSrc = APPLIANCE_IMAGES[app.id] || '/appliances/AC001.png';
            const activePower = app.activePowerW || (app.isOn ? app.ratedPower : 0);

            return (
              <div
                key={app.id}
                className={`rounded-[26px] p-5 border-2 transition-all flex flex-col justify-between ${
                  app.isOn
                    ? 'bg-white border-[#00A86B] shadow-lg ring-2 ring-[#00A86B]/20'
                    : 'bg-neutral-100/80 border-neutral-200 opacity-70'
                }`}
              >
                {/* Appliance Image (Clickable) */}
                <div
                  onClick={() => toggleDevicePower(app.id)}
                  className="w-full h-44 flex items-center justify-center p-3 cursor-pointer select-none rounded-2xl bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
                >
                  <img
                    src={imageSrc}
                    alt={app.name}
                    className={`max-h-full max-w-full object-contain transition-all duration-300 ${
                      app.isOn ? 'scale-105 filter drop-shadow-md' : 'grayscale opacity-60'
                    }`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Appliance Name */}
                <div className="mt-4 text-center">
                  <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight">
                    {app.name}
                  </h3>
                  
                  {/* Large Live Power Readout */}
                  <div className={`text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight ${
                    app.isOn ? 'text-[#00A86B]' : 'text-neutral-400'
                  }`}>
                    {app.isOn ? `${activePower.toLocaleString()} W` : '0 W'}
                  </div>
                </div>

                {/* Large Touch-Friendly ON / OFF Button (54px Height) */}
                <button
                  onClick={() => toggleDevicePower(app.id)}
                  className={`mt-4 w-full h-14 rounded-2xl text-base font-extrabold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md ${
                    app.isOn
                      ? 'bg-gradient-to-r from-[#00A86B] to-[#059669] hover:from-[#047857] hover:to-[#065f46] text-white ring-4 ring-[#00A86B]/20'
                      : 'bg-neutral-300 hover:bg-neutral-400 text-neutral-800'
                  }`}
                >
                  <Power className="w-5 h-5" />
                  <span>{app.isOn ? 'ON' : 'OFF'}</span>
                </button>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
