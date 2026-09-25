import EventEmitter from 'events';
import { db } from '../config/database.js';

export class AnomalyService extends EventEmitter {
  constructor(simulationEngine) {
    super();
    this.simulationEngine = simulationEngine;
    this.alertCooldowns = new Map(); // key -> last alert timestamp

    // Listen to simulation ticks
    this.simulationEngine.on('telemetry:sample', (telemetry) => {
      this.evaluate(telemetry);
    });
  }

  evaluate(telemetry) {
    const now = Date.now();

    for (const item of telemetry.appliances) {
      const reading = item.reading;
      if (!reading || reading.status === 'OFF') continue;

      // 1. High Power Consumption / Anomaly Check
      if (item.isAnomaly || (item.maxPower && reading.activePower > item.maxPower * 1.25)) {
        this.triggerAlert({
          applianceId: item.id,
          alertType: 'HIGH_POWER_CONSUMPTION',
          severity: 'CRITICAL',
          message: `Abnormal power consumption detected on ${item.name}: Drawing ${reading.activePower}W (Normal Max: ${item.maxPower}W). Possible compressor or motor fault.`,
          value: reading.activePower,
          threshold: item.maxPower
        });
      }

      // 2. Prolonged Operation (e.g. Water Heater left ON continuously)
      if (item.id === 'GH001' && item.continuousOnSeconds > 2700) {
        this.triggerAlert({
          applianceId: item.id,
          alertType: 'PROLONGED_RUN',
          severity: 'WARNING',
          message: `Water Heater has been active continuously for ${Math.round(item.continuousOnSeconds / 60)} minutes. Risk of unnecessary energy loss.`,
          value: Math.round(item.continuousOnSeconds / 60),
          threshold: 45
        });
      }

      // 3. Workstation PC prolonged unattended run
      if (item.id === 'PC001' && item.continuousOnSeconds > 21600) { // 6 hours
        this.triggerAlert({
          applianceId: item.id,
          alertType: 'PROLONGED_RUN',
          severity: 'INFO',
          message: `Workstation PC active for ${Math.round(item.continuousOnSeconds / 3600)} hours. Consider placing into sleep mode.`,
          value: Math.round(item.continuousOnSeconds / 3600),
          threshold: 6
        });
      }
    }

    // 4. System-level Total Demand Anomaly (> 4500W residential threshold)
    if (telemetry.totalActivePower > 4500) {
      this.triggerAlert({
        applianceId: 'SYSTEM',
        alertType: 'PEAK_LOAD_WARNING',
        severity: 'WARNING',
        message: `High concurrent demand: Total building load is ${telemetry.totalActivePower}W, nearing sanctioned domestic limit (5kW).`,
        value: telemetry.totalActivePower,
        threshold: 4500
      });
    }
  }

  triggerAlert({ applianceId, alertType, severity, message, value, threshold }) {
    const cooldownKey = `${applianceId}_${alertType}`;
    const lastAlert = this.alertCooldowns.get(cooldownKey) || 0;
    const now = Date.now();

    // 60-second cooldown per alert type broadcast
    if (now - lastAlert < 60000) return;
    this.alertCooldowns.set(cooldownKey, now);

    try {
      // Deduplication: check if an UNRESOLVED alert of the same type already exists for this appliance
      const existingAlert = db.prepare(`
        SELECT id, message, value, timestamp 
        FROM alerts 
        WHERE appliance_id = ? AND alert_type = ? AND is_resolved = 0
        ORDER BY id DESC LIMIT 1
      `).get(applianceId, alertType);

      if (existingAlert) {
        // Update existing active alert timestamp and value rather than spamming duplicate records
        db.prepare(`
          UPDATE alerts 
          SET message = ?, value = ?, timestamp = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(message, value, existingAlert.id);

        const updatedAlert = {
          id: existingAlert.id,
          applianceId,
          alertType,
          severity,
          message,
          value,
          threshold,
          isResolved: false,
          timestamp: new Date().toISOString()
        };
        this.emit('alert:updated', updatedAlert);
        return;
      }

      // If no unresolved alert exists, create a new one
      const stmt = db.prepare(`
        INSERT INTO alerts (appliance_id, alert_type, severity, message, value, threshold, is_resolved)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `);
      const info = stmt.run(applianceId, alertType, severity, message, value, threshold);

      const alertObject = {
        id: info.lastInsertRowid,
        applianceId,
        alertType,
        severity,
        message,
        value,
        threshold,
        isResolved: false,
        timestamp: new Date().toISOString()
      };

      console.log(`[Anomaly Detection] ⚠️ ${severity} Alert: ${message}`);
      this.emit('alert:new', alertObject);
    } catch (e) {
      console.error('[AnomalyService] Error storing alert:', e.message);
    }
  }

  getAlerts(limit = 50) {
    try {
      return db.prepare(`
        SELECT a.*, ap.name as appliance_name 
        FROM alerts a
        LEFT JOIN appliances ap ON a.appliance_id = ap.id
        ORDER BY a.timestamp DESC 
        LIMIT ?
      `).all(limit);
    } catch (e) {
      console.error('[AnomalyService] Get alerts error:', e.message);
      return [];
    }
  }

  resolveAlert(alertId) {
    try {
      db.prepare('UPDATE alerts SET is_resolved = 1 WHERE id = ?').run(alertId);
      return true;
    } catch (e) {
      console.error('[AnomalyService] Resolve alert error:', e.message);
      return false;
    }
  }
}
