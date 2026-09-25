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
  Gauge,
  Power,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Sliders,
  Maximize2
} from 'lucide-react';

export function LiveEnergyView() {
  const {
    telemetry,
    appliances,
    liveHistory,
    toggleAppliance,
    setSelectedDeviceForDetail
  } = useEnergy();

  const [selectedMetric, setSelectedMetric] = useState('power'); // 'power' | 'voltage' | 'current' | 'pf'

  // Metric configuration
  const metricConfigs = {
    power: {
      label: 'Active Power',
      unit: 'W',
      color: '#00A86B',
      fill: '#E8F8F0',
      dataKey: 'totalPower',
      current: telemetry.totalActivePower,
      format: (v) => `${v} W`
    },
    voltage: {
      label: 'Grid Voltage',
      unit: 'V',
      color: '#3b82f6',
      fill: '#dbeafe',
      dataKey: 'voltage',
      current: telemetry.gridVoltage.toFixed(1),
      format: (v) => `${Number(v).toFixed(1)} V`
    },
    current: {
      label: 'Line Current',
      unit: 'A',
      color: '#10b981',
      fill: '#d1fae5',
      dataKey: 'current',
      current: telemetry.totalCurrent.toFixed(2),
      format: (v) => `${Number(v).toFixed(2)} A`
    },
    pf: {
      label: 'Power Factor',
      unit: 'cos φ',
      color: '#8b5cf6',
      fill: '#ede9fe',
      dataKey: 'pf',
      current: telemetry.systemPowerFactor.toFixed(2),
      format: (v) => Number(v).toFixed(2)
    }
  };

  const activeMetric = metricConfigs[selectedMetric];

  // Calculate high/low for current metric
  const metricHistory = liveHistory.map(h => h[activeMetric.dataKey] || 0);
  const peakVal = metricHistory.length > 0 ? Math.max(...metricHistory) : activeMetric.current;
  const avgVal = metricHistory.length > 0 
    ? (metricHistory.reduce((a, b) => a + b, 0) / metricHistory.length).toFixed(1) 
    : activeMetric.current;

  // Sanctioned limit (5.0 kW standard domestic BESCOM/TNEB sanction)
  const sanctionedLimitW = 5000;
  const loadPercentage = Math.min(100, Math.round((telemetry.totalActivePower / sanctionedLimitW) * 100));

  // Compute total Apparent Power S (kVA) and Reactive Power Q (kVAR)
  const totalVA = Math.round(telemetry.gridVoltage * telemetry.totalCurrent);
  const totalVAR = Math.round(Math.sqrt(Math.max(0, Math.pow(totalVA, 2) - Math.pow(telemetry.totalActivePower, 2))));

  return (
    <div className="space-y-6">

      {/* TOP HEADER & SANCTIONED LOAD STRIP */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-[20px] bg-[#061C16] text-white border border-white/10 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#19C37D] animate-pulse"></span>
            <h2 className="text-base font-bold tracking-tight">Main Power Meter — ESP32 Node 001</h2>
            <span className="text-[10px] font-mono bg-white/10 text-emerald-300 px-2 py-0.5 rounded-md border border-white/10">
              1-Phase 230V AC · 50.0 Hz
            </span>
          </div>
        </div>

        {/* Sanctioned Demand Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10">
          <div>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-neutral-300">Sanctioned Limit (5.0 kW)</span>
              <span className={`font-mono font-bold ${loadPercentage > 85 ? 'text-rose-400' : 'text-[#19C37D]'}`}>
                {loadPercentage}% Utilized ({telemetry.totalActivePower} W)
              </span>
            </div>
            <div className="w-48 sm:w-56 h-2 bg-neutral-800 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  loadPercentage > 85 ? 'bg-rose-500' : loadPercentage > 65 ? 'bg-amber-500' : 'bg-[#00A86B]'
                }`}
                style={{ width: `${loadPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* PRIMARY REAL-TIME CHART CARD */}
      <div className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card space-y-4">
        
        {/* Metric Selector & Stats Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          
          {/* Toggles */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100/90 rounded-xl">
            <button
              onClick={() => setSelectedMetric('power')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetric === 'power' 
                  ? 'bg-white text-[#00A86B] font-bold shadow-xs' 
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Active Power (W)
            </button>
            <button
              onClick={() => setSelectedMetric('voltage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetric === 'voltage' 
                  ? 'bg-white text-blue-600 font-bold shadow-xs' 
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Voltage (V)
            </button>
            <button
              onClick={() => setSelectedMetric('current')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetric === 'current' 
                  ? 'bg-white text-emerald-600 font-bold shadow-xs' 
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Current (A)
            </button>
            <button
              onClick={() => setSelectedMetric('pf')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetric === 'pf' 
                  ? 'bg-white text-purple-600 font-bold shadow-xs' 
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Power Factor
            </button>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-neutral-400 block text-[10px] font-bold">CURRENT</span>
              <span className="text-neutral-900 font-extrabold">{activeMetric.format(activeMetric.current)}</span>
            </div>
            <div className="h-6 w-px bg-neutral-200"></div>
            <div>
              <span className="text-neutral-400 block text-[10px] font-bold">PEAK</span>
              <span className="text-neutral-900 font-extrabold">{activeMetric.format(peakVal)}</span>
            </div>
            <div className="h-6 w-px bg-neutral-200"></div>
            <div>
              <span className="text-neutral-400 block text-[10px] font-bold">AVG</span>
              <span className="text-neutral-900 font-extrabold">{activeMetric.format(avgVal)}</span>
            </div>
          </div>
        </div>

        {/* Real-time Graph */}
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={liveHistory} margin={{ top: 12, right: 15, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeMetric.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={activeMetric.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={{ stroke: '#f1f5f9' }} 
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                width={48}
                domain={selectedMetric === 'pf' ? [0.7, 1.0] : ['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#061C16',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '11px',
                  padding: '8px 12px'
                }}
                formatter={(value) => [activeMetric.format(value), activeMetric.label]}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              />
              <Area
                type="monotone"
                dataKey={activeMetric.dataKey}
                stroke={activeMetric.color}
                strokeWidth={2.5}
                fill="url(#metricGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Incomer Power Triangle Triad */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/70">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Real Power (P)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-mono font-extrabold text-neutral-900">{telemetry.totalActivePower}</span>
              <span className="text-xs text-neutral-500 font-mono">Watts</span>
            </div>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Useful work performed</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/70">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Apparent Power (S)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-mono font-extrabold text-neutral-900">{totalVA}</span>
              <span className="text-xs text-neutral-500 font-mono">VA</span>
            </div>
            <span className="text-[10px] text-neutral-500 block mt-0.5">V_rms × I_rms total draw</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/70">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Reactive Power (Q)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-mono font-extrabold text-neutral-900">{totalVAR}</span>
              <span className="text-xs text-neutral-500 font-mono">VAR</span>
            </div>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Inductive motor magnetization</span>
          </div>
        </div>

      </div>

      {/* VIRTUAL CT CLAMP MULTI-CHANNEL TELEMETRY TABLE */}
      <div className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-3 border-b border-neutral-100">
          <div>
            <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#00A86B]" />
              Connected Appliances & Energy Monitors
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Sampling Rate: 1000 Hz / ADC
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200/80 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Sensor Channel</th>
                <th className="py-2.5 px-3">Appliance & Location</th>
                <th className="py-2.5 px-3">Power</th>
                <th className="py-2.5 px-3">Current</th>
                <th className="py-2.5 px-3">Power Factor</th>
                <th className="py-2.5 px-3">Today</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono">
              {appliances.map((app, index) => {
                const reading = app.reading || {
                  activePower: 0,
                  current: 0,
                  powerFactor: app.powerFactor || 0.95,
                  cumulativeEnergyKwh: 0
                };
                const channelId = `CT-CH0${index + 1}`;
                const power = app.isOn ? reading.activePower : 0;
                const current = app.isOn ? reading.current : 0;

                return (
                  <tr 
                    key={app.id} 
                    className="hover:bg-[#E8F8F0]/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedDeviceForDetail(app)}
                  >
                    {/* Channel */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${app.isOn ? 'bg-[#00A86B]' : 'bg-neutral-300'}`}></span>
                        <span className="font-bold text-neutral-800">{channelId}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-sans block">Sensor Clamp</span>
                    </td>

                    {/* Device & Location */}
                    <td className="py-3 px-3 font-sans">
                      <span className="font-bold text-neutral-900 block group-hover:text-[#00A86B] transition-colors">
                        {app.name}
                      </span>
                      <span className="text-[11px] text-neutral-400 block">{app.location}</span>
                    </td>

                    {/* Active Load */}
                    <td className="py-3 px-3">
                      <span className={`font-bold ${power > 1000 ? 'text-amber-600' : 'text-neutral-900'}`}>
                        {power} W
                      </span>
                    </td>

                    {/* Current */}
                    <td className="py-3 px-3 text-neutral-600">
                      {current.toFixed(2)} A
                    </td>

                    {/* Power Factor */}
                    <td className="py-3 px-3">
                      <span className={`${reading.powerFactor < 0.85 && app.isOn ? 'text-rose-600 font-bold' : 'text-neutral-600'}`}>
                        {reading.powerFactor.toFixed(2)}
                      </span>
                    </td>

                    {/* Today */}
                    <td className="py-3 px-3 text-neutral-800">
                      {(reading.cumulativeEnergyKwh || 0).toFixed(2)} kWh
                    </td>

                    {/* Power State & Toggle */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleAppliance(app.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-sans font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          app.isOn
                            ? 'bg-[#E8F8F0] text-[#00A86B] hover:bg-emerald-200 border border-[#00A86B]/20'
                            : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {app.isOn ? 'ON' : 'OFF'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedDeviceForDetail(app)}
                        className="px-3 py-1 rounded-xl bg-white hover:bg-[#E8F8F0] text-neutral-700 hover:text-[#00A86B] text-xs font-sans font-medium border border-neutral-200/80 transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
