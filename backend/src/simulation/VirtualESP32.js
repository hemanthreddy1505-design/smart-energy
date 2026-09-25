import os from 'os';
import { SYSTEM_CONFIG } from '../config/constants.js';

/**
 * Virtual IoT Controller (ESP32-SIM-001)
 * Simulates micro-controller firmware, GPIO relay actuators, ADC sampling, Wi-Fi stack & MQTT.
 */
export class VirtualESP32 {
  constructor(deviceId = SYSTEM_CONFIG.DEVICE_ID) {
    this.deviceId = deviceId;
    this.status = 'ONLINE';
    this.bootTimestamp = Date.now();
    this.firmwareVersion = 'v2.4.1-tracker-sim';
    this.chipModel = 'ESP32-D0WDQ6 (Dual Core 240MHz)';
    this.macAddress = '84:CC:A8:92:B1:4C';
    this.freeHeapBytes = 184512;
    this.wifiRssi = -62; // dBm (Strong Wi-Fi signal)
    this.protocol = 'MQTT over TCP (1883) + HTTP/WS';
    this.totalSamplesSent = 0;
  }

  getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        // Skip internal (i.e. 127.0.0.1) and non-ipv4
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  }

  getStatus() {
    const uptimeSeconds = Math.floor((Date.now() - this.bootTimestamp) / 1000);
    // Slight realistic fluctuation in Wi-Fi signal RSSI
    this.wifiRssi = -60 - Math.floor(Math.random() * 5);
    this.freeHeapBytes = 184000 + Math.floor(Math.sin(uptimeSeconds * 0.1) * 3000);

    return {
      deviceId: this.deviceId,
      status: this.status,
      chipModel: this.chipModel,
      firmware: this.firmwareVersion,
      macAddress: this.macAddress,
      ipAddress: this.getLocalIP(),
      wifiSsid: 'SmartEnergy_WLAN',
      wifiRssi: `${this.wifiRssi} dBm`,
      freeHeap: `${Math.round(this.freeHeapBytes / 1024)} KB`,
      uptimeSeconds,
      uptimeFormatted: this.formatUptime(uptimeSeconds),
      protocol: this.protocol,
      totalSamplesSent: this.totalSamplesSent,
      lastHeartbeat: new Date().toISOString()
    };
  }

  formatUptime(totalSecs) {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  }

  executeRelayCommand(appliance, targetState) {
    const previousState = appliance.isOn;
    const newState = appliance.toggle(targetState);
    console.log(`[ESP32] Relay Actuated -> Appliance: ${appliance.id} (${appliance.name}) | ${previousState ? 'ON' : 'OFF'} -> ${newState ? 'ON' : 'OFF'}`);
    return {
      deviceId: this.deviceId,
      applianceId: appliance.id,
      relayPin: `GPIO_${appliance.id.charCodeAt(0) % 32}`,
      previousState,
      newState,
      timestamp: new Date().toISOString()
    };
  }

  incrementSampleCounter() {
    this.totalSamplesSent += 1;
  }
}
