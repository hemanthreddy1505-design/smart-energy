import React from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { 
  Zap, 
  Power, 
  AlertTriangle, 
  Activity, 
  Clock, 
  IndianRupee, 
  Leaf, 
  Gauge,
  Snowflake,
  Tv,
  Monitor,
  Lightbulb,
  Fan,
  Flame,
  CheckCircle2
} from 'lucide-react';

const iconMap = {
  'AC001': Snowflake,
  'FR001': Zap,
  'TV001': Tv,
  'PC001': Monitor,
  'LT001': Lightbulb,
  'FN001': Fan,
  'WM001': Zap,
  'GH001': Flame,
};

export function AppliancesView() {
  const { appliances, toggleAppliance, injectAnomaly, telemetry } = useEnergy();

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Appliance Energy Tracking & Controls
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Live power sensing, voltage monitoring, and smart automatic switches
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Sensor Hub Active</span>
        </div>
      </div>

      {/* Grid of Detailed Appliance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appliances.map((app) => {
          const Icon = iconMap[app.id] || Zap;
          const reading = app.reading || {
            voltage: telemetry.gridVoltage,
            current: 0,
            powerFactor: app.powerFactor,
            activePower: 0,
            apparentPower: 0,
            reactivePower: 0,
            cumulativeEnergyKwh: 0,
            status: app.isOn ? 'ON' : 'OFF'
          };

          const energyKwh = reading.cumulativeEnergyKwh || 0;
          const cost = (energyKwh * telemetry.tariffRate).toFixed(2);
          const carbon = (energyKwh * 0.82).toFixed(2);
          const isAnomaly = app.isAnomaly;

          return (
            <div
              key={app.id}
              className={`rounded-2xl p-5 border transition-all duration-200 ${
                app.isOn
                  ? isAnomaly
                    ? 'bg-rose-50/50 border-rose-300 shadow-md'
                    : 'bg-white border-neutral-200/90 shadow-xs hover:shadow-md'
                  : 'bg-neutral-50/70 border-neutral-200/60 opacity-85'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl border ${
                    app.isOn
                      ? isAnomaly
                        ? 'bg-rose-100 text-rose-600 border-rose-200 animate-pulse'
                        : 'bg-neutral-100 text-neutral-900 border-neutral-200'
                      : 'bg-neutral-200 text-neutral-400 border-neutral-300'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-neutral-900">{app.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        app.isOn 
                          ? isAnomaly ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}>
                        {app.isOn ? '● ON' : '○ OFF'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      ID: <span className="font-mono text-neutral-600">{app.id}</span> · {app.location} · Rated: {app.ratedPower}W
                    </p>
                  </div>
                </div>

                {/* Primary Remote Relay Switch Button */}
                <button
                  onClick={() => toggleAppliance(app.id, !app.isOn)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                    app.isOn
                      ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{app.isOn ? 'Turn OFF' : 'Turn ON'}</span>
                </button>
              </div>

              {/* Electrical Parameters Grid */}
              <div className="mt-4 pt-3 border-t border-neutral-100">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-neutral-100/70 border border-neutral-200/50">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Power</span>
                    <span className={`text-xs sm:text-sm font-mono font-bold ${
                      app.isOn ? (isAnomaly ? 'text-rose-600' : 'text-neutral-900') : 'text-neutral-400'
                    }`}>
                      {app.isOn ? `${Math.round(reading.activePower)} W` : '0 W'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-neutral-100/70 border border-neutral-200/50">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Current</span>
                    <span className="text-xs sm:text-sm font-mono font-semibold text-neutral-800">
                      {app.isOn ? `${reading.current} A` : '0.0 A'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-neutral-100/70 border border-neutral-200/50">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Energy</span>
                    <span className="text-xs sm:text-sm font-mono font-semibold text-neutral-800">
                      {energyKwh.toFixed(2)} kWh
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-neutral-100/70 border border-neutral-200/50">
                    <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Cost</span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-neutral-900">
                      ₹{cost}
                    </span>
                  </div>
                </div>
              </div>

              {/* Anomaly Control Bar */}
              <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-400">
                  Power Factor: <strong className="font-mono text-neutral-700">{app.powerFactor}</strong>
                </span>

                <button
                  onClick={() => injectAnomaly(app.id, !isAnomaly)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    isAnomaly
                      ? 'bg-rose-100 text-rose-700 border-rose-300'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                  }`}
                >
                  {isAnomaly ? 'Clear Anomaly' : '⚡ Simulate Anomaly'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
