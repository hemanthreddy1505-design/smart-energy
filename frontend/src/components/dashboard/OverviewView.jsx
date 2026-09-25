import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';
import {
  ArrowLeftRight,
  MoreVertical,
  MoreHorizontal,
  Star,
  Snowflake,
  Zap,
  Flame,
  ChevronDown,
  Download,
  CheckCircle,
  Clock,
  Tv,
  Monitor,
  Lightbulb,
  Fan,
  Power
} from 'lucide-react';

const iconBadgeMap = {
  'AC001': 'AC',
  'FR001': 'FR',
  'GH001': 'GH',
  'PC001': 'PC',
  'WM001': 'WM',
  'TV001': 'TV',
  'LT001': 'LT',
  'FN001': 'FN'
};

export function OverviewView({ onOpenAcademicModal }) {
  const { telemetry, appliances, liveHistory, toggleAppliance, alerts, backendUrl } = useEnergy();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('24H');
  const [timeFilter, setTimeFilter] = useState('24h');
  const [sortFilter, setSortFilter] = useState('Top consumers');
  const [starred, setStarred] = useState(new Set(['AC001', 'GH001', 'PC001']));
  const [isDownloading, setIsDownloading] = useState(false);

  // Timeframe pills
  const timeframes = ['1H', '24H', '1W', '1M', '1Y', 'ALL'];

  const toggleStar = (id) => {
    setStarred(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownloadReport = () => {
    setIsDownloading(true);
    window.open(`${backendUrl}/api/analytics/export/csv`, '_blank');
    setTimeout(() => setIsDownloading(false), 1500);
  };

  // Sparkline data
  const chartData = liveHistory.length > 5 
    ? liveHistory.map((h, i) => ({ val: h.totalPower, time: h.time }))
    : [
        { val: 1200, time: '1' },
        { val: 1450, time: '2' },
        { val: 1380, time: '3' },
        { val: 1650, time: '4' },
        { val: 1520, time: '5' },
        { val: 2150, time: '6' },
        { val: 1845, time: '7' },
        { val: 1720, time: '8' },
        { val: 1910, time: '9' },
        { val: 1640, time: '10' }
      ];

  const acApp = appliances.find(a => a.id === 'AC001') || { id: 'AC001', name: 'Air Conditioner', location: 'Living Room', isOn: true, reading: { activePower: 1450, cumulativeEnergyKwh: 3.48, current: 6.3 } };
  const fridgeApp = appliances.find(a => a.id === 'FR001') || { id: 'FR001', name: 'Smart Refrigerator', location: 'Kitchen', isOn: true, reading: { activePower: 185, cumulativeEnergyKwh: 0.48, current: 0.8 } };
  const geyserApp = appliances.find(a => a.id === 'GH001') || { id: 'GH001', name: 'Storage Geyser', location: 'Bathroom 1', isOn: false, reading: { activePower: 2000, cumulativeEnergyKwh: 1.98, current: 8.7 } };

  // Key asset values
  const acPowerKw = acApp.reading ? (acApp.reading.activePower / 1000).toFixed(2) : '1.45';
  const fridgePowerKw = fridgeApp.reading ? (fridgeApp.reading.activePower / 1000).toFixed(2) : '0.19';
  const geyserPowerKw = geyserApp.reading ? (geyserApp.reading.activePower / 1000).toFixed(2) : '2.00';

  const acCost = acApp.reading ? (acApp.reading.cumulativeEnergyKwh * (telemetry.tariffRate || 8)).toFixed(2) : '0.00';
  const fridgeCost = fridgeApp.reading ? (fridgeApp.reading.cumulativeEnergyKwh * (telemetry.tariffRate || 8)).toFixed(2) : '0.00';
  const geyserCost = geyserApp.reading ? (geyserApp.reading.cumulativeEnergyKwh * (telemetry.tariffRate || 8)).toFixed(2) : '0.00';

  // Sort appliances for table
  const sortedAppliances = [...appliances].sort((a, b) => {
    const pA = a.reading ? a.reading.activePower : 0;
    const pB = b.reading ? b.reading.activePower : 0;
    return pB - pA;
  });

  return (
    <div className="w-full space-y-6">

      {/* TOP ROW: Portfolio Card (Left) & Your Assets (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* PORTFOLIO CARD (Left 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">Total Energy & Cost</h3>
          </div>

          <div className="bg-[#eaf3fe] rounded-2xl p-5 border border-blue-100/70 relative flex-1 flex flex-col justify-between min-h-[225px]">
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                  ₹ {Number(telemetry.estimatedCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <p className="text-xs font-medium text-neutral-500 mt-0.5">
                  Today's Cumulative Cost · <strong className="text-neutral-800 font-semibold">{telemetry.totalActivePower.toLocaleString()} W</strong> Live
                </p>
              </div>
              <button className="text-neutral-400 hover:text-neutral-600 p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Elevated Pill Tooltip hovering at peak */}
            <div className="relative my-2 h-20 w-full">
              <div className="absolute top-1 left-[58%] -translate-x-1/2 z-10 flex flex-col items-center">
                <div className="bg-neutral-900 text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                  2,150 W Peak
                </div>
                <div className="w-px h-3 border-l border-dashed border-neutral-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-200 -mt-1"></div>
              </div>

              {/* Area sparkline */}
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 14, right: 6, left: 6, bottom: 4 }}>
                    <defs>
                      <linearGradient id="pastelBlueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="val"
                      stroke="#4f8ff7"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#pastelBlueGrad)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Timeframe Pills */}
            <div className="flex items-center justify-between pt-2">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedTimeframe === tf
                      ? 'bg-white text-neutral-900 font-semibold shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-700'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* YOUR ASSETS (Right 7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">Active Load Highlights</h3>
            <button className="text-neutral-400 hover:text-neutral-700 p-1">
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            
            {/* Card 1: Lavender / Pastel Purple (AC) */}
            <div 
              onClick={() => toggleAppliance(acApp.id, !acApp.isOn)}
              className="bg-[#efe7fa] rounded-2xl p-4 flex flex-col justify-between min-h-[225px] border border-purple-100/50 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-neutral-900">
                    {acPowerKw} kW AC
                  </h4>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">
                    ₹ {acCost} today
                  </p>
                </div>
                <button className="text-neutral-400 hover:text-neutral-600 p-0.5">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-end justify-between mt-auto">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-purple-700 shadow-xs font-bold text-sm group-hover:scale-110 transition-transform">
                  <Snowflake className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-xs font-semibold text-purple-700 bg-purple-200/50 px-2.5 py-0.5 rounded-full">
                  {acApp.isOn ? 'ON · Active' : 'OFF'}
                </span>
              </div>
            </div>

            {/* Card 2: Pastel Mint / Soft Sage Green (Fridge) */}
            <div 
              onClick={() => toggleAppliance(fridgeApp.id, !fridgeApp.isOn)}
              className="bg-[#e1f5e8] rounded-2xl p-4 flex flex-col justify-between min-h-[225px] border border-emerald-100/50 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-neutral-900">
                    {fridgePowerKw} kW Fridge
                  </h4>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">
                    ₹ {fridgeCost} today
                  </p>
                </div>
                <button className="text-neutral-400 hover:text-neutral-600 p-0.5">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-end justify-between mt-auto">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-emerald-700 shadow-xs font-bold text-sm group-hover:scale-110 transition-transform">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-200/50 px-2.5 py-0.5 rounded-full">
                  {fridgeApp.isOn ? 'Eco Mode' : 'OFF'}
                </span>
              </div>
            </div>

            {/* Card 3: Pastel Soft Butter Yellow / Warm Cream (Geyser) */}
            <div 
              onClick={() => toggleAppliance(geyserApp.id, !geyserApp.isOn)}
              className="bg-[#fef1d6] rounded-2xl p-4 flex flex-col justify-between min-h-[225px] border border-amber-100/50 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-neutral-900">
                    {geyserPowerKw} kW Geyser
                  </h4>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">
                    ₹ {geyserCost} today
                  </p>
                </div>
                <button className="text-neutral-400 hover:text-neutral-600 p-0.5">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-end justify-between mt-auto">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-amber-700 shadow-xs font-bold text-sm group-hover:scale-110 transition-transform">
                  <Flame className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-200/50 px-2.5 py-0.5 rounded-full">
                  {geyserApp.isOn ? 'High Draw' : 'Standby'}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* BOTTOM ROW: Appliance Load Table (Left) & Dark Action Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch pt-2">
        
        {/* APPLIANCE TABLE (Left 7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Active Load Distribution
            </h3>
            
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button className="bg-neutral-100 hover:bg-neutral-200 px-3 py-1 rounded-full text-xs font-medium text-neutral-700 flex items-center gap-1 transition-colors cursor-pointer">
                24h <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>
              <button className="bg-neutral-100 hover:bg-neutral-200 px-3 py-1 rounded-full text-xs font-medium text-neutral-700 flex items-center gap-1 transition-colors cursor-pointer">
                Top consumers <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>
            </div>
          </div>

          <div className="bg-transparent flex-1">
            <div className="w-full text-left">
              {/* Header row */}
              <div className="grid grid-cols-12 text-[11px] font-semibold text-neutral-400 pb-2 border-b border-neutral-100 px-1">
                <div className="col-span-5">Appliance</div>
                <div className="col-span-2 text-right">Power</div>
                <div className="col-span-2 text-right">Current</div>
                <div className="col-span-2 text-right">Today Cost</div>
                <div className="col-span-1 text-center">Relay</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-neutral-100 text-xs">
                {sortedAppliances.slice(0, 5).map((app) => {
                  const powerW = app.reading ? Math.round(app.reading.activePower) : 0;
                  const currentA = app.reading ? app.reading.current : 0;
                  const energyKwh = app.reading ? app.reading.cumulativeEnergyKwh : 0;
                  const cost = (energyKwh * telemetry.tariffRate).toFixed(2);
                  const badgeLetters = iconBadgeMap[app.id] || app.name.slice(0, 2).toUpperCase();

                  return (
                    <div key={app.id} className="grid grid-cols-12 items-center py-2.5 px-1 hover:bg-neutral-50/80 rounded-xl transition-colors">
                      <div className="col-span-5 flex items-center gap-2.5 truncate">
                        <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {badgeLetters}
                        </div>
                        <div className="truncate">
                          <h5 className="font-bold text-neutral-900 text-xs leading-none truncate">{app.name}</h5>
                          <span className="text-[10px] text-neutral-400 uppercase font-semibold block mt-0.5 truncate">
                            {app.id} · {app.location}
                          </span>
                        </div>
                      </div>
                      
                      <div className="col-span-2 text-right font-medium text-neutral-900">
                        {app.isOn ? `${powerW} W` : '0 W'}
                      </div>
                      
                      <div className="col-span-2 text-right font-semibold text-emerald-600">
                        {app.isOn ? `+${currentA} A` : '0.0 A'}
                      </div>
                      
                      <div className="col-span-2 text-right font-medium text-neutral-800">
                        ₹{cost}
                      </div>
                      
                      <div className="col-span-1 flex justify-center">
                        <button 
                          onClick={() => toggleAppliance(app.id, !app.isOn)}
                          title={`Turn ${app.isOn ? 'OFF' : 'ON'} ${app.name}`}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            app.isOn ? 'text-emerald-600 hover:bg-emerald-50' : 'text-neutral-400 hover:bg-neutral-100'
                          }`}
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
        </div>

        {/* DARK HERO ACTION CARD (Right 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-end">
          <div className="bg-[#1c1d22] rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[250px] shadow-xl">
            
            {/* Abstract Wireframe Geometric Lines in Corner */}
            <div className="absolute right-0 bottom-0 pointer-events-none opacity-40">
              <svg width="180" height="150" viewBox="0 0 180 150" fill="none">
                <path d="M40 140L140 40M70 140L170 40M100 140L180 60M10 140L110 40" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
                <path d="M120 150L170 100M90 150L170 70" stroke="white" strokeWidth="1" strokeOpacity="0.25" />
                <polygon points="50,140 140,50 170,80 80,150" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" fill="none" />
              </svg>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                Save <span className="border border-white/50 px-2.5 py-0.5 rounded-full text-base font-normal">₹680+</span> monthly with Eco Smart Shift!
              </h3>
              <p className="text-xs text-neutral-400 mt-2.5 leading-relaxed max-w-[290px]">
                Peak tariff active (18:00–22:00 at ₹10.00/kWh). Automated scheduler shifts heavy loads to off-peak slots to minimize carbon & cost.
              </p>
            </div>

            {/* Action button */}
            <div className="relative z-10 pt-6">
              <button 
                onClick={handleDownloadReport}
                className="bg-[#e2eaf4] hover:bg-white text-neutral-900 font-semibold px-6 py-2.5 rounded-full text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-neutral-800" />
                {isDownloading ? 'Generating CSV...' : 'Download Energy Report (CSV)'}
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
