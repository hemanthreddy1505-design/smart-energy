import React from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { 
  Zap, 
  Wifi, 
  Cpu, 
  BookOpen, 
  LayoutDashboard, 
  Sliders, 
  BarChart3, 
  Bell, 
  CalendarClock,
  Radio
} from 'lucide-react';

export function Header({ onOpenAcademicModal }) {
  const { isConnected, gatewayStatus, activeTab, setActiveTab, alerts, telemetry } = useEnergy();

  const unreadAlerts = alerts.filter(a => !a.is_resolved).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appliances', label: 'Appliances', icon: Sliders },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadAlerts },
    { id: 'schedules', label: 'Schedules', icon: CalendarClock },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <Zap className="w-6 h-6 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Smart Energy Conservation
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ENVIRONMENTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                IoT Edge Energy Sensing & Conservation System (Software Simulation)
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-slate-950 text-emerald-400' : 'bg-rose-500 text-white animate-pulse'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Tools & Gateway Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* IoT Edge Gateway Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isConnected ? 'bg-emerald-400' : 'bg-rose-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}></span>
              </span>
              <div className="flex flex-col text-[11px]">
                <span className="font-mono font-medium text-slate-200 leading-tight">
                  {gatewayStatus?.deviceId || 'ESP32-SIM-001'}
                </span>
                <span className="text-[9px] text-slate-400 flex items-center gap-1">
                  <Wifi className="w-2.5 h-2.5 text-emerald-400" />
                  {isConnected ? (gatewayStatus?.wifiRssi || '-62 dBm') : 'OFFLINE'}
                </span>
              </div>
            </div>

            {/* Academic Hardware vs Software Mapping Guide Button */}
            <button
              onClick={onOpenAcademicModal}
              title="View Academic Hardware vs Software Simulation Mapping"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Project Guide</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
