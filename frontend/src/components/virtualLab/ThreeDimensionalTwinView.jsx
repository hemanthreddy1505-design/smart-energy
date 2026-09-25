import React, { useEffect, useRef, useState } from 'react';
import { useVirtualLab } from '../../context/VirtualLabContext';
import { BuildingScene } from './three/BuildingScene';
import {
  Box,
  RotateCcw,
  Maximize2,
  Minimize2,
  Power,
  Zap,
  Activity,
  Gauge,
  Sliders,
  Eye,
  CheckCircle2,
  Radio,
  Layers,
  Sparkles,
  Focus,
  IndianRupee,
  Home
} from 'lucide-react';

export function ThreeDimensionalTwinView() {
  const containerRef = useRef(null);
  const sceneInstanceRef = useRef(null);
  const [selectedPreset, setSelectedPreset] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    rooms,
    appliances,
    transformer,
    distributionBoard,
    toggleDevicePower,
    selectedEntity,
    setSelectedEntityId,
    applianceReadings,
    totalActivePower,
    totalCurrent,
    gridVoltage
  } = useVirtualLab();

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new BuildingScene(containerRef.current, {
      onDeviceClick: (deviceId) => {
        setSelectedEntityId(deviceId);
        toggleDevicePower(deviceId);
      }
    });

    sceneInstanceRef.current = scene;

    const handleResize = () => {
      if (containerRef.current && sceneInstanceRef.current) {
        sceneInstanceRef.current.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      sceneInstanceRef.current = null;
    };
  }, []);

  // Update 3D elements whenever rooms or appliances change
  useEffect(() => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.updateBuilding(rooms, appliances, transformer, distributionBoard);
    }
  }, [rooms, appliances, transformer, distributionBoard]);

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.setCameraPreset(preset);
    }
  };

  const handleFocusDevice = (device) => {
    if (!device) return;
    const roomMap = {
      'TV001': 'living',
      'LT001': 'living',
      'FN001': 'living',
      'AC001': 'bedroom',
      'FR001': 'kitchen',
      'PC001': 'office',
      'WM001': 'utility',
      'GH001': 'bathroom'
    };
    handlePresetChange(roomMap[device.id] || 'all');
  };

  const selectedReading = selectedEntity ? applianceReadings[selectedEntity.id] : null;

  return (
    <div className={`relative w-full rounded-[24px] overflow-hidden border border-white/10 bg-[#061C16] shadow-2xl flex flex-col ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[640px] lg:h-[720px]'
    }`}>
      
      {/* 3D CANVAS HEADER HUD */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: Status & Telemetry Pill */}
        <div className="flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-lg text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#19C37D] animate-pulse" />
          <span className="text-[10px] font-bold text-[#19C37D] uppercase tracking-wider bg-[#00A86B]/20 px-2 py-0.5 rounded-full border border-[#00A86B]/30">
            SIMULATED 3D FLAT
          </span>
          <span className="text-white font-bold ml-1">
            {(totalActivePower / 1000).toFixed(2)} kW
          </span>
          <span className="text-neutral-400">
            ({totalCurrent.toFixed(1)} A @ {gridVoltage.toFixed(0)} V)
          </span>
        </div>

        {/* Center: Camera Preset Buttons for all 6 rooms + Whole Flat */}
        <div className="flex flex-wrap items-center gap-1 pointer-events-auto bg-black/60 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-lg text-xs">
          {[
            { id: 'all', label: 'Whole Flat' },
            { id: 'living', label: 'Living' },
            { id: 'bedroom', label: 'Bedroom' },
            { id: 'kitchen', label: 'Kitchen' },
            { id: 'office', label: 'Office' },
            { id: 'utility', label: 'Utility' },
            { id: 'bathroom', label: 'Bath' },
            { id: 'transformer', label: 'Yard' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => handlePresetChange(p.id)}
              className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedPreset === p.id
                  ? 'bg-gradient-to-r from-[#00A86B] to-[#059669] text-white shadow-xs'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Right: Controls & Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => handlePresetChange('all')}
            className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md text-neutral-300 hover:text-white border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            title="Reset Camera to Whole Flat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md text-neutral-300 hover:text-white border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D Studio'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* 3D WEBGL CANVAS HOLDER */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* FLOATING SELECTED APPLIANCE HUD OVERLAY (BOTTOM LEFT) */}
      {selectedEntity && (
        <div className="absolute bottom-4 left-4 z-20 w-84 bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/15 shadow-2xl text-white animate-fade-in pointer-events-auto">
          <div className="flex items-start justify-between pb-2.5 border-b border-white/10 mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm text-white">{selectedEntity.name}</h4>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  selectedEntity.isOn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-700 text-neutral-400'
                }`}>
                  {selectedEntity.isOn ? 'ENERGIZED' : 'OFF'}
                </span>
              </div>
              <span className="text-[11px] text-[#19C37D] font-mono flex items-center gap-1 mt-0.5">
                <Home className="w-3 h-3" />
                {selectedEntity.roomName || 'Virtual Flat'} · Rated {selectedEntity.ratedPower}W
              </span>
            </div>
            
            {/* Action Buttons: Toggle Power & Focus Camera */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleFocusDevice(selectedEntity)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Focus Camera on Room"
              >
                <Focus className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleDevicePower(selectedEntity.id)}
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  selectedEntity.isOn
                    ? 'bg-gradient-to-r from-[#00A86B] to-[#059669] text-white shadow-emerald-glow'
                    : 'bg-white/10 text-neutral-400 hover:bg-white/20'
                }`}
                title={selectedEntity.isOn ? 'Switch OFF' : 'Switch ON'}
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real-time Telemetry Grid */}
          <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] text-neutral-400 block font-sans">LOAD</span>
              <span className="font-bold text-white text-[11px]">
                {selectedEntity.isOn ? (selectedReading?.activePower || selectedEntity.ratedPower) : 0} W
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] text-neutral-400 block font-sans">CURRENT</span>
              <span className="font-bold text-[#19C37D] text-[11px]">
                {selectedEntity.isOn ? (selectedReading?.current || (selectedEntity.ratedPower / 230).toFixed(1)) : '0.0'} A
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] text-neutral-400 block font-sans">VOLTAGE</span>
              <span className="font-bold text-neutral-300 text-[11px]">
                {gridVoltage.toFixed(0)} V
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] text-neutral-400 block font-sans">TODAY</span>
              <span className="font-bold text-amber-400 text-[11px]">
                {selectedReading?.cumulativeEnergyKwh ? selectedReading.cumulativeEnergyKwh.toFixed(2) : '0.00'}k
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER HELPER TIPS (BOTTOM RIGHT) */}
      <div className="absolute bottom-4 right-4 z-20 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-[10px] text-neutral-300 font-mono flex items-center gap-3 pointer-events-none">
        <span>🖱 Drag: Orbit</span>
        <span>•</span>
        <span>🔍 Scroll: Zoom</span>
        <span>•</span>
        <span>⚡ Click Appliance: Toggle Power</span>
      </div>

    </div>
  );
}
