import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Activity, Radio } from 'lucide-react';

export function LivePowerChart() {
  const { liveHistory } = useEnergy();
  const [selectedMetric, setSelectedMetric] = useState('power'); // 'power' | 'current' | 'voltage' | 'cost'

  const metrics = [
    { id: 'power', label: 'Power (W)', dataKey: 'totalPower', color: '#10b981', unit: 'W' },
    { id: 'current', label: 'Current (A)', dataKey: 'current', color: '#06b6d4', unit: 'A' },
    { id: 'voltage', label: 'Voltage (V)', dataKey: 'voltage', color: '#f59e0b', unit: 'V' },
    { id: 'cost', label: 'Cost (₹)', dataKey: 'cost', color: '#ec4899', unit: '₹' },
  ];

  const currentMetric = metrics.find(m => m.id === selectedMetric) || metrics[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl mb-6">
      
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Real-Time Power Usage
            </h3>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Radio className="w-3 h-3 animate-pulse" />
              LIVE (1 Hz)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Live power readings measured at 1-second intervals
          </p>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto justify-between">
          {metrics.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMetric(m.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedMetric === m.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{
                color: selectedMetric === m.id ? m.color : undefined
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-64 sm:h-72 w-full">
        {liveHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
            Awaiting sensor stream samples...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={liveHistory} margin={{ top: 12, right: 15, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.35}/>
                  <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false}
                width={48}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                itemStyle={{ color: currentMetric.color, fontWeight: 600 }}
                formatter={(val) => [`${val} ${currentMetric.unit}`, currentMetric.label]}
              />
              <Area
                type="monotone"
                dataKey={currentMetric.dataKey}
                stroke={currentMetric.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#metricGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}
