import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Check
} from 'lucide-react';

export function AlertsView() {
  const { alerts, resolveAlert } = useEnergy();
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'
  const [statusFilter, setStatusFilter] = useState('OPEN'); // 'OPEN' | 'ALL'

  const openAlerts = alerts.filter(a => !a.is_resolved);
  const criticalCount = openAlerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = openAlerts.filter(a => a.severity === 'WARNING').length;
  const resolvedCount = alerts.filter(a => a.is_resolved).length;

  const filteredAlerts = alerts.filter(a => {
    const matchesStatus = statusFilter === 'OPEN' ? !a.is_resolved : true;
    const matchesSev = filter === 'ALL' || a.severity === filter;
    return matchesStatus && matchesSev;
  });

  const getSeverityIcon = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-[#00A86B]" />;
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'WARNING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-[#E8F8F0] text-[#00A86B] border-[#00A86B]/30';
    }
  };

  return (
    <div className="space-y-6">

      {/* TOP HEADER & COUNTERS */}
      <div className="glass-card rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/80 shadow-card">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#00A86B]" />
            Anomaly Detection & Incident Log
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time threshold breaches, high-power anomalies, and safety interlocks
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-mono font-bold text-rose-700">
            {criticalCount} Critical
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono font-bold text-amber-700">
            {warningCount} Warnings
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[#E8F8F0] border border-[#00A86B]/20 text-xs font-mono font-bold text-[#00A86B]">
            {resolvedCount} Resolved
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Severity Filter */}
        <div className="flex items-center gap-1.5">
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === sev
                  ? 'bg-gradient-to-r from-[#00A86B] to-[#059669] text-white shadow-xs font-bold'
                  : 'bg-white/80 hover:bg-white text-neutral-600 border border-neutral-200/70'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100/90 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('OPEN')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'OPEN'
                ? 'bg-white text-[#00A86B] font-bold shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Open ({openAlerts.length})
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white text-[#00A86B] font-bold shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            All History ({alerts.length})
          </button>
        </div>
      </div>

      {/* ALERTS FEED */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="glass-card rounded-[20px] p-8 text-center text-neutral-400 border border-white/80 shadow-card">
            <CheckCircle2 className="w-8 h-8 text-[#00A86B] mx-auto mb-2" />
            <p className="text-sm font-bold text-neutral-700">No active incidents found</p>
            <p className="text-xs text-neutral-400 mt-0.5">All monitored channels are operating within nominal thresholds.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`glass-card rounded-[20px] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border transition-all ${
                alert.is_resolved
                  ? 'border-neutral-200/50 opacity-70 bg-white/60'
                  : alert.severity === 'CRITICAL'
                  ? 'border-rose-200 bg-rose-50/40 shadow-xs'
                  : 'border-white/80 shadow-card'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className="p-2.5 rounded-xl bg-white border border-neutral-200/80 shadow-xs shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm text-neutral-900">
                      {alert.applianceName || alert.alertType}
                    </h4>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    {alert.applianceId && (
                      <span className="text-[10px] font-mono text-neutral-400">
                        ({alert.applianceId})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-400 font-mono">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span>{new Date(alert.timestamp || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                  </div>
                </div>
              </div>

              {!alert.is_resolved ? (
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#E8F8F0] hover:bg-emerald-200 text-[#00A86B] font-bold text-xs border border-[#00A86B]/20 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark Resolved
                </button>
              ) : (
                <span className="text-xs font-bold text-neutral-400 flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A86B]" /> Resolved
                </span>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
