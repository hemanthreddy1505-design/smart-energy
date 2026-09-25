import React, { useState, useEffect, useRef } from 'react';
import { EnergyProvider, useEnergy } from './context/EnergyContext';
import { VirtualLabProvider, useVirtualLab } from './context/VirtualLabContext';
import { OverviewView } from './components/overview/OverviewView';
import { LiveEnergyView } from './components/live/LiveEnergyView';
import { DevicesView } from './components/devices/DevicesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AutomationsView } from './components/automations/AutomationsView';
import { AlertsView } from './components/alerts/AlertsView';
import { ReportsView } from './components/reports/ReportsView';
import { IoTNetworkView } from './components/network/IoTNetworkView';
import { EnergyConfigView } from './components/config/EnergyConfigView';
import { AcademicMappingModal } from './components/system/AcademicMappingModal';
import { DeviceDetailDrawer } from './components/ui/DeviceDetailDrawer';
import { BottomNav } from './components/common/BottomNav';
import { AuthModal } from './components/auth/AuthModal';

// Virtual Energy Lab Suite Views
import { VirtualEnergyLabView } from './components/virtualLab/VirtualEnergyLabView';
import { VirtualRoomsView } from './components/virtualLab/VirtualRoomsView';
import { ElectricalTopologyView } from './components/virtualLab/ElectricalTopologyView';
import { ThreeDimensionalTwinView } from './components/virtualLab/ThreeDimensionalTwinView';
import { PresentationModeModal } from './components/virtualLab/PresentationModeModal';

import {
  LayoutGrid,
  Activity,
  Cpu,
  BarChart3,
  Sparkles,
  ShieldAlert,
  FileText,
  Radio,
  Settings,
  GraduationCap,
  Search,
  Bell,
  ChevronDown,
  X,
  AlertOctagon,
  Power,
  User,
  UserCheck,
  UserPlus,
  LogOut,
  MapPin,
  Building,
  Zap,
  Wind,
  SunMedium,
  CheckCircle2,
  TreePine,
  Network,
  Home,
  GitBranch,
  Box,
  Presentation
} from 'lucide-react';

function DashboardShell() {
  const { 
    activeTab, 
    setActiveTab, 
    telemetry, 
    appliances,
    schedules,
    alerts, 
    isPaused, 
    togglePause, 
    toastAlert, 
    setToastAlert,
    selectedDeviceForDetail,
    setSelectedDeviceForDetail,
    toggleAppliance,
    currentUser,
    allUsers,
    switchUser,
    logout,
    setIsAuthModalOpen,
    setAuthModalMode
  } = useEnergy();

  const { isPresentationModeOpen, setIsPresentationModeOpen } = useVirtualLab();

  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertsDropdownOpen, setIsAlertsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchRef = useRef(null);
  const alertsRef = useRef(null);
  const profileRef = useRef(null);

  // Global Keyboard shortcuts: ⌘K or Ctrl+K for search
  useEffect(() => {
    function handleGlobalKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (event.key === 'Escape') {
        setIsAlertsDropdownOpen(false);
        setIsProfileDropdownOpen(false);
        setIsSearchOpen(false);
      }
    }

    function handleClickOutside(event) {
      if (alertsRef.current && !alertsRef.current.contains(event.target)) {
        setIsAlertsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const unreadAlerts = alerts.filter(a => !a.is_resolved);

  const getInitials = (name) => {
    if (!name) return 'RE';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Tab Title helper
  const getTabInfo = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'overview':
        return { 
          title: 'Overview', 
          subtitle: 'Real-time energy monitoring and conservation dashboard' 
        };
      case 'virtual-lab':
        return { 
          title: 'Virtual Energy Lab', 
          subtitle: 'Interactive electrical engineering workbench, 3D twin, component library & load simulation' 
        };
      case 'virtual-rooms':
        return { 
          title: 'Virtual Rooms', 
          subtitle: 'Space architecture builder, socket drops & individual room energy meters' 
        };
      case 'electrical-topology':
        return { 
          title: 'Electrical Topology', 
          subtitle: 'Packet-Tracer schematic node graph, current flow animation & breaker trip simulation' 
        };
      case '3d-simulation':
        return { 
          title: '3D Digital Twin Simulation', 
          subtitle: 'Real-time 3D isometric building cutaway with pulsating electrical conduits and raycasting' 
        };
      case 'live':
        return { 
          title: 'Live Energy', 
          subtitle: 'High-frequency CT sensor waveform telemetry & grid harmonics' 
        };
      case 'appliances':
      case 'devices':
        return { 
          title: 'Appliances', 
          subtitle: 'Connected smart loads, rated power benchmarks & relay actuation' 
        };
      case 'analytics':
        return { 
          title: 'Analytics', 
          subtitle: 'Multi-tiered Time-of-Day tariff breakdown & peak load modeling' 
        };
      case 'schedules':
      case 'automations':
        return { 
          title: 'Automations', 
          subtitle: 'Intelligent peak-shifting rules & automated conservation routines' 
        };
      case 'alerts':
        return { 
          title: 'Incidents & Alerts', 
          subtitle: 'Anomaly detection engine, threshold breaches & safety events' 
        };
      case 'reports':
        return { 
          title: 'Audit Reports', 
          subtitle: 'BEE compliance energy audit statements & PDF export' 
        };
      case 'network':
        return { 
          title: 'IoT Gateway', 
          subtitle: 'ESP32 edge topology, Aedes MQTT broker & socket heartbeat' 
        };
      case 'config':
        return { 
          title: 'Configuration', 
          subtitle: 'System parameters, grid tariff slabs & carbon coefficients' 
        };
      default:
        return { 
          title: 'Smart Energy Conservation', 
          subtitle: 'Virtual Energy Laboratory & Digital Twin Platform' 
        };
    }
  };

  const currentTabInfo = getTabInfo();

  return (
    <div className="h-screen w-full bg-[#061C16] flex flex-col md:flex-row overflow-hidden select-none">
      
      {/* Toast Push Notification */}
      {toastAlert && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-rose-200 shadow-2xl text-neutral-900 flex items-start gap-3 animate-slide-in">
          <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 mt-0.5 text-rose-600">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
              ⚠ Anomaly: {toastAlert.applianceName || toastAlert.alertType}
            </span>
            <p className="text-xs text-neutral-600 mt-0.5 leading-snug">
              {toastAlert.message}
            </p>
          </div>
          <button onClick={() => setToastAlert(null)} className="text-neutral-400 hover:text-neutral-700 p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* FIXED DARK EMERALD SIDEBAR (270px Width Desktop Layout) */}
      <aside className="w-full md:w-[270px] md:h-screen md:sticky md:top-0 bg-[#061C16] flex md:flex-col justify-between p-4 shrink-0 border-b md:border-b-0 md:border-r border-white/5 z-20 text-neutral-300 select-none overflow-y-auto sidebar-scroll">
        
        {/* Top: Brand Header + Navigation Items */}
        <div className="flex md:flex-col gap-3 w-full">
          
          {/* Brand Header */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 px-2 py-1 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#00A86B] to-[#047857] flex items-center justify-center text-white shadow-emerald-glow ring-1 ring-white/10 group-hover:scale-105 transition-transform shrink-0">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div className="hidden md:block leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-[15px] tracking-tight">Smart Energy</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#00A86B]/20 text-[#19C37D] border border-[#00A86B]/30">v2.0</span>
              </div>
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#19C37D]/80 block mt-0.5">
                VIRTUAL LABORATORY
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex md:flex-col gap-1 w-full overflow-x-auto md:overflow-visible pt-1">
            
            {/* 1. OPERATIONS GROUP */}
            <div className="hidden md:block text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3 pt-1 pb-1">
              Operations
            </div>

            {/* Overview */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-3 py-2 rounded-[14px] text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'dashboard' || activeTab === 'overview'
                  ? 'text-white bg-gradient-to-r from-[#00A86B] to-[#059669] shadow-emerald-glow'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Overview</span>
            </button>

            {/* Live Energy */}
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-3 px-3 py-2 rounded-[14px] text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'live'
                  ? 'text-white bg-gradient-to-r from-[#00A86B] to-[#059669] shadow-emerald-glow'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Live Energy</span>
            </button>

            {/* Appliances */}
            <button
              onClick={() => setActiveTab('devices')}
              className={`flex items-center justify-between px-3 py-2 rounded-[14px] text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'devices' || activeTab === 'appliances'
                  ? 'text-white bg-gradient-to-r from-[#00A86B] to-[#059669] shadow-emerald-glow'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">Appliances</span>
              </div>
              <span className={`hidden md:inline text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === 'devices' || activeTab === 'appliances'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-neutral-400'
              }`}>
                {appliances.length}
              </span>
            </button>

            {/* Analytics */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-3 px-3 py-2 rounded-[14px] text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'analytics'
                  ? 'text-white bg-gradient-to-r from-[#00A86B] to-[#059669] shadow-emerald-glow'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Analytics</span>
            </button>

            {/* Automations */}
            <button
              onClick={() => setActiveTab('automations')}
              className={`flex items-center gap-3 px-3 py-2 rounded-[14px] text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'automations' || activeTab === 'schedules'
                  ? 'text-white bg-gradient-to-r from-[#00A86B] to-[#059669] shadow-emerald-glow'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Automations</span>
            </button>

            {/* Incidents / Alerts */}
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center justify-between px-3 py-2 rounded-[14px] text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'alerts'
                  ? 'text-white bg-gradient-to-r from-[#00A86B] to-[#059669] shadow-emerald-glow'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">Incidents</span>
              </div>
              {unreadAlerts.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {/* Audit Reports */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-3 px-3 py-2 rounded-[14px] text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'reports'
                  ? 'text-white bg-gradient-to-r from-[#00A86B] to-[#059669] shadow-emerald-glow'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Audit Reports</span>
            </button>

            {/* 2. VIRTUAL LAB GROUP */}
            <div className="hidden md:block text-[10px] font-bold uppercase tracking-wider text-[#19C37D] px-3 pt-2.5 pb-1">
              Virtual Laboratory
            </div>

            {/* Virtual Energy Lab */}
            <button
              onClick={() => setActiveTab('virtual-lab')}
              className={`flex items-center gap-3 px-3 py-2 rounded-[14px] text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'virtual-lab'
                  ? 'text-white bg-gradient-to-r from-[#00A86B] to-[#059669] shadow-emerald-glow'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Network className="w-4 h-4 shrink-0 text-[#19C37D]" />
              <span className="hidden md:inline">Virtual Energy Lab</span>
            </button>

            {/* Virtual Rooms */}
            <button
              onClick={() => setActiveTab('virtual-rooms')}
              className={`flex items-center gap-3 px-3 py-2 rounded-[14px] text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'virtual-rooms'
                  ? 'text-white bg-gradient-to-r from-[#00A86B] to-[#059669] shadow-emerald-glow'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Virtual Rooms</span>
            </button>

            {/* Electrical Topology */}
            <button
              onClick={() => setActiveTab('electrical-topology')}
              className={`flex items-center gap-3 px-3 py-2 rounded-[14px] text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'electrical-topology'
                  ? 'text-white bg-gradient-to-r from-[#00A86B] to-[#059669] shadow-emerald-glow'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <GitBranch className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Electrical Topology</span>
            </button>

            {/* 3D Simulation */}
            <button
              onClick={() => setActiveTab('3d-simulation')}
              className={`flex items-center gap-3 px-3 py-2 rounded-[14px] text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === '3d-simulation'
                  ? 'text-white bg-gradient-to-r from-[#00A86B] to-[#059669] shadow-emerald-glow'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Box className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">3D Energy Simulation</span>
            </button>

            {/* 3. SYSTEM GROUP */}
            <div className="hidden md:block text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3 pt-2.5 pb-1">
              System
            </div>

            {/* IoT Gateway */}
            <button
              onClick={() => setActiveTab('network')}
              className={`flex items-center gap-3 px-3 py-2 rounded-[14px] text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'network'
                  ? 'text-white bg-gradient-to-r from-[#00A86B] to-[#059669] shadow-emerald-glow'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">IoT Gateway</span>
            </button>

            {/* Configuration */}
            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-3 px-3 py-2 rounded-[14px] text-xs font-semibold transition-all cursor-pointer w-full text-left ${
                activeTab === 'config'
                  ? 'text-white bg-gradient-to-r from-[#00A86B] to-[#059669] shadow-emerald-glow'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Configuration</span>
            </button>
          </nav>
        </div>

        {/* Bottom Section: Environmental Conservation Card & Gateway Status */}
        <div className="hidden md:flex flex-col gap-3 pt-3 border-t border-white/5">
          
          {/* Environmental Conservation Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#083327] to-[#052119] border border-[#00A86B]/25 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00A86B]/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[#19C37D]">
                <TreePine className="w-4 h-4" />
                <Wind className="w-3.5 h-3.5 text-emerald-300" />
                <SunMedium className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#19C37D] bg-[#00A86B]/20 px-2 py-0.5 rounded-full border border-[#00A86B]/30">
                ECO ACTIVE
              </span>
            </div>
            <h4 className="text-xs font-bold text-white tracking-tight">
              Energy for a Greener Tomorrow
            </h4>
            <p className="text-[10px] text-emerald-200/70 mt-0.5 leading-snug">
              Monitor · Optimize · Save
            </p>
          </div>

          {/* Gateway Status Badge */}
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#19C37D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#19C37D]"></span>
              </span>
              <span className="text-[11px] font-mono text-neutral-300">ESP32-SIM-001</span>
            </div>
            <span className="text-[10px] font-mono text-[#19C37D] font-bold">50.0 Hz</span>
          </div>

        </div>

      </aside>

      {/* MAIN FLUID LIGHT WORKSPACE */}
      <main className="flex-1 bg-eco-workspace md:m-2.5 md:rounded-canvas p-5 sm:p-7 lg:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto h-[calc(100vh-1rem)] md:h-[calc(100vh-1.25rem)] pb-24 md:pb-8">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-neutral-200/60 gap-4">
          
          {/* Title & Dynamic Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
              {currentTabInfo.title}
            </h1>
            <p className="text-xs text-neutral-500 mt-1 font-medium">
              {currentTabInfo.subtitle}
            </p>
          </div>

          {/* Right Controls Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto">
            
            {/* Presentation Mode Quick Button */}
            <button
              onClick={() => setIsPresentationModeOpen(true)}
              className="h-10 px-3.5 rounded-full bg-gradient-to-r from-[#00A86B] to-[#059669] hover:from-[#047857] hover:to-[#065f46] text-white shadow-emerald-glow flex items-center gap-2 text-xs font-bold transition-all cursor-pointer"
              title="Launch Presentation Deck"
            >
              <Presentation className="w-4 h-4" />
              <span className="hidden md:inline">Presentation Mode</span>
            </button>

            {/* Global Search Button with Keyboard Hint */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="h-10 px-3.5 rounded-full bg-white/90 hover:bg-white border border-neutral-200/80 shadow-xs flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-all cursor-pointer"
                title="Search appliances and meters (Ctrl+K)"
              >
                <Search className="w-4 h-4 text-neutral-400" />
                <span className="text-xs font-medium text-neutral-500 hidden md:inline">Search...</span>
                <kbd className="hidden md:inline-flex items-center text-[10px] font-mono font-semibold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                  ⌘K
                </kbd>
              </button>

              {/* Quick Search Popover */}
              {isSearchOpen && (
                <div className="absolute right-0 top-12 z-30 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-neutral-200 p-3.5 animate-fade-in">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search appliances, meters, IDs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-neutral-100 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 focus:bg-white"
                      autoFocus
                    />
                  </div>
                  {searchQuery && (
                    <div className="mt-2.5 max-h-48 overflow-y-auto space-y-1">
                      {appliances
                        .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(a => (
                          <div
                            key={a.id}
                            onClick={() => {
                              setSelectedDeviceForDetail(a);
                              setIsSearchOpen(false);
                            }}
                            className="p-2.5 rounded-xl hover:bg-[#E8F8F0] text-xs flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div>
                              <span className="font-semibold text-neutral-800 block">{a.name}</span>
                              <span className="text-[10px] text-neutral-400">{a.location}</span>
                            </div>
                            <span className="font-mono text-[10px] font-bold text-[#00A86B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {a.id}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell Button */}
            <div className="relative" ref={alertsRef}>
              <button
                onClick={() => setIsAlertsDropdownOpen(!isAlertsDropdownOpen)}
                className="relative w-10 h-10 rounded-full bg-white/90 hover:bg-white border border-neutral-200/80 shadow-xs flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-all cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadAlerts.length > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-2 right-2 border-2 border-white ring-1 ring-rose-300"></span>
                )}
              </button>

              {/* Alerts Popover */}
              {isAlertsDropdownOpen && (
                <div className="absolute right-0 top-12 z-30 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-neutral-200 p-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 mb-2">
                    <h4 className="text-xs font-bold text-neutral-900">System Alerts</h4>
                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      {unreadAlerts.length} Active
                    </span>
                  </div>
                  {alerts.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-3 text-center">No active alerts.</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                      {alerts.slice(0, 5).map(a => (
                        <div key={a.id} className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-neutral-900">{a.applianceName || a.alertType}</span>
                            <span className="text-[9px] font-bold text-rose-600 uppercase px-1.5 py-0.5 bg-rose-50 rounded">
                              {a.severity}
                            </span>
                          </div>
                          <span className="text-neutral-500 text-[11px] leading-tight block mt-0.5">{a.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => { setActiveTab('alerts'); setIsAlertsDropdownOpen(false); }}
                    className="w-full mt-2.5 py-2 rounded-xl bg-[#E8F8F0] hover:bg-emerald-100 text-[#00A86B] text-center text-xs font-bold transition-colors cursor-pointer"
                  >
                    View All Incidents
                  </button>
                </div>
              )}
            </div>

            {/* Resident Profile Pill */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="bg-white/90 hover:bg-white pl-2 pr-3 py-1.5 rounded-full flex items-center gap-2 cursor-pointer transition-all border border-neutral-200/80 shadow-xs"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00A86B] to-[#19C37D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {getInitials(currentUser?.name)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-neutral-900 leading-tight">
                    {currentUser ? currentUser.name.split(' ')[0] : 'Resident'}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono leading-none">
                    {currentUser ? currentUser.door_no.split(',')[0] : 'Sign In'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-0.5" />
              </button>

              {/* Profile / Resident Menu Popover */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-12 z-30 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-neutral-200 p-3.5 text-xs animate-fade-in">
                  
                  {/* Resident Header Info */}
                  <div className="p-3 bg-gradient-to-br from-[#E8F8F0] to-emerald-50 rounded-xl border border-[#00A86B]/20 mb-3">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#00A86B] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {getInitials(currentUser?.name)}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="font-bold text-neutral-900 text-sm truncate">{currentUser?.name || 'Resident User'}</p>
                        <p className="text-[11px] text-[#00A86B] font-semibold truncate">{currentUser?.door_no}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-[#00A86B]/15 text-[11px]">
                      <div className="flex items-start gap-1.5 text-neutral-600">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-[#00A86B] mt-0.5" />
                        <span className="leading-snug">{currentUser?.address || 'Residential Smart Unit'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-mono text-neutral-500 font-semibold">METER ID:</span>
                        <span className="font-mono text-[10px] font-bold text-[#00A86B] bg-white px-2 py-0.5 rounded border border-[#00A86B]/20">
                          {currentUser?.consumer_id || 'PROVISIONED'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Resident Account */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between px-1 mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                        Switch Resident
                      </span>
                      <button
                        onClick={() => {
                          setAuthModalMode('signup');
                          setIsAuthModalOpen(true);
                          setIsProfileDropdownOpen(false);
                        }}
                        className="text-[11px] font-semibold text-[#00A86B] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3" />
                        New Resident
                      </button>
                    </div>

                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                      {allUsers.map((u) => {
                        const isCurrent = currentUser?.id === u.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUser(u.id);
                              setIsProfileDropdownOpen(false);
                            }}
                            className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-[#E8F8F0] text-[#00A86B] font-bold border border-[#00A86B]/30'
                                : 'hover:bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            <div className="overflow-hidden">
                              <p className="text-xs truncate">{u.name}</p>
                              <p className="text-[10px] text-neutral-400 truncate">{u.door_no}</p>
                            </div>
                            {isCurrent && (
                              <CheckCircle2 className="w-4 h-4 text-[#00A86B] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Auth Actions */}
                  <div className="pt-2 border-t border-neutral-100 space-y-1">
                    <button
                      onClick={() => {
                        setAuthModalMode('login');
                        setIsAuthModalOpen(true);
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-neutral-100 text-neutral-700 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <User className="w-4 h-4 text-[#00A86B]" />
                      Sign In with Another Account
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>

                  {/* Academic Modal Trigger */}
                  <div className="pt-2 border-t border-neutral-100">
                    <button
                      onClick={() => {
                        setIsAcademicModalOpen(true);
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-neutral-100 text-neutral-600 flex items-center gap-2 cursor-pointer text-[11px]"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-[#00A86B]" />
                      Academic Project Details
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Dynamic Canvas Body */}
        <div className="flex-1 w-full">
          {(activeTab === 'dashboard' || activeTab === 'overview') && <OverviewView />}
          {activeTab === 'virtual-lab' && <VirtualEnergyLabView />}
          {activeTab === 'virtual-rooms' && <VirtualRoomsView />}
          {activeTab === 'electrical-topology' && <ElectricalTopologyView />}
          {activeTab === '3d-simulation' && <ThreeDimensionalTwinView />}
          {activeTab === 'live' && <LiveEnergyView />}
          {(activeTab === 'devices' || activeTab === 'appliances') && <DevicesView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {(activeTab === 'automations' || activeTab === 'schedules') && <AutomationsView />}
          {activeTab === 'alerts' && <AlertsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'network' && <IoTNetworkView />}
          {activeTab === 'config' && <EnergyConfigView />}
        </div>

        {/* Presentation Footer */}
        <div className="pt-6 mt-6 border-t border-neutral-200/60 text-[11px] text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Department of CSE | Academic Year 2026-27 | <strong className="text-neutral-700">Smart Energy Conservation Virtual Laboratory</strong>
          </span>
          <span className="font-mono text-neutral-500">
            Simulated Node: ESP32-SIM-001 · 230V Nominal · 10 kVA Virtual Transformer · Aedes MQTT
          </span>
        </div>

      </main>

      {/* System Modals & Drawers */}
      <DeviceDetailDrawer
        device={selectedDeviceForDetail}
        onClose={() => setSelectedDeviceForDetail(null)}
        onToggle={toggleAppliance}
        tariffRate={telemetry.tariffRate}
        schedules={schedules}
      />
      <AcademicMappingModal 
        isOpen={isAcademicModalOpen} 
        onClose={() => setIsAcademicModalOpen(false)} 
      />
      <AuthModal />
      <PresentationModeModal />

      {/* Mobile Bottom Navigation */}
      <BottomNav 
        onOpenAcademic={() => setIsAcademicModalOpen(true)}
      />

    </div>
  );
}

export default function App() {
  return (
    <EnergyProvider>
      <VirtualLabProvider>
        <DashboardShell />
      </VirtualLabProvider>
    </EnergyProvider>
  );
}
