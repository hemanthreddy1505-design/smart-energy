import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  FlaskConical,
  X,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Flame,
  AlertTriangle,
  Leaf,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export function SystemLabModal({ isOpen, onClose }) {
  const {
    speedMultiplier,
    setSimSpeed,
    isPaused,
    togglePause,
    applyScenario,
    resetSimulation
  } = useEnergy();

  const [activeScenario, setActiveScenario] = useState('normal');
  const [toastMsg, setToastMsg] = useState(null);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'normal',
      name: 'Standard Baseline',
      desc: 'Standard diurnal domestic baseline. Power factor nominal at 0.95.',
      icon: Zap,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'high_demand',
      name: 'High Demand Stress Test',
      desc: 'Energizes AC, Water Heater, and Microwave concurrently (>3800W). Tests demand limit alerts.',
      icon: Flame,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 'peak_hour',
      name: 'Peak Tariff Surcharge (18:00–22:00)',
      desc: 'Forces peak pricing window (1.25x surcharge). Showcases peak load shifting analytics.',
      icon: Clock,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'anomaly',
      name: 'Vampire / Low PF Anomaly Injection',
      desc: 'Injects severe inductive distortion (PF < 0.72) and inrush current on AC circuit.',
      icon: AlertTriangle,
      color: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    {
      id: 'eco_mode',
      name: 'Eco Conservation Mode',
      desc: 'Cuts all non-essential standby loads and activates energy conservation policies.',
      icon: Leaf,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  ];

  const handleApplyScenario = async (id, name) => {
    setActiveScenario(id);
    const success = await applyScenario(id);
    if (success) {
      setToastMsg(`Simulation scenario applied: ${name}`);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset telemetry database to initial academic state?')) {
      await resetSimulation();
      setToastMsg('Simulation state reset to default baseline.');
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900">System Simulation Lab (Viva Sandbox)</h3>
              <p className="text-xs text-neutral-500">
                Trigger real-time scenarios and speed multipliers to demonstrate system response
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">

          {/* Toast */}
          {toastMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* SIMULATION CONTROLS (SPEED & PAUSE) */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
            <span className="font-bold text-neutral-900 block text-xs">Simulation Clock & Execution Speed</span>
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Speed Buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-neutral-200">
                {[1, 5, 10, 25, 50].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSimSpeed(spd)}
                    className={`px-3 py-1 rounded-lg font-mono font-bold cursor-pointer transition-all ${
                      speedMultiplier === spd
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Pause / Resume Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePause}
                  className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                    isPaused
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? 'Resume Ticks' : 'Pause Ticks'}</span>
                </button>

                <button
                  onClick={handleReset}
                  title="Reset SQLite database and engine to baseline"
                  className="px-3 py-2 rounded-xl bg-neutral-200 hover:bg-rose-100 hover:text-rose-700 text-neutral-700 font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset DB</span>
                </button>
              </div>
            </div>
          </div>

          {/* SCENARIO PRESETS */}
          <div className="space-y-3">
            <span className="font-bold text-neutral-900 block text-xs">
              Demonstration Scenarios (Evaluator Test Suite)
            </span>

            <div className="grid grid-cols-1 gap-2.5">
              {scenarios.map(sc => {
                const Icon = sc.icon;
                const isSelected = activeScenario === sc.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => handleApplyScenario(sc.id, sc.name)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                        : 'bg-white hover:bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                          {sc.name}
                        </h4>
                        <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          {sc.desc}
                        </p>
                      </div>
                    </div>

                    <button
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-white text-neutral-900'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Apply'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between bg-neutral-50 text-neutral-500 text-[11px]">
          <span>Department of CSE | 22CSE74 Major Project Simulation Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 cursor-pointer"
          >
            Close Sandbox
          </button>
        </div>

      </div>
    </div>
  );
}
