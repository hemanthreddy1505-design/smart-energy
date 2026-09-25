import React from 'react';
import { X, CheckCircle2, ArrowRight, GraduationCap } from 'lucide-react';

export function AcademicMappingModal({ isOpen, onClose }) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const mapping = [
    {
      physical: 'CT Clamp Sensor (SCT-013) & Voltage Transformer',
      simulated: 'Virtual Energy Sensor Module',
      details: 'Calculates RMS Voltage (230V ± noise), RMS Current (I = P/(V*PF)), Power Factor (cos φ), Active Power (P), Apparent Power (S), Reactive Power (Q), and Cumulative Energy (kWh).'
    },
    {
      physical: 'ESP32 Microcontroller / Edge Gateway',
      simulated: 'Virtual IoT Controller (ESP32-SIM-001)',
      details: 'Emulates FreeRTOS dual-core firmware, ADC sampling at 1-sec intervals, GPIO relay actuation, Wi-Fi RSSI signal sway, and MQTT telemetry publishing.'
    },
    {
      physical: '5V/12V Relay Module / Smart Plug',
      simulated: 'Virtual Relay Actuation Subsystem',
      details: 'Software switches virtual appliance circuits between OPEN (0W) and CLOSED (active load), updating local cache and synchronizing across clients.'
    },
    {
      physical: 'Physical Home Appliances (AC, Geyser, etc.)',
      simulated: '8 Mathematical Virtual Appliance Models',
      details: 'State machines simulating inverter compressor ramps, refrigerator cooling duty cycles, dynamic PC workloads, LED drivers, and thermostat shutoffs.'
    },
    {
      physical: 'Cloud MQTT Broker (HiveMQ / AWS IoT Core)',
      simulated: 'Embedded Aedes MQTT Broker (Port 1883)',
      details: 'Standard MQTT 3.1.1 compliant message broker routing telemetry on sensors/ESP32-SIM-001/telemetry and commands on devices/ESP32-SIM-001/command/relay.'
    },
    {
      physical: 'Cloud Time-Series Database (InfluxDB / Timescale)',
      simulated: 'SQLite Embedded Time-Series Engine (WAL Mode)',
      details: 'High-speed write throughput storing instantaneous telemetry records, daily analytics, anomaly alerts, and scheduled automations.'
    },
    {
      physical: 'Android Native Mobile Application',
      simulated: 'Native Android App + Web Client',
      details: 'Android Java app with Retrofit 2 and Socket.IO client, synchronizing live telemetry and relay states under 50ms over local Wi-Fi.'
    }
  ];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-fade-in cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-neutral-200/90 rounded-[32px] shadow-2xl p-6 sm:p-8 text-neutral-900 flex flex-col overflow-hidden cursor-default"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Project Specification (22CSE74)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Physical Hardware vs. Software Simulation Mapping
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Department of CSE, New Horizon College of Engineering (NHCE) | Major Project Phase-II
          </p>
        </div>

        {/* Scrollable Mapping Table */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {mapping.map((m, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 hover:bg-neutral-100/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <strong className="text-xs sm:text-sm font-bold text-neutral-900">{m.physical}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-100/60 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                  <ArrowRight className="w-3 h-3 text-emerald-600" />
                  <span>{m.simulated}</span>
                </div>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed pl-4">
                {m.details}
              </p>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
          <span>Simulation Engine active on Port 5000</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
