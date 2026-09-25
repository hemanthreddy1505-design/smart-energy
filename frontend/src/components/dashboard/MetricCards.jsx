import React from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { 
  Zap, 
  BatteryCharging, 
  IndianRupee, 
  Leaf, 
  Activity, 
  Gauge, 
  TreePine,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export function MetricCards() {
  const { telemetry, isConnected } = useEnergy();

  // Trees equivalent: 1 mature tree absorbs approx 20kg CO2 per year (~0.055 kg/day)
  const treesOffset = (telemetry.carbonKg / 0.055).toFixed(1);

  const cards = [
    {
      title: 'Total Active Power',
      value: `${telemetry.totalActivePower.toLocaleString()} W`,
      subtext: `${telemetry.totalCurrent} A @ ${telemetry.gridVoltage} V`,
      icon: Zap,
      color: 'from-amber-500/20 to-orange-500/10',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      pill: telemetry.totalActivePower > 3500 ? 'High Demand' : 'Normal Load',
      pillColor: telemetry.totalActivePower > 3500 ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300',
      isPulse: telemetry.totalActivePower > 0
    },
    {
      title: "Today's Energy",
      value: `${telemetry.totalEnergyTodayKwh.toFixed(2)} kWh`,
      subtext: 'Accumulated consumption',
      icon: BatteryCharging,
      color: 'from-emerald-500/20 to-teal-500/10',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      pill: 'Real-time Metered',
      pillColor: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      title: 'Estimated Cost',
      value: `₹${telemetry.estimatedCost.toFixed(2)}`,
      subtext: `Tariff: ₹${telemetry.tariffRate.toFixed(2)}/kWh ${telemetry.isPeakHour ? '(Peak)' : ''}`,
      icon: IndianRupee,
      color: 'from-cyan-500/20 to-blue-500/10',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      pill: telemetry.isPeakHour ? 'Peak Rate (1.25x)' : 'Standard Rate',
      pillColor: telemetry.isPeakHour ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300',
    },
    {
      title: 'Carbon Footprint',
      value: `${telemetry.carbonKg.toFixed(2)} kg CO₂`,
      subtext: `Offset ≈ ${treesOffset} tree-days`,
      icon: Leaf,
      color: 'from-emerald-500/20 to-green-500/10',
      iconColor: 'text-emerald-300',
      borderColor: 'border-emerald-400/30',
      pill: 'SDG 13 Climate',
      pillColor: 'bg-emerald-500/20 text-emerald-300',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className={`relative rounded-2xl p-5 bg-gradient-to-br ${c.color} bg-slate-900/90 border ${c.borderColor} shadow-lg transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                  {c.title}
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                    {c.value}
                  </h3>
                  {c.isPulse && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  )}
                </div>
              </div>

              <div className={`p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 ${c.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 truncate max-w-[150px]">
                {c.subtext}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${c.pillColor}`}>
                {c.pill}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
