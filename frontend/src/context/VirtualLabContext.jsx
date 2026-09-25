import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useEnergy } from './EnergyContext';

const VirtualLabContext = createContext(null);

// Coherent 6-Room Virtual Flat Architecture
export const VIRTUAL_FLAT_ROOMS = [
  { id: 'RM_LIVING', name: 'Living Room', width: 6.0, depth: 5.0, color: '#00A86B', position: [0, 0, 0], floorType: 'wood' },
  { id: 'RM_BEDROOM', name: 'Master Bedroom', width: 5.5, depth: 4.5, color: '#3b82f6', position: [6.5, 0, 0], floorType: 'carpet' },
  { id: 'RM_KITCHEN', name: 'Kitchen', width: 4.5, depth: 4.0, color: '#f59e0b', position: [0, 0, 5.5], floorType: 'tile' },
  { id: 'RM_OFFICE', name: 'Home Office', width: 4.5, depth: 3.5, color: '#8b5cf6', position: [6.5, 0, 5.0], floorType: 'wood' },
  { id: 'RM_UTILITY', name: 'Utility Area', width: 3.5, depth: 3.0, color: '#06b6d4', position: [0, 0, 10.0], floorType: 'slate' },
  { id: 'RM_BATHROOM', name: 'Bathroom', width: 3.5, depth: 2.8, color: '#ec4899', position: [4.0, 0, 9.5], floorType: 'ceramic' }
];

// Room mapping for the 8 authoritative appliances
const APPLIANCE_ROOM_MAP = {
  'TV001': { roomId: 'RM_LIVING', roomName: 'Living Room', position3D: [3.0, 0.9, 0.4] },
  'LT001': { roomId: 'RM_LIVING', roomName: 'Living Room', position3D: [3.0, 2.7, 2.5] },
  'FN001': { roomId: 'RM_LIVING', roomName: 'Living Room', position3D: [3.0, 2.6, 2.5] },
  'AC001': { roomId: 'RM_BEDROOM', roomName: 'Master Bedroom', position3D: [8.5, 2.1, 0.2] },
  'FR001': { roomId: 'RM_KITCHEN', roomName: 'Kitchen', position3D: [1.0, 0.8, 6.8] },
  'PC001': { roomId: 'RM_OFFICE', roomName: 'Home Office', position3D: [8.5, 0.75, 6.5] },
  'WM001': { roomId: 'RM_UTILITY', roomName: 'Utility Area', position3D: [1.2, 0.5, 11.2] },
  'GH001': { roomId: 'RM_BATHROOM', roomName: 'Bathroom', position3D: [5.2, 1.8, 11.2] }
};

export function VirtualLabProvider({ children }) {
  const {
    appliances: globalAppliances,
    telemetry: globalTelemetry,
    toggleAppliance: globalToggleAppliance,
    isPaused,
    speedMultiplier,
    isConnected,
    backendUrl
  } = useEnergy();

  // Studio Navigation & UI Mode
  const [activeStudioTab, setActiveStudioTab] = useState('3d'); // '3d' | 'flow' | 'topology' | 'room'
  const [isEngineeringMode, setIsEngineeringMode] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState('AC001');
  const [isPresentationModeOpen, setIsPresentationModeOpen] = useState(false);
  const [labToast, setLabToast] = useState(null);

  // Authoritative rooms of the Virtual Flat
  const rooms = VIRTUAL_FLAT_ROOMS;

  // Authoritative appliances directly synchronized with backend state
  const appliances = useMemo(() => {
    return (globalAppliances || []).map(app => {
      const roomMapping = APPLIANCE_ROOM_MAP[app.id] || {
        roomId: 'RM_LIVING',
        roomName: 'Living Room',
        position3D: [3.0, 0.8, 2.5]
      };

      const activePower = app.reading?.activePower !== undefined
        ? app.reading.activePower
        : (app.isOn ? (app.ratedPower || 100) : 0);

      const current = app.reading?.current !== undefined
        ? app.reading.current
        : (activePower > 0 ? Number((activePower / (globalTelemetry.gridVoltage || 230)).toFixed(2)) : 0);

      const energyKwh = app.reading?.cumulativeEnergyKwh !== undefined
        ? app.reading.cumulativeEnergyKwh
        : (app.total_energy_kwh || 0);

      return {
        ...app,
        roomId: roomMapping.roomId,
        roomName: roomMapping.roomName,
        location: roomMapping.roomName,
        position3D: roomMapping.position3D,
        activePowerW: activePower,
        currentA: current,
        cumulativeEnergyKwh: energyKwh
      };
    });
  }, [globalAppliances, globalTelemetry.gridVoltage]);

  // Selected Entity for inspection
  const selectedEntity = useMemo(() => {
    return appliances.find(a => a.id === selectedEntityId) || appliances[0] || null;
  }, [appliances, selectedEntityId]);

  // Authoritative Transformer Model (10 kVA, 11kV -> 230V, 50Hz)
  const transformer = useMemo(() => {
    if (globalTelemetry.transformer) return globalTelemetry.transformer;

    const totalActivePower = globalTelemetry.totalActivePower || 0;
    const totalCurrent = globalTelemetry.totalCurrent || 0;
    const gridVoltage = globalTelemetry.gridVoltage || 230;
    const apparentPower = gridVoltage * totalCurrent;
    const loadPct = Number(((apparentPower / 10000) * 100).toFixed(1));

    return {
      id: 'TR001',
      name: 'Virtual Substation Transformer',
      type: 'transformer',
      inputVoltage: 11000,
      outputVoltage: gridVoltage,
      frequencyHz: 50,
      ratedCapacityKva: 10.0,
      efficiencyPct: 98.6,
      currentLoadW: totalActivePower,
      currentLoadVa: Number(apparentPower.toFixed(1)),
      loadPercentage: loadPct,
      status: loadPct > 90 ? 'OVERLOAD' : (loadPct > 70 ? 'HIGH' : 'NORMAL')
    };
  }, [globalTelemetry]);

  // Authoritative Main Distribution Board (40A rated breaker)
  const distributionBoard = useMemo(() => {
    if (globalTelemetry.distributionBoard) return globalTelemetry.distributionBoard;

    const totalActivePower = globalTelemetry.totalActivePower || 0;
    const totalCurrent = globalTelemetry.totalCurrent || 0;
    const gridVoltage = globalTelemetry.gridVoltage || 230;
    const loadPct = Number(((totalCurrent / 40) * 100).toFixed(1));

    return {
      id: 'MDB001',
      name: 'Main Distribution Board',
      type: 'distribution_board',
      mainBreakerAmps: 40,
      voltage: gridVoltage,
      totalActivePower,
      totalCurrent,
      loadPercentage: loadPct,
      isTripped: totalCurrent > 40,
      status: totalCurrent > 40 ? 'TRIPPED' : (loadPct > 80 ? 'WARNING' : 'NORMAL')
    };
  }, [globalTelemetry]);

  // Authoritative Living Room State
  const livingRoom = useMemo(() => {
    if (globalTelemetry.livingRoom) return globalTelemetry.livingRoom;

    return {
      id: 'RM_LIVING',
      name: 'Living Room',
      totalPowerW: globalTelemetry.totalActivePower || 0,
      totalCurrentA: globalTelemetry.totalCurrent || 0,
      activeAppliancesCount: appliances.filter(a => a.isOn).length,
      totalAppliancesCount: appliances.length,
      energyConsumedTodayKwh: globalTelemetry.totalEnergyTodayKwh || 0,
      voltage: globalTelemetry.gridVoltage || 230,
      appliances
    };
  }, [globalTelemetry, appliances]);

  // Appliance readings map
  const applianceReadings = useMemo(() => {
    const map = {};
    appliances.forEach(a => {
      map[a.id] = {
        activePower: a.activePowerW,
        current: a.currentA,
        voltage: globalTelemetry.gridVoltage || 230,
        powerFactor: a.powerFactor || 0.9,
        cumulativeEnergyKwh: a.cumulativeEnergyKwh,
        isOn: a.isOn,
        status: a.isOn ? 'ON' : 'OFF'
      };
    });
    return map;
  }, [appliances, globalTelemetry.gridVoltage]);

  // Action: Toggle Device Power (instantly propagates to backend and all pages)
  const toggleDevicePower = useCallback((deviceId, forceState) => {
    if (globalToggleAppliance) {
      globalToggleAppliance(deviceId, forceState);
    }
  }, [globalToggleAppliance]);

  // Action: Master Room Power Cutoff Switch
  const toggleLivingRoomPower = useCallback((forceState) => {
    const anyOn = appliances.some(a => a.isOn);
    const targetState = forceState !== undefined ? forceState : !anyOn;

    appliances.forEach(a => {
      if (globalToggleAppliance) {
        globalToggleAppliance(a.id, targetState);
      }
    });

    setLabToast(`Virtual Flat power switched ${targetState ? 'ON' : 'OFF'} for all devices`);
    setTimeout(() => setLabToast(null), 3000);
  }, [appliances, globalToggleAppliance]);

  // Action: Simulation Control (Start, Pause, Reset, Speed)
  const toggleSimulation = useCallback(async () => {
    const endpoint = isPaused ? '/api/simulation/start' : '/api/simulation/pause';
    try {
      await fetch(`${backendUrl}${endpoint}`, { method: 'POST' });
    } catch (e) {
      console.warn('Simulation toggle error:', e.message);
    }
  }, [isPaused, backendUrl]);

  const resetSimulation = useCallback(async () => {
    try {
      await fetch(`${backendUrl}/api/simulation/reset`, { method: 'POST' });
      setLabToast('Virtual Energy Simulation counters and energy accumulators reset.');
      setTimeout(() => setLabToast(null), 3000);
    } catch (e) {
      console.warn('Simulation reset error:', e.message);
    }
  }, [backendUrl]);

  const changeSpeed = useCallback(async (speed) => {
    try {
      await fetch(`${backendUrl}/api/simulation/speed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed })
      });
    } catch (e) {
      console.warn('Simulation speed change error:', e.message);
    }
  }, [backendUrl]);

  const value = {
    // Authoritative Virtual Flat Data
    transformer,
    distributionBoard,
    livingRoom,
    rooms,
    appliances,
    applianceReadings,
    totalActivePower: globalTelemetry.totalActivePower || 0,
    totalCurrent: globalTelemetry.totalCurrent || 0,
    gridVoltage: globalTelemetry.gridVoltage || 230,
    totalEnergyTodayKwh: globalTelemetry.totalEnergyTodayKwh || 0,
    isConnected,

    // Controls & State
    isSimRunning: !isPaused,
    simSpeed: speedMultiplier || 1,
    isEngineeringMode,
    setIsEngineeringMode,
    activeStudioTab,
    setActiveStudioTab,
    selectedEntity,
    selectedEntityId,
    setSelectedEntityId,
    isPresentationModeOpen,
    setIsPresentationModeOpen,
    labToast,
    setLabToast,

    // Actions
    toggleDevicePower,
    toggleLivingRoomPower,
    toggleSimulation,
    resetSimulation,
    changeSpeed
  };

  return (
    <VirtualLabContext.Provider value={value}>
      {children}
    </VirtualLabContext.Provider>
  );
}

export function useVirtualLab() {
  const context = useContext(VirtualLabContext);
  if (!context) {
    throw new Error('useVirtualLab must be used within a VirtualLabProvider');
  }
  return context;
}
