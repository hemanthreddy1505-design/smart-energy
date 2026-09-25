import React, { useState, useRef } from 'react';
import { useVirtualLab } from '../../context/VirtualLabContext';
import {
  GitBranch,
  Zap,
  Activity,
  Power,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  Radio,
  Home,
  Sparkles,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export function ElectricalTopologyView() {
  const {
    transformer,
    distributionBoard,
    livingRoom,
    appliances,
    toggleDevicePower,
    totalActivePower,
    totalCurrent,
    gridVoltage,
    isEngineeringMode,
    setIsEngineeringMode
  } = useVirtualLab();

  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);

  // Default clean linear hierarchical node coordinates
  const [nodePositions, setNodePositions] = useState({
    grid: { x: 70, y: 220 },
    transformer: { x: 230, y: 220 },
    mdb: { x: 390, y: 220 },
    livingRoom: { x: 550, y: 220 },
    // Appliances column (y-spaced cleanly)
    AC001: { x: 740, y: 50 },
    FR001: { x: 740, y: 100 },
    TV001: { x: 740, y: 150 },
    PC001: { x: 740, y: 200 },
    LT001: { x: 740, y: 250 },
    FN001: { x: 740, y: 300 },
    WM001: { x: 740, y: 350 },
    GH001: { x: 740, y: 400 }
  });

  const [draggedNode, setDraggedNode] = useState(null);
  const svgRef = useRef(null);

  const handleMouseDown = (nodeKey, e) => {
    if (!isEngineeringMode) return;
    e.stopPropagation();
    setDraggedNode(nodeKey);
  };

  const handleMouseMove = (e) => {
    if (!draggedNode || !svgRef.current || !isEngineeringMode) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(40, Math.min(880, (e.clientX - rect.left) / zoomLevel));
    const y = Math.max(30, Math.min(460, (e.clientY - rect.top) / zoomLevel));

    setNodePositions(prev => ({
      ...prev,
      [draggedNode]: { x, y }
    }));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const resetTopologyLayout = () => {
    setNodePositions({
      grid: { x: 70, y: 220 },
      transformer: { x: 230, y: 220 },
      mdb: { x: 390, y: 220 },
      livingRoom: { x: 550, y: 220 },
      AC001: { x: 740, y: 50 },
      FR001: { x: 740, y: 100 },
      TV001: { x: 740, y: 150 },
      PC001: { x: 740, y: 200 },
      LT001: { x: 740, y: 250 },
      FN001: { x: 740, y: 300 },
      WM001: { x: 740, y: 350 },
      GH001: { x: 740, y: 400 }
    });
    setZoomLevel(1);
  };

  // Helper for generating smooth bezier curves between coordinates
  const getCurve = (from, to) => {
    const dx = Math.abs(to.x - from.x) * 0.5;
    return `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`;
  };

  return (
    <div className="space-y-6">

      {/* TOP TOPOLOGY HEADER & CONTROLS */}
      <div className="glass-card rounded-[22px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/80 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#00A86B]" />
              Packet-Tracer Electrical Topology Schematic
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E8F8F0] text-[#00A86B] border border-[#00A86B]/20">
              SIMULATED SCHEMATIC
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Single-path routing: Grid → Virtual Transformer → Main Board → Living Room → Connected Appliances
          </p>
        </div>

        {/* Actions & Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
            className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 cursor-pointer shadow-2xs"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
            className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 cursor-pointer shadow-2xs"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetTopologyLayout}
            className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 cursor-pointer shadow-2xs"
            title="Reset Schematic Layout"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsEngineeringMode(!isEngineeringMode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border ${
              isEngineeringMode
                ? 'bg-purple-50 text-purple-700 border-purple-200 font-bold'
                : 'bg-white text-neutral-600 border-neutral-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isEngineeringMode ? 'Drag Nodes ON' : 'Engineering Mode'}</span>
          </button>
        </div>
      </div>

      {/* INTERACTIVE SVG SCHEMATIC CANVAS */}
      <div className="glass-card rounded-[24px] p-4 border border-white/80 shadow-card bg-[#061C16] relative overflow-hidden">
        
        {/* Schematic Canvas Status Pill */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-xs font-mono text-[#00A86B] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
          <span>Interactive Schematic · Click any appliance to toggle</span>
        </div>

        <svg
          ref={svgRef}
          viewBox="0 0 950 480"
          className="w-full h-[520px] select-none cursor-default"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <defs>
            {/* Animated Electron Dash Line */}
            <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0, 168, 107, 0.08)" strokeWidth="1" />
            </pattern>

            <linearGradient id="activeConduit" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00A86B" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* MAIN TRUNK CONDUITS (CABLES) */}
          
          {/* 1. Grid -> Transformer */}
          <path
            d={getCurve(nodePositions.grid, nodePositions.transformer)}
            fill="none"
            stroke="#00A86B"
            strokeWidth="4"
            filter="url(#glow)"
          />
          <path
            d={getCurve(nodePositions.grid, nodePositions.transformer)}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="animate-pulse"
          />

          {/* 2. Transformer -> MDB */}
          <path
            d={getCurve(nodePositions.transformer, nodePositions.mdb)}
            fill="none"
            stroke="#00A86B"
            strokeWidth="4"
            filter="url(#glow)"
          />
          <path
            d={getCurve(nodePositions.transformer, nodePositions.mdb)}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="animate-pulse"
          />

          {/* 3. MDB -> Living Room */}
          <path
            d={getCurve(nodePositions.mdb, nodePositions.livingRoom)}
            fill="none"
            stroke="#00A86B"
            strokeWidth="4"
            filter="url(#glow)"
          />
          <path
            d={getCurve(nodePositions.mdb, nodePositions.livingRoom)}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="animate-pulse"
          />

          {/* 4. Living Room -> Connected Appliances */}
          {appliances.map(app => {
            const targetPos = nodePositions[app.id] || { x: 740, y: 200 };
            const isActive = app.isOn;

            return (
              <g key={`cable-${app.id}`}>
                <path
                  d={getCurve(nodePositions.livingRoom, targetPos)}
                  fill="none"
                  stroke={isActive ? '#00A86B' : '#1e3a34'}
                  strokeWidth={isActive ? '3' : '1.5'}
                  filter={isActive ? 'url(#glow)' : undefined}
                />
                {isActive && (
                  <path
                    d={getCurve(nodePositions.livingRoom, targetPos)}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}

          {/* TOPOLOGY NODES */}

          {/* NODE 1: Utility Grid */}
          <g
            transform={`translate(${nodePositions.grid.x - 30}, ${nodePositions.grid.y - 30})`}
            onMouseDown={(e) => handleMouseDown('grid', e)}
            className="cursor-move"
          >
            <rect width="60" height="60" rx="14" fill="#0d2e24" stroke="#00A86B" strokeWidth="2" />
            <text x="30" y="28" fill="#00A86B" fontSize="10" fontWeight="bold" textAnchor="middle">GRID</text>
            <text x="30" y="44" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle">230V · 50Hz</text>
          </g>

          {/* NODE 2: Virtual Transformer */}
          <g
            transform={`translate(${nodePositions.transformer.x - 45}, ${nodePositions.transformer.y - 35})`}
            onMouseDown={(e) => handleMouseDown('transformer', e)}
            onClick={() => setSelectedNode('transformer')}
            className="cursor-pointer"
          >
            <rect width="90" height="70" rx="14" fill="#0f382c" stroke={transformer.loadPercentage > 85 ? '#ef4444' : '#00A86B'} strokeWidth="2" />
            <text x="45" y="24" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">TRANSFORMER</text>
            <text x="45" y="40" fill="#00A86B" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {transformer.currentLoadW} W
            </text>
            <text x="45" y="56" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
              {transformer.loadPercentage}% · 10 kVA
            </text>
          </g>

          {/* NODE 3: Main Distribution Board */}
          <g
            transform={`translate(${nodePositions.mdb.x - 45}, ${nodePositions.mdb.y - 35})`}
            onMouseDown={(e) => handleMouseDown('mdb', e)}
            onClick={() => setSelectedNode('mdb')}
            className="cursor-pointer"
          >
            <rect width="90" height="70" rx="14" fill="#0f382c" stroke={distributionBoard.isTripped ? '#ef4444' : '#00A86B'} strokeWidth="2" />
            <text x="45" y="24" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">MAIN BOARD</text>
            <text x="45" y="40" fill="#00A86B" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {distributionBoard.totalCurrent} A
            </text>
            <text x="45" y="56" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
              40A MCB · {distributionBoard.totalActivePower}W
            </text>
          </g>

          {/* NODE 4: Living Room Hub */}
          <g
            transform={`translate(${nodePositions.livingRoom.x - 45}, ${nodePositions.livingRoom.y - 35})`}
            onMouseDown={(e) => handleMouseDown('livingRoom', e)}
            onClick={() => setSelectedNode('livingRoom')}
            className="cursor-pointer"
          >
            <rect width="90" height="70" rx="14" fill="#0a4032" stroke="#00A86B" strokeWidth="2.5" />
            <text x="45" y="24" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">LIVING ROOM</text>
            <text x="45" y="40" fill="#00A86B" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {livingRoom.totalPowerW} W
            </text>
            <text x="45" y="56" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
              {livingRoom.activeAppliancesCount} / {livingRoom.totalAppliancesCount} Active
            </text>
          </g>

          {/* NODES 5: 8 Connected Appliances */}
          {appliances.map(app => {
            const pos = nodePositions[app.id] || { x: 740, y: 200 };
            const isActive = app.isOn;
            const activePower = app.activePowerW || (isActive ? app.ratedPower : 0);
            const currentAmps = app.currentA || (activePower > 0 ? (activePower / gridVoltage).toFixed(2) : '0.00');

            return (
              <g
                key={app.id}
                transform={`translate(${pos.x - 55}, ${pos.y - 20})`}
                onMouseDown={(e) => handleMouseDown(app.id, e)}
                onClick={() => toggleDevicePower(app.id)}
                className="cursor-pointer"
              >
                <rect
                  width="170"
                  height="40"
                  rx="10"
                  fill={isActive ? '#0f382c' : '#0a1a15'}
                  stroke={isActive ? '#00A86B' : '#1e3a34'}
                  strokeWidth={isActive ? '2' : '1'}
                />
                
                {/* Status indicator dot */}
                <circle cx="16" cy="20" r="4" fill={isActive ? '#00A86B' : '#64748b'} className={isActive ? 'animate-pulse' : ''} />
                
                {/* Name */}
                <text x="28" y="18" fill="#ffffff" fontSize="9" fontWeight="bold">
                  {app.name}
                </text>
                
                {/* Power & Current telemetry */}
                <text x="28" y="31" fill={isActive ? '#00A86B' : '#64748b'} fontSize="8" fontFamily="monospace">
                  {isActive ? `${activePower}W · ${currentAmps}A` : 'OFF · Standby'}
                </text>

                {/* ON / OFF Switch Pill */}
                <rect x="125" y="10" width="36" height="20" rx="6" fill={isActive ? '#00A86B' : '#1e293b'} />
                <text x="143" y="24" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                  {isActive ? 'ON' : 'OFF'}
                </text>
              </g>
            );
          })}

        </svg>
      </div>

      {/* NODE INFORMATION DETAILS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Transformer Info */}
        <div className="glass-card rounded-[20px] p-4 border border-white/80 shadow-card">
          <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 mb-2">
            <Radio className="w-3.5 h-3.5 text-[#00A86B]" />
            <span>Virtual Transformer</span>
          </div>
          <div className="space-y-1 text-xs font-mono text-neutral-600">
            <div className="flex justify-between"><span>Voltage:</span><span className="font-bold text-neutral-900">{transformer.outputVoltage} V · 50 Hz</span></div>
            <div className="flex justify-between"><span>Capacity:</span><span className="font-bold text-neutral-900">{transformer.ratedCapacityKva} kVA</span></div>
            <div className="flex justify-between"><span>Current Load:</span><span className="font-bold text-[#00A86B]">{transformer.currentLoadW} W</span></div>
            <div className="flex justify-between"><span>Load %:</span><span className="font-bold text-neutral-900">{transformer.loadPercentage}%</span></div>
          </div>
        </div>

        {/* Main Board Info */}
        <div className="glass-card rounded-[20px] p-4 border border-white/80 shadow-card">
          <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00A86B]" />
            <span>Main Distribution Board</span>
          </div>
          <div className="space-y-1 text-xs font-mono text-neutral-600">
            <div className="flex justify-between"><span>Total Power:</span><span className="font-bold text-[#00A86B]">{distributionBoard.totalActivePower} W</span></div>
            <div className="flex justify-between"><span>Total Current:</span><span className="font-bold text-neutral-900">{distributionBoard.totalCurrent} A</span></div>
            <div className="flex justify-between"><span>Breaker Rating:</span><span className="font-bold text-neutral-900">{distributionBoard.mainBreakerAmps} A MCB</span></div>
            <div className="flex justify-between"><span>Breaker Load:</span><span className="font-bold text-neutral-900">{distributionBoard.loadPercentage}%</span></div>
          </div>
        </div>

        {/* Living Room Info */}
        <div className="glass-card rounded-[20px] p-4 border border-white/80 shadow-card">
          <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 mb-2">
            <Home className="w-3.5 h-3.5 text-[#00A86B]" />
            <span>Living Room Node</span>
          </div>
          <div className="space-y-1 text-xs font-mono text-neutral-600">
            <div className="flex justify-between"><span>Room Power:</span><span className="font-bold text-[#00A86B]">{livingRoom.totalPowerW} W</span></div>
            <div className="flex justify-between"><span>Room Current:</span><span className="font-bold text-neutral-900">{livingRoom.totalCurrentA} A</span></div>
            <div className="flex justify-between"><span>Active Devices:</span><span className="font-bold text-neutral-900">{livingRoom.activeAppliancesCount} / {livingRoom.totalAppliancesCount}</span></div>
            <div className="flex justify-between"><span>Energy Today:</span><span className="font-bold text-neutral-900">{livingRoom.energyConsumedTodayKwh} kWh</span></div>
          </div>
        </div>

        {/* Quick Legend & Help */}
        <div className="glass-card rounded-[20px] p-4 border border-white/80 shadow-card">
          <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 mb-2">
            <Activity className="w-3.5 h-3.5 text-[#00A86B]" />
            <span>Topology Operations</span>
          </div>
          <div className="text-xs text-neutral-500 space-y-1.5">
            <p>• Click any appliance node above to toggle power on the backend.</p>
            <p>• Green glowing conduit indicates active upstream current flow.</p>
            {isEngineeringMode ? (
              <p className="text-purple-600 font-bold">• Engineering Mode: Drag any node to reposition.</p>
            ) : (
              <p className="text-neutral-400">• Enable Engineering Mode above to drag nodes.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
