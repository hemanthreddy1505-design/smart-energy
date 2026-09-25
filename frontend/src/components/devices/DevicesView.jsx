import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  Zap,
  Power,
  Search,
  Filter,
  SlidersHorizontal,
  Flame,
  Snowflake,
  Tv,
  Monitor,
  Lightbulb,
  Fan,
  WashingMachine,
  Activity,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const iconMap = {
  'AC001': Snowflake,
  'FR001': Zap,
  'TV001': Tv,
  'PC001': Monitor,
  'LT001': Lightbulb,
  'FN001': Fan,
  'WM001': WashingMachine,
  'GH001': Flame,
  'WH001': Flame,
};

const applianceImageMap = {
  'AC001': '/appliances/AC001.png',
  'FR001': '/appliances/FR001.png',
  'TV001': '/appliances/TV001.png',
  'PC001': '/appliances/PC001.png',
  'LT001': '/appliances/LT001.png',
  'FN001': '/appliances/FN001.png',
  'WM001': '/appliances/WM001.png',
  'GH001': '/appliances/WH001.png',
  'WH001': '/appliances/WH001.png',
};

export function DevicesView() {
  const {
    appliances,
    toggleAppliance,
    setSelectedDeviceForDetail,
    injectAnomaly,
    telemetry,
    currentUser
  } = useEnergy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [imageErrors, setImageErrors] = useState({});

  // Filter categories
  const categories = ['ALL', 'Living Room', 'Kitchen', 'Bedroom', 'Office', 'Utility', 'Bathroom'];

  // Filtered devices
  const filteredAppliances = appliances.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          device.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          device.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || device.location.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const activeCount = appliances.filter(a => a.isOn).length;
  const totalPowerW = appliances
    .filter(a => a.isOn)
    .reduce((acc, a) => acc + (a.reading?.activePower || 0), 0);

  return (
    <div className="space-y-6">

      {/* TOP SUMMARY & CONTROLS STRIP */}
      <div className="glass-card rounded-[20px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/80 shadow-card">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#00A86B]" />
            Smart Appliances & Sub-Meters
          </h2>
          {currentUser && (
            <p className="text-xs text-neutral-500 mt-0.5">
              Premises: <strong className="text-neutral-800">{currentUser.door_no}</strong> · Resident: {currentUser.name}
            </p>
          )}
        </div>

        {/* Live Aggregates */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#E8F8F0] border border-[#00A86B]/20 font-mono">
            <span className="text-neutral-500 block text-[9px] font-bold uppercase tracking-wider">CONNECTED</span>
            <span className="font-extrabold text-[#00A86B]">{activeCount} / {appliances.length} Active</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 font-mono">
            <span className="text-amber-600 block text-[9px] font-bold uppercase tracking-wider">TOTAL LOAD</span>
            <span className="font-extrabold text-amber-900">{totalPowerW} W</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#00A86B] to-[#059669] text-white shadow-xs font-bold'
                  : 'bg-white/80 hover:bg-white text-neutral-600 border border-neutral-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search devices, rooms, channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white/90 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30"
          />
        </div>
      </div>

      {/* APPLIANCE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredAppliances.map((app, idx) => {
          const Icon = iconMap[app.id] || Zap;
          const reading = app.reading || {
            activePower: 0,
            current: 0,
            powerFactor: app.powerFactor || 0.95,
            cumulativeEnergyKwh: 0
          };
          const power = app.isOn ? reading.activePower : 0;
          const energyKwh = reading.cumulativeEnergyKwh || 0;
          const estCostToday = (energyKwh * telemetry.tariffRate).toFixed(1);

          return (
            <div
              key={app.id}
              onClick={() => setSelectedDeviceForDetail(app)}
              className={`group p-4 rounded-[20px] bg-white/85 backdrop-blur-md border transition-all cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col justify-between ${
                app.isOn 
                  ? 'border-neutral-200/90 shadow-card' 
                  : 'border-neutral-200/50 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                {/* 1. Top Product Image Showcase */}
                <div className="bg-neutral-50/80 rounded-2xl relative p-3 h-32 flex items-center justify-center overflow-hidden mb-3 border border-neutral-100/80 group-hover:bg-[#E8F8F0]/30 transition-colors">
                  {!imageErrors[app.id] && applianceImageMap[app.id] ? (
                    <img
                      src={applianceImageMap[app.id]}
                      alt={app.name}
                      onError={() => setImageErrors(prev => ({ ...prev, [app.id]: true }))}
                      className={`h-28 w-auto max-w-[85%] object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                        app.isOn ? 'opacity-100' : 'opacity-60 grayscale-[35%]'
                      }`}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-neutral-400 shadow-xs">
                      <Icon className="w-8 h-8 stroke-[1.5] text-[#00A86B]" />
                    </div>
                  )}

                  {/* Floating Round Power Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAppliance(app.id);
                    }}
                    title={app.isOn ? 'Turn OFF' : 'Turn ON'}
                    className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer z-10 ${
                      app.isOn
                        ? 'bg-[#E8F8F0] border-[#00A86B]/30 text-[#00A86B] ring-2 ring-[#00A86B]/20 hover:bg-emerald-100 shadow-xs'
                        : 'bg-white border-neutral-200 text-neutral-400 hover:bg-neutral-100'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2. Device Title & Status Row */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      app.isOn ? 'bg-[#061C16] text-[#19C37D]' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 group-hover:text-[#00A86B] transition-colors leading-tight">
                        {app.name}
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-sans block leading-tight">
                        {app.location}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {app.isOn ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00A86B] bg-[#E8F8F0] px-2 py-0.5 rounded-full border border-[#00A86B]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00A86B] animate-pulse"></span>
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300"></span>
                        STANDBY
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Technical Node Badging */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 mb-2.5">
                  <span className="bg-[#E8F8F0] px-1.5 py-0.2 rounded text-[#00A86B] font-bold">CH0{idx + 1}</span>
                  <span>SCT-013 Clamp</span>
                </div>

                {/* 4. Primary Metric: Power */}
                <div className="mb-2.5">
                  <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block">
                    Active Power
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-mono font-extrabold text-neutral-900">
                      {power.toFixed(1)}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">W</span>
                  </div>
                </div>

                {/* 5. Metric Strip (Current, PF, Energy) */}
                <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-neutral-50/80 border border-neutral-100 text-[10px] font-mono mb-2.5">
                  <div>
                    <span className="text-[9px] text-neutral-400 block">CURRENT</span>
                    <span className="font-bold text-neutral-700">{(app.isOn ? reading.current : 0).toFixed(1)}A</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-400 block">PF</span>
                    <span className={`font-bold ${(reading.powerFactor < 0.85 && app.isOn) ? 'text-rose-600' : 'text-neutral-700'}`}>
                      {reading.powerFactor.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-400 block">TODAY</span>
                    <span className="font-bold text-neutral-700">{energyKwh.toFixed(2)}k</span>
                  </div>
                </div>
              </div>

              {/* 6. Bottom Card Actions */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span className="font-mono text-[11px] font-semibold text-neutral-700">₹{estCostToday} today</span>
                <span className="flex items-center gap-0.5 text-[#00A86B] font-bold group-hover:translate-x-0.5 transition-transform text-[11px]">
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
