import React from 'react';
import { useVirtualLab } from '../../../context/VirtualLabContext';
import {
  Sliders,
  Power,
  Trash2,
  Zap,
  Activity,
  Gauge,
  Layers,
  MapPin,
  Cpu,
  RotateCcw
} from 'lucide-react';

export function PropertiesInspector() {
  const {
    selectedEntity,
    toggleDevicePower,
    updateDeviceProperties,
    removeAppliance,
    applianceReadings,
    rooms,
    circuits,
    gridVoltage
  } = useVirtualLab();

  if (!selectedEntity) {
    return (
      <div className="w-80 bg-white/90 backdrop-blur-md rounded-[20px] p-5 border border-white/80 shadow-card flex flex-col items-center justify-center text-center shrink-0 h-full">
        <Sliders className="w-8 h-8 text-neutral-300 mb-2" />
        <h4 className="font-bold text-xs text-neutral-700">Properties Inspector</h4>
        <p className="text-[11px] text-neutral-400 mt-1 max-w-[200px]">
          Click any appliance or infrastructure node in 3D or Topology to inspect its live electrical properties.
        </p>
      </div>
    );
  }

  const reading = applianceReadings[selectedEntity.id] || {
    activePower: selectedEntity.isOn ? selectedEntity.ratedPower : 0,
    current: selectedEntity.isOn ? Number((selectedEntity.ratedPower / 230).toFixed(2)) : 0,
    powerFactor: selectedEntity.powerFactor || 0.95,
    apparentPower: selectedEntity.isOn ? Math.round(selectedEntity.ratedPower / 0.95) : 0,
    voltage: gridVoltage
  };

  return (
    <div className="w-80 bg-white/90 backdrop-blur-md rounded-[20px] p-4 sm:p-5 border border-white/80 shadow-card flex flex-col justify-between shrink-0 h-full overflow-hidden">
      <div className="overflow-y-auto pr-1 space-y-4">
        
        {/* Header & Power Toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#00A86B] bg-[#E8F8F0] px-2 py-0.5 rounded-full border border-[#00A86B]/20">
              VIRTUAL SMART LOAD
            </span>
            <h3 className="font-bold text-sm text-neutral-900 mt-1 truncate max-w-[180px]">
              {selectedEntity.name}
            </h3>
            <span className="text-[10px] text-neutral-400 font-mono">
              ID: {selectedEntity.id}
            </span>
          </div>

          <button
            onClick={() => toggleDevicePower(selectedEntity.id)}
            className={`p-2.5 rounded-2xl transition-all cursor-pointer shadow-xs ${
              selectedEntity.isOn
                ? 'bg-[#00A86B] text-white shadow-emerald-glow'
                : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
            }`}
            title={selectedEntity.isOn ? 'Switch OFF' : 'Switch ON'}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>

        {/* Live Electrical Telemetry Matrix */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
            Instantaneous Telemetry
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[9px] text-neutral-400 block font-sans">ACTIVE POWER (P)</span>
              <span className="font-extrabold text-neutral-900 text-sm">
                {selectedEntity.isOn ? reading.activePower : 0} W
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[9px] text-neutral-400 block font-sans">CURRENT (I)</span>
              <span className="font-extrabold text-[#00A86B] text-sm">
                {selectedEntity.isOn ? reading.current : '0.0'} A
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[9px] text-neutral-400 block font-sans">VOLTAGE (V)</span>
              <span className="font-bold text-neutral-800">
                {reading.voltage.toFixed(1)} V
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[9px] text-neutral-400 block font-sans">POWER FACTOR</span>
              <span className="font-bold text-neutral-800">
                {reading.powerFactor.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Slider Parameter Tuning */}
        <div className="space-y-3 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Load Tuning Controls
          </span>

          {/* Rated Power Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-neutral-600 font-medium">Rated Power</span>
              <span className="font-mono font-bold text-neutral-900">{selectedEntity.ratedPower} W</span>
            </div>
            <input
              type="range"
              min="10"
              max="3500"
              step="10"
              value={selectedEntity.ratedPower || 100}
              onChange={(e) => updateDeviceProperties(selectedEntity.id, { ratedPower: Number(e.target.value) })}
              className="w-full accent-[#00A86B] cursor-pointer"
            />
          </div>

          {/* Power Factor Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-neutral-600 font-medium">Power Factor (cos φ)</span>
              <span className="font-mono font-bold text-neutral-900">{(selectedEntity.powerFactor || 0.92).toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.65"
              max="1.0"
              step="0.01"
              value={selectedEntity.powerFactor || 0.92}
              onChange={(e) => updateDeviceProperties(selectedEntity.id, { powerFactor: Number(e.target.value) })}
              className="w-full accent-[#00A86B] cursor-pointer"
            />
          </div>
        </div>

        {/* Room and Circuit Assignment Dropdowns */}
        <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs">
          <div>
            <label className="font-bold text-neutral-600 block mb-1">Assigned Room</label>
            <select
              value={selectedEntity.roomId}
              onChange={(e) => updateDeviceProperties(selectedEntity.id, { roomId: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200 focus:outline-none"
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-neutral-600 block mb-1">Branch Circuit</label>
            <select
              value={selectedEntity.circuitId}
              onChange={(e) => updateDeviceProperties(selectedEntity.id, { circuitId: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200 focus:outline-none"
            >
              {circuits.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.id} · {c.ratedAmps}A)</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Delete Device Action */}
      <div className="pt-3 border-t border-neutral-100">
        <button
          onClick={() => removeAppliance(selectedEntity.id)}
          className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Device</span>
        </button>
      </div>

    </div>
  );
}
