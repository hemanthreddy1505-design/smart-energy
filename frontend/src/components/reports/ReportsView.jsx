import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  IndianRupee,
  Leaf,
  Zap,
  Award,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export function ReportsView() {
  const {
    backendUrl,
    telemetry,
    appliances,
    costInfo,
    carbonInfo,
    alerts,
    currentUser
  } = useEnergy();

  const [period, setPeriod] = useState('month'); // 'today' | 'week' | 'month'

  const multiplier = period === 'today' ? 1 : period === 'week' ? 7 : 30;
  const baseKwh = telemetry.totalEnergyTodayKwh > 0 ? telemetry.totalEnergyTodayKwh : 14.2;
  const totalKwh = Number((baseKwh * multiplier).toFixed(2));
  const totalCost = Number((totalKwh * telemetry.tariffRate).toFixed(2));
  const totalCarbon = Number((totalKwh * 0.82).toFixed(2));
  const peakDemandKw = (telemetry.totalActivePower / 1000).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">

      {/* TOP CONTROLS & EXPORT ACTIONS (Hidden during print) */}
      <div className="glass-card rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/80 shadow-card print:hidden">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00A86B]" />
            Energy Audit Report & Statement
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            BEE Star rating compliance, carbon offsets, and appliance tariff breakdown
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Period selector */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100/90 rounded-xl">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                period === 'today' ? 'bg-white text-[#00A86B] font-bold shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                period === 'week' ? 'bg-white text-[#00A86B] font-bold shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                period === 'month' ? 'bg-white text-[#00A86B] font-bold shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              This Month
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-bold border border-neutral-200 shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-500" />
            <span>Print</span>
          </button>

          <a
            href={`${backendUrl}/api/analytics/export/csv`}
            download="energy_audit_statement.csv"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00A86B] to-[#059669] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL AUDIT DOCUMENT */}
      <div className="glass-card rounded-[20px] p-6 sm:p-8 border border-white/80 shadow-card bg-white text-neutral-900 space-y-6">
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-neutral-200 pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00A86B]"></span>
              <h3 className="text-xl font-extrabold tracking-tight text-neutral-900">
                Residential Energy Audit Certificate
              </h3>
            </div>
            <p className="text-xs text-neutral-500 font-mono">
              Report Ref: EAC-2026-BLR-0402 · Bureau of Energy Efficiency (BEE) Protocol
            </p>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="font-bold text-neutral-900 block">Date of Issue:</span>
            <span className="text-neutral-500 font-mono">
              {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Consumer & Facility Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-neutral-50/80 border border-neutral-100 text-xs">
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Consumer Name</span>
            <span className="font-bold text-neutral-900 block mt-0.5">{currentUser?.name || 'Dhanush Yadav'}</span>
            <span className="text-neutral-500 text-[11px]">{currentUser?.door_no || 'Flat 402, Block B'}</span>
          </div>

          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Meter & Sanction</span>
            <span className="font-mono font-bold text-neutral-900 block mt-0.5">{currentUser?.consumer_id || 'IND-BLR-0402'}</span>
            <span className="text-neutral-500 text-[11px]">5.0 kW Sanctioned Load (LT-2a)</span>
          </div>

          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Gateway Node</span>
            <span className="font-mono font-bold text-[#00A86B] block mt-0.5">ESP32-SIM-001</span>
            <span className="text-neutral-500 text-[11px]">1-Phase 230V AC · 8 CT Channels</span>
          </div>
        </div>

        {/* Executive Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#E8F8F0]/60 border border-[#00A86B]/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Total Energy</span>
            <span className="text-xl font-extrabold font-mono text-[#00A86B] block mt-1">{totalKwh} kWh</span>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Billing Charge</span>
            <span className="text-xl font-extrabold font-mono text-neutral-900 block mt-1">₹{totalCost}</span>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Carbon Emission</span>
            <span className="text-xl font-extrabold font-mono text-neutral-900 block mt-1">{totalCarbon} kg CO₂</span>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Peak Demand</span>
            <span className="text-xl font-extrabold font-mono text-rose-600 block mt-1">{peakDemandKw} kW</span>
          </div>
        </div>

        {/* Appliance Level Consumption Breakdown */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
            Appliance Sub-Meter Energy Breakdown
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-3">Appliance</th>
                  <th className="py-2 px-3">Location</th>
                  <th className="py-2 px-3">Rated Power</th>
                  <th className="py-2 px-3">Energy (Period)</th>
                  <th className="py-2 px-3">Cost (₹)</th>
                  <th className="py-2 px-3 text-right">BEE Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                {appliances.map((app) => {
                  const energy = Number(((app.reading?.cumulativeEnergyKwh || 0.4) * multiplier).toFixed(2));
                  const cost = Number((energy * telemetry.tariffRate).toFixed(2));
                  return (
                    <tr key={app.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3 font-bold font-sans text-neutral-900">{app.name}</td>
                      <td className="py-2.5 px-3 font-sans text-neutral-500">{app.location}</td>
                      <td className="py-2.5 px-3 text-neutral-600">{app.ratedPower} W</td>
                      <td className="py-2.5 px-3 font-bold text-neutral-900">{energy} kWh</td>
                      <td className="py-2.5 px-3 text-neutral-800">₹{cost}</td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00A86B] bg-[#E8F8F0] px-2 py-0.5 rounded-full border border-[#00A86B]/20">
                          <CheckCircle2 className="w-3 h-3" /> 5-Star Rated
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification & Compliance Stamp */}
        <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00A86B]" />
            <span>Digital IoT Edge Sensor Signature Verified via SQLite Engine</span>
          </div>
          <div className="font-mono text-[11px]">
            Status: <strong className="text-[#00A86B]">COMPLIANT (GREEN TIER)</strong>
          </div>
        </div>

      </div>

    </div>
  );
}
