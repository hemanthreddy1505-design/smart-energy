import React, { useState, useEffect } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  Wifi,
  Cpu,
  Server,
  Radio,
  Terminal,
  ShieldCheck,
  Activity,
  ArrowRight,
  Database,
  Layers,
  Smartphone
} from 'lucide-react';

export function IoTNetworkView() {
  const { telemetry, backendUrl, networkInfo } = useEnergy();
  const [mqttPackets, setMqttPackets] = useState([]);

  // Generate packet logs based on live telemetry updates
  useEffect(() => {
    const packet = {
      timestamp: new Date().toISOString(),
      topic: 'smartenergy/telemetry/ESP32-SIM-001',
      qos: 0,
      payload: {
        dev: 'ESP32-SIM-001',
        v: Number(telemetry.gridVoltage.toFixed(1)),
        p: telemetry.totalActivePower,
        i: Number(telemetry.totalCurrent.toFixed(2)),
        pf: Number(telemetry.systemPowerFactor.toFixed(2)),
        kwh: Number(telemetry.totalEnergyTodayKwh.toFixed(3)),
        heap: 184320
      }
    };

    setMqttPackets(prev => [packet, ...prev.slice(0, 19)]);
  }, [telemetry]);

  return (
    <div className="space-y-6">

      {/* TOP HEADER */}
      <div className="glass-card rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/80 shadow-card">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#00A86B]" />
            IoT Edge Gateway & Sensor Pipeline
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Microcontroller telemetry stream, Aedes broker topology, and packet monitor
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#E8F8F0] text-[#00A86B] border border-[#00A86B]/20">
            <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse"></span>
            ESP32 Gateway: ONLINE
          </span>
        </div>
      </div>

      {/* GATEWAY HARDWARE & BROKER STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ESP32 Edge Gateway */}
        <div className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#061C16] text-[#19C37D] flex items-center justify-center shadow-xs">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900">ESP32 Edge Microcontroller</h3>
                <span className="text-xs text-neutral-400 font-mono">ID: ESP32-SIM-001</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E8F8F0] text-[#00A86B] border border-[#00A86B]/20">
              CONNECTED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">SOC HARDWARE</span>
              <span className="font-bold text-neutral-800">ESP32-WROOM-32D</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">CLOCK FREQUENCY</span>
              <span className="font-bold text-neutral-800">240 MHz Dual Core</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">WI-FI RSSI</span>
              <span className="font-bold text-[#00A86B]">-56 dBm (5 GHz)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">FREE SRAM HEAP</span>
              <span className="font-bold text-neutral-800">184,320 Bytes</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">STATIC IP</span>
              <span className="font-bold text-neutral-800">192.168.1.145</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">ADC CONVERTER</span>
              <span className="font-bold text-neutral-800">ADS1115 (16-Bit I2C)</span>
            </div>
          </div>
        </div>

        {/* Embedded Aedes MQTT Broker */}
        <div className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#061C16] text-[#19C37D] flex items-center justify-center shadow-xs">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900">Aedes MQTT Telemetry Broker</h3>
                <span className="text-xs text-neutral-400 font-mono">Broker: {networkInfo?.localIp || '192.168.1.42'}:1883</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              ACTIVE :1883
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">TCP PORT</span>
              <span className="font-bold text-neutral-800">1883 (Standard MQTT)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">WEBSOCKET PORT</span>
              <span className="font-bold text-neutral-800">9001 (WSS Bridge)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">ACTIVE CLIENTS</span>
              <span className="font-bold text-neutral-800">2 Connected</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">TELEMETRY TOPIC</span>
              <span className="font-bold text-neutral-800 truncate block">smartenergy/telemetry/#</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">COMMAND TOPIC</span>
              <span className="font-bold text-neutral-800 truncate block">smartenergy/commands/#</span>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <span className="text-[10px] text-neutral-400 block font-sans">DATABASE STORE</span>
              <span className="font-bold text-[#00A86B]">SQLite WAL Mode</span>
            </div>
          </div>
        </div>

      </div>

      {/* ARCHITECTURAL TOPOLOGY PIPELINE */}
      <div className="glass-card rounded-[20px] p-5 sm:p-6 border border-white/80 shadow-card space-y-4">
        <div>
          <h3 className="font-bold text-sm text-neutral-900">End-to-End System Topology (Physical to Virtual Mapping)</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-1">
          
          <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80 text-center">
            <span className="w-7 h-7 rounded-lg bg-neutral-200 text-neutral-800 flex items-center justify-center font-bold text-xs mx-auto mb-1.5">
              1
            </span>
            <span className="font-bold text-xs text-neutral-900 block">Main Power Input</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">230V AC 50Hz</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-center">
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs mx-auto mb-1.5">
              2
            </span>
            <span className="font-bold text-xs text-neutral-900 block">SCT-013 Clamps</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Non-invasive CT</span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 text-center">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs mx-auto mb-1.5">
              3
            </span>
            <span className="font-bold text-xs text-neutral-900 block">ADS1115 + ESP32</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">RMS Integration</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-center">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs mx-auto mb-1.5">
              4
            </span>
            <span className="font-bold text-xs text-neutral-900 block">Aedes MQTT</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Port 1883 Broker</span>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/80 text-center">
            <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs mx-auto mb-1.5">
              5
            </span>
            <span className="font-bold text-xs text-neutral-900 block">Backend Engine</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Node.js + SQLite</span>
          </div>

          <div className="p-3 rounded-xl bg-[#E8F8F0] border border-[#00A86B]/30 text-center">
            <span className="w-7 h-7 rounded-lg bg-[#00A86B] text-white flex items-center justify-center font-bold text-xs mx-auto mb-1.5 shadow-xs">
              6
            </span>
            <span className="font-bold text-xs text-neutral-900 block">EMS Dashboard</span>
            <span className="text-[10px] text-[#00A86B] font-bold block mt-0.5">React + Android APK</span>
          </div>

        </div>
      </div>

      {/* LIVE MQTT RAW PACKET STREAM TERMINAL */}
      <div className="p-5 rounded-[20px] bg-[#061C16] text-neutral-200 border border-white/10 shadow-2xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-neutral-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#19C37D]" />
            <span className="font-bold text-white">Live MQTT Packet Stream Monitor</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 text-[10px] border border-white/10">
              QoS 0 · Unencrypted Local Sub
            </span>
          </div>
          <span className="text-[10px] text-[#19C37D] font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#19C37D] animate-pulse"></span> STREAMING
          </span>
        </div>

        <div className="h-56 overflow-y-auto space-y-1.5 text-[11px] pr-2 sidebar-scroll">
          {mqttPackets.map((pkt, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-black/40 border border-white/5 hover:border-white/20">
              <div className="flex items-center justify-between text-neutral-400 text-[10px] mb-1">
                <span className="text-[#19C37D] font-semibold">{pkt.topic}</span>
                <span>{pkt.timestamp}</span>
              </div>
              <div className="text-neutral-300">
                {JSON.stringify(pkt.payload)}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
