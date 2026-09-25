import aedes from 'aedes';
import { createServer } from 'net';
import mqtt from 'mqtt';
import { SYSTEM_CONFIG } from '../config/constants.js';

export class MQTTBrokerService {
  constructor(simulationEngine) {
    this.simulationEngine = simulationEngine;
    this.aedesInstance = null;
    this.tcpServer = null;
    this.internalClient = null;
    this.isConnected = false;
  }

  start() {
    try {
      this.aedesInstance = aedes();
      this.tcpServer = createServer(this.aedesInstance.handle);

      this.tcpServer.listen(SYSTEM_CONFIG.MQTT_PORT, () => {
        console.log(`[MQTT Broker] Embedded Aedes broker listening on TCP port ${SYSTEM_CONFIG.MQTT_PORT}`);
        this.connectInternalClient();
      });

      this.tcpServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[MQTT Broker] Port ${SYSTEM_CONFIG.MQTT_PORT} in use; falling back to internal pub/sub bridge.`);
        } else {
          console.error('[MQTT Broker] Server error:', err.message);
        }
      });

      this.aedesInstance.on('client', (client) => {
        console.log(`[MQTT Broker] Client connected: ${client ? client.id : 'unknown'}`);
      });

      this.aedesInstance.on('clientDisconnect', (client) => {
        console.log(`[MQTT Broker] Client disconnected: ${client ? client.id : 'unknown'}`);
      });
    } catch (e) {
      console.warn('[MQTT Broker] Initialization fallback:', e.message);
    }
  }

  connectInternalClient() {
    try {
      this.internalClient = mqtt.connect(`mqtt://localhost:${SYSTEM_CONFIG.MQTT_PORT}`, {
        clientId: 'Backend_MQTT_Subscriber',
        clean: true
      });

      this.internalClient.on('connect', () => {
        this.isConnected = true;
        console.log('[MQTT Client] Connected to embedded broker. Subscribing to control & telemetry topics.');

        // Subscribe to relay commands and ESP32 telemetry
        this.internalClient.subscribe(`sensors/${SYSTEM_CONFIG.DEVICE_ID}/telemetry`);
        this.internalClient.subscribe(`devices/${SYSTEM_CONFIG.DEVICE_ID}/command/#`);
      });

      this.internalClient.on('message', (topic, payload) => {
        try {
          if (topic.includes('command/relay')) {
            const data = JSON.parse(payload.toString());
            console.log(`[MQTT Command Received] Topic: ${topic}`, data);
            if (data.applianceId) {
              this.simulationEngine.toggleAppliance(data.applianceId, data.state);
            }
          }
        } catch (e) {
          console.error('[MQTT Message Error]:', e.message);
        }
      });

      // Hook simulation engine telemetry to publish via MQTT
      this.simulationEngine.on('telemetry:sample', (telemetry) => {
        if (this.isConnected && this.internalClient) {
          const topic = `sensors/${telemetry.deviceId}/telemetry`;
          this.internalClient.publish(topic, JSON.stringify({
            deviceId: telemetry.deviceId,
            timestamp: telemetry.timestamp,
            totalPower: telemetry.totalActivePower,
            voltage: telemetry.gridVoltage,
            energyToday: telemetry.totalEnergyTodayKwh,
            appliancesCount: telemetry.appliances.length
          }));
        }
      });
    } catch (e) {
      console.warn('[MQTT Client] Connection warning:', e.message);
    }
  }

  publishRelayCommand(applianceId, state) {
    if (this.isConnected && this.internalClient) {
      const topic = `devices/${SYSTEM_CONFIG.DEVICE_ID}/command/relay`;
      this.internalClient.publish(topic, JSON.stringify({
        applianceId,
        state,
        timestamp: new Date().toISOString()
      }));
    }
  }
}
