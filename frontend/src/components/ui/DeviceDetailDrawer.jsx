import React, { useState, useEffect } from 'react';
import { 
  X, 
  Power, 
  Zap, 
  Activity, 
  Clock, 
  ShieldAlert, 
  CalendarClock, 
  CheckCircle2, 
  TrendingUp,
  Cpu
} from 'lucide-react';

export function DeviceDetailDrawer({ device, onClose, onToggle, tariffRate = 8.0, schedules = [] }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'telemetry' | 'energy' | 'events' | 'automation'

  useEffect(() => {
    if (!device) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [device, onClose]);

  if (!device) return null;

  const reading = device.reading || {
    voltage: 230.0,
    current: 0,
    powerFactor: device.powerFactor || 0.95,
    activePower: 0,
    apparentPower: 0,
    reactivePower: 0,
    cumulativeEnergyKwh: 0,
    status: device.isOn ? 'ON' : 'OFF'
  };

  const powerW = device.isOn ? reading.activePower : 0;
  const currentA = device.isOn ? reading.current : 0;
  const energyKwh = reading.cumulativeEnergyKwh || 0;
  const cost = (energyKwh * tariffRate).toFixed(2);
  const carbon = (energyKwh * 0.82).toFixed(2);

  // Filter schedules that target this appliance
  const applianceSchedules = schedules.filter(s => s.appliance_id === device.id);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/40 backdrop-blur-xs flex justify-end animate-fade-in cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200/80 animate-slide-left cursor-default"
      >
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-start justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {device.id.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-neutral-900">{device.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  device.isOn 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {device.isOn ? '● ONLINE' : '○ STANDBY'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                {device.id} · {device.location} · Node: ESP32-SIM-001
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-neutral-100 px-5 gap-1 text-xs font-semibold bg-white overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'telemetry', label: 'Telemetry' },
            { id: 'energy', label: 'Energy' },
            { id: 'events', label: 'Event Log' },
            { id: 'automation', label: 'Automation' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-neutral-900 text-neutral-900 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Quick Power Control Card */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">Power Status</span>
                  <span className="text-sm font-bold text-neutral-900 font-mono">
                    {device.isOn ? 'ON (RUNNING)' : 'OFF (STANDBY)'}
                  </span>
                </div>
                <button
                  onClick={() => onToggle(device.id, !device.isOn)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                    device.isOn 
                      ? 'bg-neutral-900 hover:bg-neutral-800 text-white' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{device.isOn ? 'TURN OFF' : 'TURN ON'}</span>
                </button>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Active Power</span>
                  <span className="text-xl font-bold font-mono text-neutral-900 mt-0.5 block">
                    {Math.round(powerW)} W
                  </span>
                  <span className="text-[11px] text-neutral-500">Rated: {device.ratedPower} W</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Today's Consumption</span>
                  <span className="text-xl font-bold font-mono text-neutral-900 mt-0.5 block">
                    {energyKwh.toFixed(2)} kWh
                  </span>
                  <span className="text-[11px] text-neutral-500">Cost: ₹{cost}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Current Draw</span>
                  <span className="text-xl font-bold font-mono text-neutral-900 mt-0.5 block">
                    {currentA} A
                  </span>
                  <span className="text-[11px] text-neutral-500">Voltage: {reading.voltage} V</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Carbon Equivalent</span>
                  <span className="text-xl font-bold font-mono text-neutral-900 mt-0.5 block">
                    {carbon} kg
                  </span>
                  <span className="text-[11px] text-neutral-500">Factor: 0.82 kg/kWh</span>
                </div>
              </div>

              {/* Metadata */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Appliance Category:</span>
                  <span className="font-semibold text-neutral-800 capitalize">{device.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Location / Room:</span>
                  <span className="font-semibold text-neutral-800">{device.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Operating Power Factor:</span>
                  <span className="font-mono font-semibold text-neutral-800">{device.powerFactor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Normal Range:</span>
                  <span className="font-mono font-semibold text-neutral-800">{device.minPower} W – {device.maxPower} W</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SENSOR TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900 text-white">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Virtual CT Clamp Sensor</span>
                <h4 className="text-base font-bold mt-1">SCT-013 Simulation Channel 01</h4>
                <p className="text-xs text-neutral-400 mt-0.5">ADC 12-bit dual-core sampling at 1000ms intervals</p>
              </div>

              <div className="divide-y divide-neutral-100 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-neutral-500">RMS Grid Voltage (Vrms):</span>
                  <span className="font-mono font-bold text-neutral-900">{reading.voltage} V</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-neutral-500">RMS Current (Irms):</span>
                  <span className="font-mono font-bold text-neutral-900">{currentA} A</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-neutral-500">Active Power (P = V * I * PF):</span>
                  <span className="font-mono font-bold text-emerald-600">{Math.round(powerW)} W</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-neutral-500">Apparent Power (S = V * I):</span>
                  <span className="font-mono font-bold text-neutral-900">
                    {Math.round(device.isOn ? (reading.voltage * currentA) : 0)} VA
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-neutral-500">Reactive Power (Q = √(S² - P²)):</span>
                  <span className="font-mono font-bold text-neutral-900">
                    {Math.round(device.isOn ? Math.sqrt(Math.max(0, Math.pow(reading.voltage * currentA, 2) - Math.pow(powerW, 2))) : 0)} VAR
                  </span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-neutral-500">System Power Factor (cos φ):</span>
                  <span className="font-mono font-bold text-neutral-900">{reading.powerFactor}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ENERGY */}
          {activeTab === 'energy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs">
                <span className="font-bold text-neutral-900 block mb-1">Energy Accounting</span>
                <p className="text-neutral-500">
                  Continuous trapezoidal Riemann sum integration: E(kWh) = Σ (P · Δt) / 3,600,000.
                </p>
                <div className="mt-3 pt-3 border-t border-neutral-200/60 flex justify-between">
                  <span>Cumulative Energy (All-time):</span>
                  <strong className="font-mono text-neutral-900">{energyKwh.toFixed(3)} kWh</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs">
                <span className="font-bold text-neutral-900 block mb-2">Cost Projection</span>
                <div className="space-y-1.5 text-neutral-600">
                  <div className="flex justify-between">
                    <span>Base Tariff Rate:</span>
                    <span className="font-mono">₹{tariffRate.toFixed(2)} / kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Cost Estimate:</span>
                    <span className="font-mono font-semibold text-neutral-900">₹{cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Projected Monthly Run:</span>
                    <span className="font-mono font-semibold text-neutral-900">₹{(cost * 30).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EVENT LOG */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                  <div>
                    <span className="font-semibold text-neutral-900 block">Sensor Reading Updated</span>
                    <span className="text-[11px] text-neutral-500">Live energy data received from sensor</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></div>
                  <div>
                    <span className="font-semibold text-neutral-900 block">Switch Command Processed</span>
                    <span className="text-[11px] text-neutral-500">Appliance power switched to {device.isOn ? 'ON' : 'OFF'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-neutral-400 mt-1 shrink-0"></div>
                  <div>
                    <span className="font-semibold text-neutral-900 block">Data Saved Successfully</span>
                    <span className="text-[11px] text-neutral-500">Latest reading saved to history database</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUTOMATION */}
          {activeTab === 'automation' && (
            <div className="space-y-3">
              {applianceSchedules.length === 0 ? (
                <div className="p-6 text-center bg-neutral-50 border border-neutral-100 rounded-2xl text-xs text-neutral-500">
                  No active schedules currently assigned to {device.name}. You can configure one in the Automations tab.
                </div>
              ) : (
                applianceSchedules.map(s => (
                  <div key={s.id} className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-neutral-900 font-mono block">TURN {s.action} @ {s.time}</span>
                      <span className="text-[11px] text-neutral-500">Schedule #{s.id}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-200 text-neutral-500'
                    }`}>
                      {s.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold cursor-pointer"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
