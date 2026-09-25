import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const EnergyContext = createContext(null);

const INITIAL_CLIENT_APPLIANCES = [
  { id: 'AC001', name: 'Air Conditioner', type: 'HVAC', location: 'Living Room', ratedPower: 1500, isOn: true, powerFactor: 0.92, reading: { activePower: 1250, current: 5.9, cumulativeEnergyKwh: 4.35 } },
  { id: 'FR001', name: 'Refrigerator', type: 'Cold Storage', location: 'Living Room', ratedPower: 180, isOn: true, powerFactor: 0.85, reading: { activePower: 165, current: 0.84, cumulativeEnergyKwh: 1.82 } },
  { id: 'TV001', name: 'Smart Television', type: 'Entertainment', location: 'Living Room', ratedPower: 120, isOn: true, powerFactor: 0.95, reading: { activePower: 110, current: 0.5, cumulativeEnergyKwh: 0.68 } },
  { id: 'PC001', name: 'Workstation PC', type: 'Computing', location: 'Living Room', ratedPower: 200, isOn: true, powerFactor: 0.98, reading: { activePower: 185, current: 0.82, cumulativeEnergyKwh: 1.45 } },
  { id: 'LT001', name: 'Living Room Lighting', type: 'Lighting', location: 'Living Room', ratedPower: 18, isOn: true, powerFactor: 0.90, reading: { activePower: 18, current: 0.09, cumulativeEnergyKwh: 0.16 } },
  { id: 'FN001', name: 'Ceiling Fan', type: 'Ventilation', location: 'Living Room', ratedPower: 65, isOn: true, powerFactor: 0.88, reading: { activePower: 58, current: 0.29, cumulativeEnergyKwh: 0.42 } },
  { id: 'WM001', name: 'Washing Machine', type: 'Heavy Appliance', location: 'Living Room', ratedPower: 450, isOn: false, powerFactor: 0.82, reading: { activePower: 0, current: 0.0, cumulativeEnergyKwh: 0.85 } },
  { id: 'GH001', name: 'Water Heater / Geyser', type: 'Heavy Appliance', location: 'Living Room', ratedPower: 2200, isOn: false, powerFactor: 1.00, reading: { activePower: 0, current: 0.0, cumulativeEnergyKwh: 2.10 } }
];

export function EnergyProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'live' | 'devices' | 'analytics' | 'automations' | 'alerts' | 'reports' | 'network' | 'config'

  // Real-time telemetry state
  const [telemetry, setTelemetry] = useState({
    deviceId: 'ESP32-SIM-001',
    gridVoltage: 230.0,
    totalActivePower: 1786.0,
    totalCurrent: 8.16,
    systemPowerFactor: 0.95,
    totalEnergyTodayKwh: 11.83,
    estimatedCost: 94.64,
    carbonKg: 9.70,
    isPeakHour: false,
    tariffRate: 8.0,
    speedMultiplier: 1,
  });

  const [appliances, setAppliances] = useState(INITIAL_CLIENT_APPLIANCES);
  const [liveHistory, setLiveHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [rules, setRules] = useState([]);
  const [loadShifting, setLoadShifting] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [costInfo, setCostInfo] = useState(null);
  const [carbonInfo, setCarbonInfo] = useState(null);
  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [toastAlert, setToastAlert] = useState(null);
  const [selectedDeviceForDetail, setSelectedDeviceForDetail] = useState(null);

  // Local User Authentication & Profile state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_energy_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [allUsers, setAllUsers] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'

  // Determine backend URL dynamically
  const getBackendUrl = () => {
    if (import.meta.env.VITE_BACKEND_URL) {
      return import.meta.env.VITE_BACKEND_URL;
    }
    const host = window.location.hostname;
    if (window.location.port === '3000' || window.location.port === '5173') {
      return `http://${host}:5050`;
    }
    return window.location.origin;
  };

  const backendUrl = getBackendUrl();

  // Socket.IO Connection
  useEffect(() => {
    const s = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    s.on('connect', () => {
      console.log('[Socket.IO] Connected to GridSense Gateway:', s.id);
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      console.warn('[Socket.IO] Disconnected from Gateway');
      setIsConnected(false);
    });

    s.on('init:snapshot', (snapshot) => {
      if (snapshot.appliances) setAppliances(snapshot.appliances);
      if (snapshot.liveHistory) setLiveHistory(snapshot.liveHistory);
      if (snapshot.recommendations) setRecommendations(snapshot.recommendations);
      if (snapshot.recentAlerts) setAlerts(snapshot.recentAlerts);
      if (snapshot.esp32) setGatewayStatus(snapshot.esp32);
      if (snapshot.speedMultiplier) setSpeedMultiplier(snapshot.speedMultiplier);
      if (snapshot.isPaused !== undefined) setIsPaused(snapshot.isPaused);
    });

    s.on('telemetry:update', (data) => {
      setTelemetry(prev => ({
        ...prev,
        ...data
      }));

      if (data.appliances) {
        setAppliances(data.appliances);
        // Keep selected device updated in drawer
        setSelectedDeviceForDetail(prev => prev ? data.appliances.find(a => a.id === prev.id) || prev : null);
      }

      const timeLabel = new Date(data.timestamp).toLocaleTimeString('en-US', { hour12: false });
      setLiveHistory(prev => {
        const next = [...prev, {
          time: timeLabel,
          totalPower: data.totalActivePower,
          voltage: data.gridVoltage,
          current: data.totalCurrent,
          pf: data.systemPowerFactor,
          cost: data.estimatedCost
        }];
        return next.length > 30 ? next.slice(next.length - 30) : next;
      });
    });

    s.on('appliance:state_changed', (updatedApp) => {
      setAppliances(prev => prev.map(a => a.id === updatedApp.id ? { ...a, ...updatedApp } : a));
      setSelectedDeviceForDetail(prev => prev && prev.id === updatedApp.id ? { ...prev, ...updatedApp } : prev);
    });

    s.on('alert:new', (alert) => {
      setAlerts(prev => [alert, ...prev]);
      setToastAlert(alert);
      setTimeout(() => setToastAlert(null), 6000);
    });

    s.on('alert:updated', (updatedAlert) => {
      setAlerts(prev => prev.map(a => a.id === updatedAlert.id ? { ...a, ...updatedAlert } : a));
    });

    s.on('recommendations:update', (recs) => {
      setRecommendations(recs);
    });

    s.on('simulation:speed_changed', (newSpeed) => {
      setSpeedMultiplier(newSpeed);
    });

    s.on('simulation:reset_done', () => {
      setLiveHistory([]);
      setAlerts([]);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [backendUrl]);

  // REST API Fetchers
  const fetchNetworkInfo = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/system/network`);
      const data = await res.json();
      if (data.success) setNetworkInfo(data.data);
    } catch (e) {
      console.warn('Network info fetch error:', e.message);
    }
  }, [backendUrl]);

  const fetchGatewayStatus = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/system/gateway`);
      const data = await res.json();
      if (data.success) setGatewayStatus(data.data);
    } catch (e) {
      console.warn('Gateway status fetch error:', e.message);
    }
  }, [backendUrl]);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/schedules`);
      const data = await res.json();
      if (data.success) setSchedules(data.data);
    } catch (e) {
      console.warn('Schedules fetch error:', e.message);
    }
  }, [backendUrl]);

  const fetchScenes = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/schedules/scenes`);
      const data = await res.json();
      if (data.success) setScenes(data.data);
    } catch (e) {
      console.warn('Scenes fetch error:', e.message);
    }
  }, [backendUrl]);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/schedules/rules`);
      const data = await res.json();
      if (data.success) setRules(data.data);
    } catch (e) {
      console.warn('Rules fetch error:', e.message);
    }
  }, [backendUrl]);

  const fetchLoadShifting = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/schedules/load-shifting`);
      const data = await res.json();
      if (data.success) setLoadShifting(data.data);
    } catch (e) {
      console.warn('Load shifting fetch error:', e.message);
    }
  }, [backendUrl]);

  const fetchForecast = useCallback(async () => {
    try {
      const clientHour = new Date().getHours();
      const res = await fetch(`${backendUrl}/api/analytics/forecast?clientHour=${clientHour}`);
      const data = await res.json();
      if (data.success) setForecast(data.data);
    } catch (e) {
      console.warn('Forecast fetch error:', e.message);
    }
  }, [backendUrl]);

  const fetchCostIntelligence = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/analytics/cost-intelligence`);
      const data = await res.json();
      if (data.success) setCostInfo(data.data);
    } catch (e) {
      console.warn('Cost intelligence fetch error:', e.message);
    }
  }, [backendUrl]);

  const fetchCarbonIntelligence = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/analytics/carbon-intelligence`);
      const data = await res.json();
      if (data.success) setCarbonInfo(data.data);
    } catch (e) {
      console.warn('Carbon intelligence fetch error:', e.message);
    }
  }, [backendUrl]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/users`);
      const data = await res.json();
      if (data.success && data.users) {
        setAllUsers(data.users);
        setCurrentUser(prev => {
          if (prev) {
            // Keep current user updated with DB
            const updated = data.users.find(u => u.id === prev.id);
            if (updated) {
              localStorage.setItem('smart_energy_user', JSON.stringify(updated));
              return updated;
            }
          }
          const defaultUser = data.users.find(u => u.id === data.activeUserId) || data.users[0];
          if (defaultUser) {
            localStorage.setItem('smart_energy_user', JSON.stringify(defaultUser));
            return defaultUser;
          }
          return prev;
        });
      }
    } catch (e) {
      console.warn('[EnergyContext] Error loading resident accounts:', e.message);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchUsers();
    fetchNetworkInfo();
    fetchGatewayStatus();
    fetchSchedules();
    fetchScenes();
    fetchRules();
    fetchLoadShifting();
    fetchForecast();
    fetchCostIntelligence();
    fetchCarbonIntelligence();
  }, [
    fetchUsers,
    fetchNetworkInfo,
    fetchGatewayStatus,
    fetchSchedules,
    fetchScenes,
    fetchRules,
    fetchLoadShifting,
    fetchForecast,
    fetchCostIntelligence,
    fetchCarbonIntelligence
  ]);

  // Auth action methods:
  const login = async (email, password) => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }
      setCurrentUser(data.user);
      localStorage.setItem('smart_energy_user', JSON.stringify(data.user));
      fetchUsers();
      setIsAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Signup failed');
      }
      setCurrentUser(data.user);
      localStorage.setItem('smart_energy_user', JSON.stringify(data.user));
      fetchUsers();
      setIsAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const switchUser = async (userId) => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('smart_energy_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
    } catch (e) {
      console.error('Switch user error:', e.message);
    }
    return { success: false };
  };

  const logout = () => {
    localStorage.removeItem('smart_energy_user');
    setCurrentUser(null);
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  // Action methods:
  const toggleAppliance = (id, targetState = null) => {
    const currentApp = appliances.find(a => a.id === id);
    const nextState = targetState !== null ? targetState : (currentApp ? !currentApp.isOn : true);

    setAppliances(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, isOn: nextState };
      }
      return a;
    }));

    if (currentUser?.id) {
      fetch(`${backendUrl}/api/auth/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, applianceId: id, state: nextState })
      }).catch(err => console.warn('Auth toggle sync error:', err.message));
    }

    if (socket && isConnected) {
      socket.emit('appliance:toggle', { id, state: nextState });
    } else {
      fetch(`${backendUrl}/api/appliances/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: nextState })
      });
    }
  };

  const applyScene = async (sceneId) => {
    try {
      const res = await fetch(`${backendUrl}/api/schedules/scenes/${sceneId}/apply`, { method: 'POST' });
      const data = await res.json();
      return data.success;
    } catch (e) {
      console.error('Apply scene error:', e.message);
      return false;
    }
  };

  const applyScenario = async (scenarioName) => {
    try {
      const res = await fetch(`${backendUrl}/api/simulation/scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenarioName })
      });
      const data = await res.json();
      return data.success;
    } catch (e) {
      console.error('Apply scenario error:', e.message);
      return false;
    }
  };

  const updateConfig = async (config) => {
    try {
      const res = await fetch(`${backendUrl}/api/simulation/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        fetchCostIntelligence();
        fetchCarbonIntelligence();
        return true;
      }
    } catch (e) {
      console.error('Update config error:', e.message);
    }
    return false;
  };

  const injectAnomaly = (id = 'AC001', isAnomaly = true) => {
    if (socket && isConnected) {
      socket.emit('simulation:inject_anomaly', { id, isAnomaly });
    } else {
      fetch(`${backendUrl}/api/simulation/anomaly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applianceId: id, isAnomaly })
      });
    }
  };

  const setSimSpeed = (speed) => {
    setSpeedMultiplier(speed);
    if (socket && isConnected) {
      socket.emit('simulation:set_speed', speed);
    } else {
      fetch(`${backendUrl}/api/simulation/speed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed })
      });
    }
  };

  const togglePause = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    fetch(`${backendUrl}/api/simulation/${nextPaused ? 'pause' : 'resume'}`, { method: 'POST' });
  };

  const resetSimulation = () => {
    if (socket && isConnected) {
      socket.emit('simulation:reset');
    } else {
      fetch(`${backendUrl}/api/simulation/reset`, { method: 'POST' });
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await fetch(`${backendUrl}/api/alerts/${alertId}/resolve`, { method: 'POST' });
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_resolved: 1 } : a));
    } catch (e) {
      console.error('Resolve alert error:', e.message);
    }
  };

  const addSchedule = async (scheduleData) => {
    try {
      const res = await fetch(`${backendUrl}/api/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });
      const data = await res.json();
      if (data.success) {
        fetchSchedules();
        return true;
      }
    } catch (e) {
      console.error('Add schedule error:', e.message);
    }
    return false;
  };

  const toggleSchedule = async (id) => {
    try {
      await fetch(`${backendUrl}/api/schedules/${id}/toggle`, { method: 'POST' });
      fetchSchedules();
    } catch (e) {
      console.error('Toggle schedule error:', e.message);
    }
  };

  const deleteSchedule = async (id) => {
    try {
      await fetch(`${backendUrl}/api/schedules/${id}`, { method: 'DELETE' });
      fetchSchedules();
    } catch (e) {
      console.error('Delete schedule error:', e.message);
    }
  };

  const value = {
    backendUrl,
    isConnected,
    activeTab,
    setActiveTab,
    telemetry,
    appliances,
    liveHistory,
    alerts,
    recommendations,
    schedules,
    scenes,
    rules,
    loadShifting,
    forecast,
    costInfo,
    carbonInfo,
    gatewayStatus,
    networkInfo,
    isPaused,
    speedMultiplier,
    toastAlert,
    setToastAlert,
    selectedDeviceForDetail,
    setSelectedDeviceForDetail,
    toggleAppliance,
    applyScene,
    applyScenario,
    updateConfig,
    injectAnomaly,
    setSimSpeed,
    togglePause,
    resetSimulation,
    resolveAlert,
    addSchedule,
    toggleSchedule,
    currentUser,
    allUsers,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    signup,
    switchUser,
    logout,
    refreshUsers: fetchUsers,
    refreshSchedules: fetchSchedules,
    refreshForecast: fetchForecast,
    refreshCostIntelligence: fetchCostIntelligence
  };

  return (
    <EnergyContext.Provider value={value}>
      {children}
    </EnergyContext.Provider>
  );
}

export function useEnergy() {
  const ctx = useContext(EnergyContext);
  if (!ctx) {
    throw new Error('useEnergy must be used within an EnergyProvider');
  }
  return ctx;
}
