import React from 'react';
import { useVirtualLab } from '../../../context/VirtualLabContext';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Presentation,
  Zap,
  Box,
  GitBranch,
  Home,
  Sliders,
  Radio
} from 'lucide-react';

export function SimulationControlToolbar() {
  const {
    isSimRunning,
    setIsSimRunning,
    simSpeed,
    setSimSpeed,
    resetSimulation,
    activeStudioTab,
    setActiveStudioTab,
    setIsPresentationModeOpen,
    totalActivePower,
    totalCurrent,
    transformer
  } = useVirtualLab();

  return (
    <div className="glass-card rounded-[20px] p-3 sm:p-4 border border-white/80 shadow-card flex flex-wrap items-center justify-between gap-4">
      
      {/* Studio View Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-neutral-100/90 rounded-2xl">
        <button
          onClick={() => setActiveStudioTab('3d')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeStudioTab === '3d'
              ? 'bg-white text-[#00A86B] shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D Digital Twin</span>
        </button>

        <button
          onClick={() => setActiveStudioTab('topology')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeStudioTab === 'topology'
              ? 'bg-white text-[#00A86B] shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Electrical Topology</span>
        </button>

        <button
          onClick={() => setActiveStudioTab('rooms')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeStudioTab === 'rooms'
              ? 'bg-white text-[#00A86B] shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Room Architect</span>
        </button>
      </div>

      {/* Simulation Play/Pause & Speed Buttons */}
      <div className="flex items-center gap-3">
        
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsSimRunning(!isSimRunning)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
            isSimRunning
              ? 'bg-[#E8F8F0] text-[#00A86B] border border-[#00A86B]/30'
              : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}
        >
          {isSimRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isSimRunning ? 'RUNNING' : 'PAUSED'}</span>
        </button>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100/90 rounded-xl text-xs font-mono">
          {[0.5, 1, 2, 5, 10].map(spd => (
            <button
              key={spd}
              onClick={() => setSimSpeed(spd)}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                simSpeed === spd
                  ? 'bg-white text-[#00A86B] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Reset Button */}
        <button
          onClick={resetSimulation}
          className="p-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200 shadow-xs transition-colors cursor-pointer"
          title="Reset Simulation State"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Presentation Mode Button */}
        <button
          onClick={() => setIsPresentationModeOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00A86B] to-[#059669] hover:from-[#047857] hover:to-[#065f46] text-white text-xs font-bold shadow-emerald-glow transition-all cursor-pointer"
        >
          <Presentation className="w-3.5 h-3.5" />
          <span>Presentation Deck</span>
        </button>

      </div>

    </div>
  );
}
