import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  Zap,
  Activity,
  IndianRupee,
  Leaf,
  Gauge,
  Power,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  Wifi,
  ShieldCheck,
  Server,
  Snowflake,
  Monitor,
  Tv,
  Flame,
  Wind,
  Disc,
  Lightbulb,
  Refrigerator,
  ChevronRight,
  Sliders,
  MoreVertical,
  User,
  Building2,
  MapPin,
  Check
} from 'lucide-react';

function getApplianceIcon(app) {
  const id = (app.id || '').toLowerCase();
  const name = (app.name || '').toLowerCase();
  if (id.includes('ac') || name.includes('ac') || name.includes('air')) {
    return <Snowflake className="w-4 h-4 text-sky-600" />;
  }
  if (id.includes('pc') || name.includes('computer') || name.includes('pc')) {
    return <Monitor className="w-4 h-4 text-indigo-600" />;
  }
  if (id.includes('tv') || name.includes('tv') || name.includes('television')) {
    return <Tv className="w-4 h-4 text-purple-600" />;
  }
  if (id.includes('heater') || id.includes('geyser') || name.includes('heater')) {
    return <Flame className="w-4 h-4 text-amber-600" />;
  }
  if (id.includes('fridge') || name.includes('fridge') || name.includes('refrigerator')) {
    return <Refrigerator className="w-4 h-4 text-cyan-600" />;
  }
  if (id.includes('wash') || name.includes('washing')) {
    return <Disc className="w-4 h-4 text-blue-600" />;
  }
  if (id.includes('fan') || name.includes('fan')) {
    return <Wind className="w-4 h-4 text-teal-600" />;
  }
  if (id.includes('light') || name.includes('light')) {
    return <Lightbulb className="w-4 h-4 text-amber-500" />;
  }
  return <Zap className="w-4 h-4 text-[#00A86B]" />;
}

export function OverviewView() {
  const { 
    telemetry, 
    appliances, 
    liveHistory, 
    toggleAppliance, 
    alerts, 
    recommendations,
    costInfo,
    carbonInfo,
    setActiveTab,
    setSelectedDeviceForDetail,
    currentUser,
    setAuthModalMode,
    setIsAuthModalOpen
  } = useEnergy();

  const [timeframe, setTimeframe] = useState('Day'); // 'Day' | 'Week' | 'Month'

  // Active devices sorted by power draw
  const activeAppliances = appliances
    .filter(a => a.isOn)
    .sort((a, b) => ((b.reading?.activePower || 0) - (a.reading?.activePower || 0)));

  // Calculate live average and peak from live history
  const historyPowers = liveHistory.map(h => h.totalPower);
  const peakPowerW = historyPowers.length > 0 ? Math.max(...historyPowers) : telemetry.totalActivePower;
  const avgPowerW = historyPowers.length > 0 
    ? Math.round(historyPowers.reduce((a, b) => a + b, 0) / historyPowers.length) 
    : telemetry.totalActivePower;

  // Chart data
  const chartData = liveHistory.length > 3 
    ? liveHistory 
    : [
        { time: '1', totalPower: 1400 },
        { time: '2', totalPower: 1650 },
        { time: '3', totalPower: 1520 },
        { time: '4', totalPower: 2150 },
        { time: '5', totalPower: 1845 }
      ];

  const unreadAlerts = alerts.filter(a => !a.is_resolved);

  // Peak demand vs sanctioned capacity calculation (5.0 kW)
  const sanctionedLimitKw = 5.0;
  const currentDemandKw = telemetry.totalActivePower / 1000;
  const demandPercent = Math.min(100, Math.round((currentDemandKw / sanctionedLimitKw) * 100));

  return (
    <div className="space-y-6">

      {/* 1. RESIDENT CONTEXT CARD */}
      <div className="glass-card glass-card-hover rounded-[20px] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-white/80 shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00A86B] to-[#19C37D] text-white flex items-center justify-center font-bold text-base shadow-emerald-glow shrink-0">
            {currentUser?.name ? currentUser.name[0] : 'R'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900">
                {currentUser?.name || 'Authorized Resident'}
              </h2>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#E8F8F0] text-[#00A86B] border border-[#00A86B]/20">
                {currentUser?.door_no || 'Flat 402'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                Block B
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#00A86B] border border-emerald-200/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A86B]"></span>
                Resident
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#00A86B]" />
                {currentUser?.address || 'Residential Smart Enclave, Bangalore'}
              </span>
              <span className="hidden sm:inline text-neutral-300">•</span>
              <span className="hidden sm:inline font-mono text-[11px] text-neutral-400">
                Meter ID: {currentUser?.consumer_id || 'IND-BLR-0402'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-neutral-700 block">
              <strong className="text-[#00A86B] font-bold">{activeAppliances.length}</strong> of {appliances.length} online
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              Sensors Synchronized
            </span>
          </div>
          <button
            onClick={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-white hover:bg-[#E8F8F0] text-[#00A86B] border border-neutral-200/80 hover:border-[#00A86B]/40 shadow-xs transition-all cursor-pointer"
          >
            Switch Resident
          </button>
        </div>
      </div>

      {/* 2. 5-COLUMN RESPONSIVE KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* KPI 1: Current Load */}
        <div className="glass-card glass-card-hover rounded-[20px] p-4 flex flex-col justify-between border border-white/80 shadow-card">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Current Load</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-neutral-900 tracking-tight">
                {(telemetry.totalActivePower / 1000).toFixed(2)}
              </span>
              <span className="text-xs font-bold text-neutral-400">kW</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 font-mono pt-2 border-t border-neutral-100">
              <span>{telemetry.totalCurrent.toFixed(1)} A</span>
              <span>@ {telemetry.gridVoltage.toFixed(0)} V</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Today's Energy */}
        <div className="glass-card glass-card-hover rounded-[20px] p-4 flex flex-col justify-between border border-white/80 shadow-card">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Today's Energy</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00A86B]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-neutral-900 tracking-tight">
                {telemetry.totalEnergyTodayKwh.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-neutral-400">kWh</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-100">
              <span>24-hr Aggregated</span>
              <span className="text-[#00A86B] font-bold text-[10px] flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" /> -4.2%
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Today's Cost */}
        <div className="glass-card glass-card-hover rounded-[20px] p-4 flex flex-col justify-between border border-white/80 shadow-card">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Today's Cost</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00A86B]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold font-mono text-neutral-900 tracking-tight">
                ₹{telemetry.estimatedCost.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-100">
              <span>₹{telemetry.tariffRate}/kWh Tier</span>
              <span className="text-[#00A86B] font-bold text-[10px]">Normal</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Carbon Footprint */}
        <div className="glass-card glass-card-hover rounded-[20px] p-4 flex flex-col justify-between border border-white/80 shadow-card">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Carbon Footprint</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#19C37D]">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-neutral-900 tracking-tight">
                {telemetry.carbonKg.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-neutral-400">kg CO₂</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-100">
              <span>CEA Factor 0.82</span>
              <span className="text-[#00A86B] font-bold text-[10px]">Eco Tier</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Peak Demand */}
        <div className="glass-card glass-card-hover rounded-[20px] p-4 flex flex-col justify-between border border-white/80 shadow-card">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Peak Demand</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-neutral-900 tracking-tight">
                {(peakPowerW / 1000).toFixed(2)}
              </span>
              <span className="text-xs font-bold text-neutral-400">kW</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-100">
              <span>Sanctioned: 5.0 kW</span>
              <span className="font-mono font-bold text-neutral-700 text-[10px]">{demandPercent}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. MAIN TWO-COLUMN DASHBOARD GRID (2fr / 1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Live Load Profile & Active Loads (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* LIVE BUILDING LOAD PROFILE CARD */}
          <div className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#00A86B]" />
                  Live Building Load Profile
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Real-time power consumption (Last 24 hours)
                </p>
              </div>

              {/* Timeframe & Sub-metrics */}
              <div className="flex items-center gap-3">
                {/* Timeframe Toggle Buttons */}
                <div className="flex items-center bg-neutral-100/90 p-1 rounded-xl text-xs font-semibold text-neutral-600">
                  {['Day', 'Week', 'Month'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        timeframe === t
                          ? 'bg-white text-[#00A86B] font-bold shadow-xs'
                          : 'hover:text-neutral-900'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics indicator pills bar */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50/50 via-white/80 to-emerald-50/50 border border-emerald-100/60 mb-4">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Current</span>
                <span className="font-extrabold font-mono text-sm text-neutral-900">
                  {(telemetry.totalActivePower / 1000).toFixed(2)} kW
                </span>
              </div>
              <div className="text-center border-x border-emerald-100/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Peak</span>
                <span className="font-extrabold font-mono text-sm text-rose-600">
                  {(peakPowerW / 1000).toFixed(2)} kW
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Average</span>
                <span className="font-extrabold font-mono text-sm text-[#00A86B]">
                  {(avgPowerW / 1000).toFixed(2)} kW
                </span>
              </div>
            </div>

            {/* Smooth Green Area Chart */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emeraldLoadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00A86B" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#00A86B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10, fill: '#9ca3af' }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#9ca3af' }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '1rem', 
                      borderColor: '#d1fae5', 
                      boxShadow: '0 10px 25px rgba(0, 168, 107, 0.1)',
                      fontSize: '12px' 
                    }}
                    formatter={(val) => [`${val} W (${(val / 1000).toFixed(2)} kW)`, 'Active Load']}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalPower"
                    stroke="#00A86B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#emeraldLoadGrad)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ACTIVE LOADS STRIP */}
          <div className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                  <Power className="w-4 h-4 text-[#00A86B]" />
                  Active Loads
                </h3>
                <span className="text-[11px] font-bold text-[#00A86B] bg-[#E8F8F0] px-2 py-0.5 rounded-full border border-[#00A86B]/20">
                  {activeAppliances.length} Active
                </span>
              </div>
              <button 
                onClick={() => setActiveTab('devices')}
                className="text-xs font-bold text-[#00A86B] hover:text-[#047857] flex items-center gap-1 cursor-pointer transition-colors"
              >
                View All ({appliances.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {activeAppliances.slice(0, 5).map((app) => {
                const powerW = app.reading ? Math.round(app.reading.activePower) : 0;
                const currentA = app.reading ? app.reading.current : 0;

                return (
                  <div 
                    key={app.id} 
                    className="p-3 rounded-2xl bg-white/70 hover:bg-[#E8F8F0]/50 border border-neutral-200/70 hover:border-[#00A86B]/30 flex items-center justify-between transition-all group"
                  >
                    <div 
                      onClick={() => setSelectedDeviceForDetail(app)}
                      className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
                    >
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/90 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {getApplianceIcon(app)}
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-xs text-neutral-900 truncate">{app.name}</h4>
                        <span className="text-[11px] text-neutral-400 font-mono block truncate">
                          {app.location} · {app.ratedPower}W rated
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pl-2">
                      <div className="text-right font-mono">
                        <span className="text-xs font-extrabold text-neutral-900 block">{powerW} W</span>
                        <span className="text-[10px] text-neutral-400 block">{currentA} A</span>
                      </div>

                      {/* Preserved interactive toggle button */}
                      <button
                        onClick={() => toggleAppliance(app.id, false)}
                        title="Turn OFF"
                        className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-rose-50 text-neutral-500 hover:text-rose-600 border border-neutral-200/80 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Action Center + Budget + System Health (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* ACTION CENTER */}
          <div className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Action Center
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                unreadAlerts.length > 0 
                  ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                  : 'bg-[#E8F8F0] text-[#00A86B] border border-[#00A86B]/20'
              }`}>
                {unreadAlerts.length > 0 ? `${unreadAlerts.length} Active` : 'Healthy'}
              </span>
            </div>

            <div className="space-y-3">
              {unreadAlerts.length === 0 ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#E8F8F0]/80 to-white border border-[#00A86B]/20 text-center">
                  <div className="w-9 h-9 rounded-full bg-[#00A86B] text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900">All systems running smoothly!</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    No high-priority alerts. Operating within green thresholds.
                  </p>
                </div>
              ) : (
                unreadAlerts.slice(0, 2).map(a => (
                  <div key={a.id} className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs">
                    <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
                      <span>{a.applianceName || a.alertType}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-800 uppercase">
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-neutral-700 text-[11px] leading-snug">{a.message}</p>
                  </div>
                ))
              )}

              {/* Real Energy Conservation Recommendation */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#E8F8F0] via-white to-emerald-50 border border-[#00A86B]/25 text-xs shadow-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#064e3b] mb-1.5">
                  <Sparkles className="w-4 h-4 text-[#00A86B]" />
                  <span>Energy Conservation Recommendation</span>
                </div>
                <p className="text-neutral-700 text-[11px] leading-relaxed">
                  Peak tariff window (18:00 - 22:00) adds 25% surcharge. Shift high-load Water Heater & Geyser cycles to off-peak slots to save <strong className="text-[#00A86B]">₹132/month</strong>.
                </p>
                <button
                  onClick={() => setActiveTab('automations')}
                  className="mt-3 text-xs font-bold text-[#00A86B] hover:text-[#047857] flex items-center gap-1 cursor-pointer transition-all"
                >
                  Configure automated load shift <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* MONTHLY CONSERVATION BUDGET CARD */}
          <div className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Monthly Conservation Budget
              </h3>
              <span className="text-xs font-mono font-extrabold text-neutral-900">
                ₹{telemetry.estimatedCost.toFixed(0)} <span className="text-neutral-400 font-normal">/ ₹2,500</span>
              </span>
            </div>

            {/* Sleek Emerald Progress Bar */}
            <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden p-0.5 mb-4 border border-neutral-200/50">
              <div 
                className="bg-gradient-to-r from-[#00A86B] to-[#19C37D] h-full rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${Math.min(100, (telemetry.estimatedCost / 2500) * 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100/60">
                <span className="text-neutral-500 block text-[10px] font-bold uppercase tracking-wider">Potential Savings</span>
                <span className="font-extrabold text-[#00A86B] font-mono text-sm">₹684 <span className="text-[10px] text-neutral-400">/ mo</span></span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100/60 text-right">
                <span className="text-neutral-500 block text-[10px] font-bold uppercase tracking-wider">CO₂ Avoidable</span>
                <span className="font-extrabold text-neutral-800 font-mono text-sm">18.7 kg <span className="text-[10px] text-neutral-400">/ mo</span></span>
              </div>
            </div>
          </div>

          {/* SIMULATION NODE HEALTH CARD */}
          <div className="glass-card rounded-[20px] p-4 sm:p-5 border border-white/80 shadow-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#061C16] to-[#0a382b] text-white flex items-center justify-center shrink-0">
                <Server className="w-5 h-5 text-[#19C37D]" />
              </div>
              <div>
                <span className="font-bold text-xs text-neutral-900 block">Simulation Node Health</span>
                <span className="text-[10px] font-mono text-[#00A86B] flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A86B] animate-pulse"></span>
                  ESP32-SIM-001 (ONLINE)
                </span>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('network')}
              className="text-xs font-bold text-[#00A86B] hover:text-[#047857] px-3 py-1.5 rounded-xl bg-[#E8F8F0] hover:bg-emerald-100 border border-[#00A86B]/20 transition-all cursor-pointer"
            >
              IoT Diagnostics
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
