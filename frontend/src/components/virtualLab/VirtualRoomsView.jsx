import React from 'react';
import { useVirtualLab } from '../../context/VirtualLabContext';
import {
  Home,
  Power,
  Zap,
  Sparkles,
  Activity,
  CheckCircle2
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

export function VirtualRoomsView() {
  const {
    appliances,
    toggleDevicePower,
    toggleLivingRoomPower,
    totalActivePower,
    totalEnergyTodayKwh,
    labToast
  } = useVirtualLab();

  const activeCount = appliances.filter(a => a.isOn).length;
  const isAnyOn = activeCount > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* FLOATING ACTION TOAST */}
      {labToast && (
        <div className="p-4 rounded-2xl bg-[#E8F8F0] border-2 border-[#00A86B] text-[#00A86B] text-base font-bold flex items-center gap-3 animate-fade-in shadow-md">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <span>{labToast}</span>
        </div>
      )}

      {/* ROOM HEADER & MASTER SWITCH */}
      <div className="glass-card rounded-[26px] p-6 border-2 border-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-gradient-to-r from-white/95 to-[#F7FAF8]">
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00A86B] to-[#059669] flex items-center justify-center text-white shadow-md">
            <Home className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Living Room
            </h1>
            <p className="text-base text-neutral-500 font-medium">
              Tap any appliance or button to turn it ON or OFF
            </p>
          </div>
        </div>

        {/* Master Power Button (Large 56px touch target) */}
        <button
          onClick={() => toggleLivingRoomPower()}
          className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl text-base font-extrabold transition-all cursor-pointer shadow-md ${
            isAnyOn
              ? 'bg-gradient-to-r from-[#00A86B] to-[#059669] hover:from-[#047857] hover:to-[#065f46] text-white ring-4 ring-[#00A86B]/20'
              : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700'
          }`}
        >
          <Power className="w-6 h-6" />
          <span>{isAnyOn ? 'All Devices ON' : 'All Devices OFF'}</span>
        </button>

      </div>

      {/* 3 LARGE SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total Power Card */}
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

        {/* Energy Today Card */}
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

        {/* Devices ON Card */}
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

      {/* 8 LARGE APPLIANCE IMAGE CARDS */}
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
  );
}
