import { SYSTEM_CONFIG } from '../config/constants.js';

/**
 * Virtual Energy Sensor (Simulates CT Clamp + Voltage Transformer / PZEM-004T)
 * Computes root-mean-square voltage, current, active power, apparent power, and kWh.
 */
export class VirtualEnergySensor {
  constructor(applianceId, initialEnergyKwh = 0) {
    this.applianceId = applianceId;
    this.cumulativeEnergyKwh = initialEnergyKwh;
    this.lastReading = null;
  }

  /**
   * Samples electrical characteristics for an appliance
   * @param {VirtualAppliance} appliance
   * @param {number} deltaSeconds - Elapsed seconds since last sample (multiplied by speed)
   * @param {number} gridVoltage - Instantaneous grid voltage
   */
  sample(appliance, deltaSeconds, gridVoltage) {
    const activePowerW = appliance.calculatePower(Date.now() / 1000, deltaSeconds);
    const powerFactor = appliance.isOn && activePowerW > 0 ? appliance.powerFactor : 1.0;

    // Voltage with slight local wiring drop if high current
    const localVoltage = gridVoltage - (activePowerW / 1000) * 0.4;

    // Current (I = P / (V * PF))
    const currentA = activePowerW > 0 ? activePowerW / (localVoltage * powerFactor) : 0.0;

    // Apparent Power (S = V * I) in Volt-Amperes (VA)
    const apparentPowerVA = localVoltage * currentA;

    // Reactive Power (Q = sqrt(S^2 - P^2)) in VAR
    const reactivePowerVAR = Math.sqrt(Math.max(0, Math.pow(apparentPowerVA, 2) - Math.pow(activePowerW, 2)));

    // Energy delta in kWh = Power (kW) * time (hours)
    // = (activePowerW / 1000) * (deltaSeconds / 3600)
    const energyDeltaKwh = (activePowerW * deltaSeconds) / (1000 * 3600);
    this.cumulativeEnergyKwh += energyDeltaKwh;

    this.lastReading = {
      sensorType: 'Simulated CT Clamp & Voltage Sensor',
      applianceId: this.applianceId,
      voltage: Number(localVoltage.toFixed(1)),
      current: Number(currentA.toFixed(2)),
      powerFactor: Number(powerFactor.toFixed(2)),
      activePower: Number(activePowerW.toFixed(1)),
      apparentPower: Number(apparentPowerVA.toFixed(1)),
      reactivePower: Number(reactivePowerVAR.toFixed(1)),
      energyDeltaKwh: Number(energyDeltaKwh.toFixed(6)),
      cumulativeEnergyKwh: Number(this.cumulativeEnergyKwh.toFixed(4)),
      status: appliance.isOn ? 'ON' : 'OFF',
      isAnomaly: appliance.isAnomaly,
      timestamp: new Date().toISOString()
    };

    return this.lastReading;
  }

  resetEnergy(newBase = 0) {
    this.cumulativeEnergyKwh = newBase;
  }
}
