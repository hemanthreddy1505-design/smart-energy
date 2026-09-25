import React, { useState, useEffect } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { 
  CalendarClock, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar,
  X
} from 'lucide-react';

export function SchedulesView() {
  const { schedules, appliances, addSchedule, toggleSchedule, deleteSchedule } = useEnergy();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);
  const [selectedAppliance, setSelectedAppliance] = useState(appliances[0]?.id || 'AC001');
  const [action, setAction] = useState('OFF');
  const [time, setTime] = useState('23:00');
  const [selectedDays, setSelectedDays] = useState(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);

  const daysList = [
    { id: 'MON', label: 'Mon' },
    { id: 'TUE', label: 'Tue' },
    { id: 'WED', label: 'Wed' },
    { id: 'THU', label: 'Thu' },
    { id: 'FRI', label: 'Fri' },
    { id: 'SAT', label: 'Sat' },
    { id: 'SUN', label: 'Sun' },
  ];

  const handleToggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== dayId));
      }
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    await addSchedule({
      applianceId: selectedAppliance,
      action,
      time,
      days: selectedDays
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            Automated Schedules & Load Shedding
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure time-of-day automation rules executed autonomously by the Virtual IoT Controller
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Schedule</span>
        </button>
      </div>

      {/* Schedules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedules.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-neutral-50 border border-neutral-200/80 rounded-2xl">
            <Calendar className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-neutral-800">No Active Automation Schedules</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Add automated ON/OFF rules to eliminate standby losses during night or peak-tariff periods.
            </p>
          </div>
        ) : (
          schedules.map((sch) => {
            let daysArr = [];
            try {
              daysArr = typeof sch.days === 'string' ? JSON.parse(sch.days) : sch.days;
            } catch (e) {
              daysArr = ['Daily'];
            }

            return (
              <div
                key={sch.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  sch.is_active
                    ? 'bg-white border-neutral-200/90 shadow-xs hover:shadow-md'
                    : 'bg-neutral-50/70 border-neutral-200/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        sch.action === 'ON' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        TURN {sch.action}
                      </span>
                      <h4 className="font-bold text-sm text-neutral-900 truncate max-w-[150px]">
                        {sch.appliance_name || sch.appliance_id}
                      </h4>
                    </div>

                    <button
                      onClick={() => deleteSchedule(sch.id)}
                      className="p-1 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Scheduled Time */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-2xl font-extrabold font-mono text-neutral-900 tracking-tight">
                      {sch.time}
                    </span>
                    <span className="text-xs text-neutral-500">
                      ({sch.days?.length === 7 ? 'Every day' : `${daysArr.length} days/week`})
                    </span>
                  </div>

                  {/* Days Chips */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {daysList.map((d) => {
                      const isSelected = daysArr.includes(d.id);
                      return (
                        <span
                          key={d.id}
                          className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                            isSelected
                              ? 'bg-neutral-900 text-white font-semibold'
                              : 'bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          {d.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Footer toggle */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    Status: <strong className={sch.is_active ? 'text-emerald-600 font-semibold' : 'text-neutral-400'}>
                      {sch.is_active ? 'Active' : 'Disabled'}
                    </strong>
                  </span>

                  <button
                    onClick={() => toggleSchedule(sch.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      sch.is_active
                        ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {sch.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Schedule Modal Dialog */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white border border-neutral-200 rounded-[32px] shadow-2xl p-6 text-neutral-900 cursor-default"
          >
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-neutral-900 mb-1">Create Automation Schedule</h3>
            <p className="text-xs text-neutral-500 mb-4">Command will be triggered autonomously by ESP32-SIM-001</p>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              
              {/* Select Appliance */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Select Appliance</label>
                <select
                  value={selectedAppliance}
                  onChange={(e) => setSelectedAppliance(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {appliances.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAction('OFF')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      action === 'OFF'
                        ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-400/40'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    TURN OFF
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction('ON')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      action === 'ON'
                        ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400/40'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    TURN ON
                  </button>
                </div>
              </div>

              {/* Time Picker */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Trigger Time (24h)</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 font-mono text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Repeat Days */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1.5">Repeat Days</label>
                <div className="flex gap-1 justify-between">
                  {daysList.map((d) => {
                    const isSelected = selectedDays.includes(d.id);
                    return (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => handleToggleDay(d.id)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-900 text-white font-extrabold shadow-xs'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white cursor-pointer shadow-xs"
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
