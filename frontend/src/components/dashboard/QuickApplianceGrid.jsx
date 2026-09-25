import React from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { 
  Snowflake, 
  Tv, 
  Monitor, 
  Lightbulb, 
  Fan, 
  Flame, 
  Power, 
  Zap, 
  AlertTriangle 
} from 'lucide-react';

// Custom icons mapping
const iconMap = {
  'AC001': Snowflake,
  'FR001': Zap, // Refrigerator
  'TV001': Tv,
  'PC001': Monitor,
  'LT001': Lightbulb,
  'FN001': Fan,
  'WM001': Zap, // Washing Machine
  'GH001': Flame, // Geyser / Water Heater
};

export function QuickApplianceGrid() {
  const { appliances, toggleAppliance } = useEnergy();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Power className="w-4 h-4 text-emerald-400" />
          Appliances & Smart Switches
        </h3>
        <span className="text-xs text-slate-400">
          {appliances.filter(a => a.isOn).length} of {appliances.length} Active
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {appliances.map((app) => {
          const Icon = iconMap[app.id] || Zap;
          const powerW = app.reading ? app.reading.activePower : 0;
          const currentA = app.reading ? app.reading.current : 0;
          const isAnomaly = app.isAnomaly;

          return (
            <div
              key={app.id}
              className={`relative rounded-2xl p-4 transition-all border ${
                app.isOn 
                  ? isAnomaly
                    ? 'bg-rose-950/30 border-rose-500/40 shadow-lg shadow-rose-950/20'
                    : 'bg-slate-900/90 border-emerald-500/30 shadow-lg shadow-emerald-950/10'
                  : 'bg-slate-950/60 border-slate-800 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Header with Icon and Toggle switch */}
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl border ${
                  app.isOn
                    ? isAnomaly
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Tactile Switch Button */}
                <button
                  onClick={() => toggleAppliance(app.id, !app.isOn)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    app.isOn ? (isAnomaly ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={app.isOn}
                  title={`Turn ${app.isOn ? 'OFF' : 'ON'} ${app.name}`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      app.isOn ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Title & Location */}
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-slate-100 truncate">{app.name}</h4>
                  {isAnomaly && (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 animate-bounce" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">{app.location}</p>
              </div>

              {/* Electrical Telemetry Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Power</span>
                  <span className={`text-base font-mono font-bold ${
                    app.isOn 
                      ? isAnomaly ? 'text-rose-400 animate-pulse' : 'text-emerald-400' 
                      : 'text-slate-400'
                  }`}>
                    {app.isOn ? `${Math.round(powerW)} W` : '0 W'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Current</span>
                  <span className="text-xs font-mono text-slate-300">
                    {app.isOn ? `${currentA} A` : '0.0 A'}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
