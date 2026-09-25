import React, { useState, useEffect } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  Sparkles,
  CalendarClock,
  Sliders,
  TrendingDown,
  Moon,
  Briefcase,
  Leaf,
  Shield,
  Plus,
  Trash2,
  Power,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  IndianRupee,
  Calendar
} from 'lucide-react';

const sceneIcons = {
  night_mode: Moon,
  work_mode: Briefcase,
  eco_peak_shift: Leaf,
  away_mode: Shield
};

const DEFAULT_SCENES = [
  {
    id: 'night_mode',
    name: 'Night Mode',
    description: 'Powers down entertainment, non-essential lighting, and keeps HVAC in low-power eco operation.',
    actions: [
      { name: 'Smart Television', state: 'OFF' },
      { name: 'Living Room Lighting', state: 'OFF' },
      { name: 'Washing Machine', state: 'OFF' },
      { name: 'Water Heater / Geyser', state: 'OFF' }
    ]
  },
  {
    id: 'work_mode',
    name: 'Work / Office Mode',
    description: 'Energizes high-performance workstation and office task lighting while idling heavy utility loads.',
    actions: [
      { name: 'Workstation PC', state: 'ON' },
      { name: 'Living Room Lighting', state: 'ON' },
      { name: 'Ceiling Fan', state: 'ON' }
    ]
  },
  {
    id: 'eco_peak_shift',
    name: 'Eco Peak Load Shedding',
    description: 'Sheds flexible heavy resistive heating loads during high-tariff surcharge intervals (18:00 - 22:00).',
    actions: [
      { name: 'Water Heater / Geyser', state: 'OFF' },
      { name: 'Washing Machine', state: 'OFF' }
    ]
  },
  {
    id: 'away_mode',
    name: 'Away / Vacant Mode',
    description: 'Turns off all non-critical loads, leaving only essential cold storage (Refrigerator) energized.',
    actions: [
      { name: 'Air Conditioner', state: 'OFF' },
      { name: 'Smart Television', state: 'OFF' },
      { name: 'Workstation PC', state: 'OFF' },
      { name: 'Water Heater / Geyser', state: 'OFF' }
    ]
  }
];

const DEFAULT_RULES = [
  {
    id: 'rule_peak_demand',
    name: 'Power Limit Overload Protection',
    description: 'Automatically pauses water heater if total home power exceeds 3.5 kW for > 2 mins.',
    condition: 'Total Power > 3500 W for > 2 mins',
    action: 'Temporarily turn off Water Heater',
    type: 'DEMAND GUARD'
  },
  {
    id: 'rule_vampire_cutoff',
    name: 'Standby Power Auto Cut-off',
    description: 'Turns off workstation and television if power usage remains below 15W for 30 minutes.',
    condition: 'Power Draw < 15 W for > 30 mins',
    action: 'Turn off power to eliminate standby waste',
    type: 'STANDBY SAVER'
  },
  {
    id: 'rule_peak_tariff_sentinel',
    name: 'Peak Tariff Surcharge Sentinel',
    description: 'Prevents concurrent operation of heavy heating and washing cycles during the 18:00–22:00 surcharge interval.',
    condition: 'Time = Peak Hours AND Geyser = ON',
    action: 'Delay washing machine start until 22:00',
    type: 'TARIFF OPTIMIZER'
  },
  {
    id: 'rule_overvoltage_guard',
    name: 'High Voltage Equipment Protection',
    description: 'Safely turns off sensitive electronics (PC, TV) if incoming grid voltage exceeds 250V.',
    condition: 'Grid Voltage > 250.0 V',
    action: 'Turn off sensitive electronics',
    type: 'VOLTAGE GUARD'
  }
];

const DEFAULT_LOAD_SHIFTING = {
  peakWindow: '18:00 - 22:00',
  standardRate: 8.0,
  peakRate: 10.0,
  surchargePerKwh: 2.0,
  totalPotentialSavingsMonth: 228.0,
  totalCarbonAvoidedMonth: 18.7,
  opportunities: [
    {
      applianceId: 'GH001',
      name: 'Water Heater / Geyser',
      typicalKwhPerCycle: 2.2,
      currentSchedule: '19:00 (Peak Surcharge)',
      recommendedSchedule: '22:30 (Off-Peak)',
      dailySavingsInr: 4.4,
      monthlySavingsInr: 132.0,
      carbonAvoidedKgMonth: 10.8
    },
    {
      applianceId: 'WM001',
      name: 'Washing Machine',
      typicalKwhPerCycle: 1.6,
      currentSchedule: '20:00 (Peak Surcharge)',
      recommendedSchedule: '14:00 (Solar / Off-Peak)',
      dailySavingsInr: 3.2,
      monthlySavingsInr: 96.0,
      carbonAvoidedKgMonth: 7.9
    }
  ]
};

export function AutomationsView() {
  const {
    scenes,
    schedules,
    rules,
    loadShifting,
    appliances,
    applyScene,
    toggleSchedule,
    deleteSchedule,
    addSchedule
  } = useEnergy();

  const [subTab, setSubTab] = useState('scenes'); // 'scenes' | 'schedules' | 'rules' | 'shifting'
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [newScheduleAppliance, setNewScheduleAppliance] = useState(appliances[0]?.id || 'AC001');
  const [newScheduleTime, setNewScheduleTime] = useState('22:00');
  const [newScheduleAction, setNewScheduleAction] = useState('OFF');
  const [sceneSuccessToast, setSceneSuccessToast] = useState(null);

  useEffect(() => {
    if (!isAddScheduleModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsAddScheduleModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddScheduleModalOpen]);

  // Normalize scenes data safely
  const effectiveScenes = (scenes && scenes.length > 0) ? scenes : DEFAULT_SCENES;
  const effectiveRules = (rules && rules.length > 0) ? rules : DEFAULT_RULES;
  const effectiveLoadShifting = loadShifting || DEFAULT_LOAD_SHIFTING;

  const handleApplyScene = async (sceneId, sceneName) => {
    const success = await applyScene(sceneId);
    if (success) {
      setSceneSuccessToast(`Activated "${sceneName}" profile successfully`);
      setTimeout(() => setSceneSuccessToast(null), 4000);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    const app = appliances.find(a => a.id === newScheduleAppliance);
    const success = await addSchedule({
      appliance_id: newScheduleAppliance,
      appliance_name: app ? app.name : newScheduleAppliance,
      action: newScheduleAction,
      scheduled_time: newScheduleTime,
      days_of_week: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
      is_active: 1
    });

    if (success) {
      setIsAddScheduleModalOpen(false);
    }
  };

  // Helper to extract actions cleanly whether array of objects or key-value dictionary
  const getNormalizedActions = (scene) => {
    if (!scene || !scene.actions) return [];
    if (Array.isArray(scene.actions)) {
      return scene.actions.map(act => {
        const app = appliances.find(a => a.id === act.applianceId);
        const name = act.name || app?.name || act.applianceId;
        const stateStr = typeof act.state === 'boolean' 
          ? (act.state ? 'ON' : 'OFF') 
          : String(act.state || 'OFF').toUpperCase();
        return { name, state: stateStr };
      });
    }
    return Object.entries(scene.actions).map(([appId, stateVal]) => {
      const app = appliances.find(a => a.id === appId);
      const name = app?.name || appId;
      const stateStr = typeof stateVal === 'boolean'
        ? (stateVal ? 'ON' : 'OFF')
        : String(stateVal || 'OFF').toUpperCase();
      return { name, state: stateStr };
    });
  };

  return (
    <div className="space-y-6">

      {/* TOP SUBTAB BAR */}
      <div className="flex items-center justify-center p-3 rounded-[20px] glass-card border border-white/80 shadow-card">
        <div className="flex items-center justify-center gap-1.5 p-1 bg-neutral-100/90 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => setSubTab('scenes')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              subTab === 'scenes' ? 'bg-white text-[#00A86B] font-bold shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Scenes (Profiles)
          </button>
          <button
            onClick={() => setSubTab('schedules')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              subTab === 'schedules' ? 'bg-white text-[#00A86B] font-bold shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Schedules ({schedules.length})
          </button>
          <button
            onClick={() => setSubTab('rules')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              subTab === 'rules' ? 'bg-white text-[#00A86B] font-bold shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Smart Rules ({effectiveRules.length})
          </button>
          <button
            onClick={() => setSubTab('shifting')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              subTab === 'shifting' ? 'bg-white text-[#00A86B] font-bold shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Peak Load Shifting
          </button>
        </div>
      </div>

      {/* SUCCESS TOAST */}
      {sceneSuccessToast && (
        <div className="p-3.5 rounded-xl bg-[#E8F8F0] border border-[#00A86B]/30 text-[#00A86B] text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
          <span>{sceneSuccessToast}</span>
        </div>
      )}

      {/* 1. SCENES TAB */}
      {subTab === 'scenes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {effectiveScenes.map(scene => {
            const Icon = sceneIcons[scene.id] || Sparkles;
            const actions = getNormalizedActions(scene);

            return (
              <div
                key={scene.id}
                className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card flex flex-col justify-between hover:shadow-card-hover transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#061C16] text-[#19C37D] flex items-center justify-center shadow-xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-neutral-900">{scene.name}</h3>
                        <span className="text-[11px] text-neutral-400 font-mono">1-Touch Scene Profile</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                    {scene.description}
                  </p>

                  <div className="p-3.5 rounded-xl bg-neutral-50/80 text-xs space-y-1.5 mb-4 border border-neutral-100 font-mono text-[11px]">
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">Actions:</span>
                    {actions.map((act, actIdx) => (
                      <div key={actIdx} className="flex items-center justify-between">
                        <span className="text-neutral-700">{act.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          act.state === 'ON' ? 'bg-[#E8F8F0] text-[#00A86B]' : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          SET {act.state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleApplyScene(scene.id, scene.name)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00A86B] to-[#059669] hover:from-[#047857] hover:to-[#065f46] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-emerald-glow"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Activate Scene</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. SCHEDULES TAB */}
      {subTab === 'schedules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">
              Active schedules automatically turn appliances on or off at set times.
            </span>
            <button
              onClick={() => setIsAddScheduleModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00A86B] to-[#059669] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Schedule</span>
            </button>
          </div>

          <div className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card">
            {schedules.length === 0 ? (
              <div className="text-center py-10 text-neutral-400 text-xs">
                No automation schedules configured. Click "Create Schedule" above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Device</th>
                      <th className="py-2.5 px-3">Trigger Time</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Days</th>
                      <th className="py-2.5 px-3">State</th>
                      <th className="py-2.5 px-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-mono">
                    {schedules.map(sch => (
                      <tr key={sch.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-3 px-3 font-sans font-semibold text-neutral-900">
                          {sch.appliance_name || sch.appliance_id}
                        </td>
                        <td className="py-3 px-3 text-neutral-700 font-bold">
                          {sch.scheduled_time}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sch.action === 'ON' ? 'bg-[#E8F8F0] text-[#00A86B]' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {sch.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans text-neutral-500 text-[11px]">
                          {sch.days_of_week || 'Everyday'}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => toggleSchedule(sch.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-sans font-bold transition-all cursor-pointer ${
                              sch.is_active
                                ? 'bg-[#E8F8F0] text-[#00A86B] border border-[#00A86B]/20'
                                : 'bg-neutral-200 text-neutral-600'
                            }`}
                          >
                            {sch.is_active ? 'ACTIVE' : 'PAUSED'}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => deleteSchedule(sch.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SMART RULES TAB */}
      {subTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {effectiveRules.map(rule => (
            <div key={rule.id} className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8F8F0] text-[#00A86B] font-bold border border-[#00A86B]/20">
                  {rule.type || 'RULE'}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#00A86B]"></span>
              </div>
              <h3 className="font-bold text-sm text-neutral-900">{rule.name}</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{rule.description}</p>
              <div className="p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-100 text-xs font-mono">
                <div className="text-neutral-400 text-[10px] uppercase font-bold mb-1">TRIGGER LOGIC:</div>
                <div className="text-neutral-800">
                  IF <span className="text-amber-600 font-bold">{rule.condition}</span> THEN <span className="text-[#00A86B] font-bold">{rule.action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. PEAK LOAD SHIFTING TAB */}
      {subTab === 'shifting' && (
        <div className="space-y-6">
          <div className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card space-y-4">
            
            {/* Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-sm text-neutral-900">Time-of-Day (TOD) Peak Tariff Load Shifting</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Peak Surcharge Window: {effectiveLoadShifting.peakWindow}
              </span>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50/80 border border-neutral-200/70">
                <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Standard vs Peak Rate</span>
                <span className="text-2xl font-extrabold font-mono text-neutral-900 mt-1 block">
                  ₹{effectiveLoadShifting.standardRate.toFixed(2)} → ₹{effectiveLoadShifting.peakRate.toFixed(2)}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">+₹{effectiveLoadShifting.surchargePerKwh.toFixed(2)}/kWh peak differential</span>
              </div>

              <div className="p-4 rounded-xl bg-[#E8F8F0]/60 border border-[#00A86B]/20">
                <span className="text-[11px] font-semibold text-[#00A86B] block uppercase">Estimated Monthly Savings</span>
                <span className="text-2xl font-extrabold font-mono text-[#00A86B] mt-1 block">
                  ₹{effectiveLoadShifting.totalPotentialSavingsMonth.toFixed(2)}
                </span>
                <span className="text-[11px] text-emerald-700 mt-1 block">Avoided peak tariff surcharge</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70">
                <span className="text-[11px] font-semibold text-blue-600 block uppercase">Avoided Carbon Emissions</span>
                <span className="text-2xl font-extrabold font-mono text-blue-900 mt-1 block">
                  {effectiveLoadShifting.totalCarbonAvoidedMonth.toFixed(1)} kg
                </span>
                <span className="text-[11px] text-blue-700 mt-1 block">Per month via off-peak / solar shift</span>
              </div>
            </div>

            {/* Opportunities Table */}
            <div className="pt-2">
              <span className="font-bold text-xs text-neutral-900 block mb-2">
                Shiftable Flexible Loads & Recommended Windows:
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-neutral-200 rounded-xl overflow-hidden">
                  <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
                    <tr>
                      <th className="py-2.5 px-3">Appliance</th>
                      <th className="py-2.5 px-3">Cycle Energy</th>
                      <th className="py-2.5 px-3">Current Window</th>
                      <th className="py-2.5 px-3">Optimized Window</th>
                      <th className="py-2.5 px-3 text-right">Monthly Savings</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-mono">
                    {effectiveLoadShifting.opportunities.map((opp, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-3 font-sans font-semibold text-neutral-900">
                          {opp.name}
                        </td>
                        <td className="py-3 px-3 text-neutral-700">
                          {opp.typicalKwhPerCycle} kWh
                        </td>
                        <td className="py-3 px-3 text-rose-600 font-bold">
                          {opp.currentSchedule}
                        </td>
                        <td className="py-3 px-3 text-[#00A86B] font-bold">
                          {opp.recommendedSchedule}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-neutral-900">
                          ₹{opp.monthlySavingsInr.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-sans">
                          <button
                            onClick={() => {
                              addSchedule({
                                appliance_id: opp.applianceId,
                                appliance_name: opp.name,
                                action: 'ON',
                                scheduled_time: opp.applianceId === 'GH001' ? '22:30' : '14:00',
                                days_of_week: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
                                is_active: 1
                              });
                              setSceneSuccessToast(`Scheduled optimized off-peak shift for ${opp.name}`);
                              setTimeout(() => setSceneSuccessToast(null), 3000);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00A86B] to-[#059669] text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                          >
                            Apply Shift
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strategic Advice */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs space-y-1.5">
              <span className="font-bold text-[#064e3b] block">Academic Defense Rationale:</span>
              <ul className="space-y-1 text-neutral-700 list-disc list-inside">
                <li>Load shifting curtails peak coincident demand without reducing consumer utility.</li>
                <li>Reduces transmission transformer thermal loading during state grid peak stress hours (18:00–22:00).</li>
                <li>Maximizes financial return on Time-of-Day (TOD) tariff incentives governed by Indian electricity regulatory commissions (BERC/KERC).</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* CREATE SCHEDULE MODAL */}
      {isAddScheduleModalOpen && (
        <div 
          onClick={() => setIsAddScheduleModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-neutral-200 cursor-default animate-fade-in"
          >
            <h3 className="font-bold text-base text-neutral-900 mb-1">Create Automation Schedule</h3>
            <p className="text-xs text-neutral-500 mb-4">Set automated schedules for any appliance</p>

            <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Target Appliance</label>
                <select
                  value={newScheduleAppliance}
                  onChange={(e) => setNewScheduleAppliance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30"
                >
                  {appliances.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewScheduleAction('ON')}
                    className={`py-2 rounded-xl font-bold cursor-pointer transition-all ${
                      newScheduleAction === 'ON' ? 'bg-[#00A86B] text-white shadow-xs' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    Switch ON
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewScheduleAction('OFF')}
                    className={`py-2 rounded-xl font-bold cursor-pointer transition-all ${
                      newScheduleAction === 'OFF' ? 'bg-rose-600 text-white shadow-xs' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    Switch OFF
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Execution Time (24h)</label>
                <input
                  type="time"
                  value={newScheduleTime}
                  onChange={(e) => setNewScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00A86B] to-[#059669] text-white font-bold hover:from-[#047857] hover:to-[#065f46] cursor-pointer shadow-xs"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
