import React from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { 
  Play, 
  Pause, 
  FastForward, 
  AlertTriangle, 
  RotateCcw, 
  Activity, 
  Clock, 
  CheckCircle 
} from 'lucide-react';

export function SimControlBar() {
  const { 
    speedMultiplier, 
    setSimSpeed, 
    isPaused, 
    togglePause, 
    injectAnomaly, 
    resetSimulation, 
    appliances 
  } = useEnergy();

  const speedOptions = [1, 5, 10, 50];

  const acAppliance = appliances.find(a => a.id === 'AC001');
  const isAcAnomaly = acAppliance?.isAnomaly;

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-6 shadow-xl">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Left: Simulation State Indicator */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {!isPaused && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isPaused ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Simulation Engine:
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPaused 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {isPaused ? 'PAUSED' : 'RUNNING'}
            </span>
          </div>

          {/* Pause / Resume Button */}
          <button
            onClick={togglePause}
            className={`p-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              isPaused
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>

        {/* Center: Speed Multiplier Controls */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-center">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Speed:</span>
          </span>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {speedOptions.map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  speedMultiplier === spd
                    ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 hidden xl:inline">
            ({speedMultiplier > 1 ? `1 min = ${speedMultiplier} mins simulated` : 'Real-time 1 sec = 1 sec'})
          </span>
        </div>

        {/* Right: Anomaly Injection & Reset */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          
          {/* Inject / Clear Anomaly */}
          <button
            onClick={() => injectAnomaly('AC001', !isAcAnomaly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              isAcAnomaly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 animate-pulse'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title="Inject an abnormal power surge on Air Conditioner for anomaly detection demo"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isAcAnomaly ? 'Clear AC Surge' : 'Inject AC Anomaly'}</span>
          </button>

          {/* Reset Simulation Data */}
          <button
            onClick={() => {
              if (window.confirm('Reset all accumulated energy counters, charts, and alerts?')) {
                resetSimulation();
              }
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Reset accumulators"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

        </div>

      </div>
    </div>
  );
}
