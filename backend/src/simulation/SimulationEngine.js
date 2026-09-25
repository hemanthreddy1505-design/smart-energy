import EventEmitter from 'events';
import { SYSTEM_CONFIG, INITIAL_APPLIANCES } from '../config/constants.js';
import { db } from '../config/database.js';
import { VirtualAppliance } from './VirtualAppliance.js';
import { VirtualEnergySensor } from './VirtualSensor.js';
import { VirtualESP32 } from './VirtualESP32.js';

export class SimulationEngine extends EventEmitter {
  constructor() {
    super();
    this.speedMultiplier = 1;
    this.isPaused = false;
    this.appliances = new Map();
    this.sensors = new Map();
    this.esp32 = new VirtualESP32();
    this.liveHistory = []; // Rolling window for real-time charts (30 points)
    this.intervalId = null;
    this.tickCounter = 0;
    this.activeUserId = 'usr_dhanush';
    this.activeUser = null;

    // Load initial settings
    this.tariff = SYSTEM_CONFIG.DEFAULT_TARIFF;
    this.carbonFactor = SYSTEM_CONFIG.DEFAULT_CARBON_FACTOR;

    this.init();
  }

  init() {
    // Read tariffs and settings from DB
    try {
      const tariffRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('tariff_per_kwh');
      if (tariffRow) this.tariff = parseFloat(tariffRow.value);

      const carbonRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('carbon_factor');
      if (carbonRow) this.carbonFactor = parseFloat(carbonRow.value);

      const speedRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('sim_speed');
      if (speedRow) this.speedMultiplier = parseInt(speedRow.value, 10);
    } catch (e) {
      console.warn('[SimulationEngine] Settings load warning:', e.message);
    }

    // Load appliances from DB or fallback
    let dbApps = [];
    try {
      dbApps = db.prepare('SELECT * FROM appliances').all();
    } catch (e) {
      console.warn('[SimulationEngine] DB appliances read error:', e.message);
    }

    if (dbApps.length === 0) {
      dbApps = INITIAL_APPLIANCES.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        location: a.location,
        rated_power: a.ratedPower,
        min_power: a.minPower,
        max_power: a.maxPower,
        power_factor: a.powerFactor,
        is_on: a.isOn ? 1 : 0,
        is_anomaly: 0,
        total_energy_kwh: 0,
        total_runtime_seconds: 0
      }));
    }

    for (const appRow of dbApps) {
      const app = new VirtualAppliance({
        id: appRow.id,
        name: appRow.name,
        type: appRow.type,
        location: appRow.location,
        ratedPower: appRow.rated_power,
        minPower: appRow.min_power,
        maxPower: appRow.max_power,
        powerFactor: appRow.power_factor,
        isOn: Boolean(appRow.is_on),
        isAnomaly: Boolean(appRow.is_anomaly),
        total_runtime_seconds: appRow.total_runtime_seconds || 0
      });
      this.appliances.set(app.id, app);

      const sensor = new VirtualEnergySensor(app.id, appRow.total_energy_kwh || 0);
      this.sensors.set(app.id, sensor);
    }

    console.log(`[SimulationEngine] Initialized with ${this.appliances.size} virtual appliances and sensors.`);
    this.loadActiveUser(this.activeUserId);
  }

  loadActiveUser(userId) {
    this.activeUserId = userId;
    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      if (user) {
        this.activeUser = user;
      } else {
        this.activeUser = {
          id: userId,
          name: 'Resident',
          door_no: 'Domestic',
          consumer_id: 'BESCOM-RES',
          base_monthly_kwh: 120.0,
          daily_avg_kwh: 4.0,
          comparison_pct: -8.4
        };
      }

      // Restore user-specific relay states and cumulative energy for each sensor
      const states = db.prepare('SELECT * FROM user_appliance_states WHERE user_id = ?').all(userId);
      for (const st of states) {
        const app = this.appliances.get(st.appliance_id);
        if (app) {
          app.isOn = Boolean(st.is_on);
          app.runtimeSeconds = st.runtime_seconds || 0;
        }
        const sensor = this.sensors.get(st.appliance_id);
        if (sensor) {
          sensor.cumulativeEnergyKwh = Number(st.cumulative_energy_kwh || 0);
        }
      }

      console.log(`[SimulationEngine] 👤 Active resident: ${this.activeUser.name} (${this.activeUser.door_no}) - Base Monthly: ${this.activeUser.base_monthly_kwh} kWh`);
      this.emit('user:switched', { user: this.activeUser });
    } catch (e) {
      console.warn('[SimulationEngine] Error loading active user:', e.message);
    }
  }

  start() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.tick(), SYSTEM_CONFIG.SAMPLE_INTERVAL_MS);
    console.log(`[SimulationEngine] Started simulation clock (sampling every ${SYSTEM_CONFIG.SAMPLE_INTERVAL_MS}ms, speed: ${this.speedMultiplier}x).`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setSpeed(multiplier) {
    this.speedMultiplier = Math.max(1, Math.min(100, multiplier));
    try {
      db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(String(this.speedMultiplier), 'sim_speed');
    } catch (e) {
      console.error('[SimulationEngine] Error saving sim_speed:', e.message);
    }
    this.emit('speed:changed', this.speedMultiplier);
    return this.speedMultiplier;
  }

  pause() {
    this.isPaused = true;
    this.emit('state:paused');
  }

  resume() {
    this.isPaused = false;
    this.emit('state:resumed');
  }

  toggleAppliance(id, targetState = null) {
    const app = this.appliances.get(id);
    if (!app) return null;

    const relayResult = this.esp32.executeRelayCommand(app, targetState);

    // Update in database
    try {
      db.prepare('UPDATE appliances SET is_on = ?, is_anomaly = ? WHERE id = ?')
        .run(app.isOn ? 1 : 0, app.isAnomaly ? 1 : 0, app.id);
    } catch (e) {
      console.error('[SimulationEngine] Error updating appliance state in DB:', e.message);
    }

    this.emit('appliance:toggled', {
      appliance: app.toJSON(),
      relayResult
    });

    return app.toJSON();
  }

  setApplianceAnomaly(id, isAnomaly = true) {
    const app = this.appliances.get(id);
    if (!app) return null;

    app.setAnomaly(isAnomaly);
    try {
      db.prepare('UPDATE appliances SET is_anomaly = ?, is_on = ? WHERE id = ?')
        .run(app.isAnomaly ? 1 : 0, app.isOn ? 1 : 0, app.id);
    } catch (e) {
      console.error('[SimulationEngine] Error saving anomaly in DB:', e.message);
    }

    this.emit('appliance:anomaly_triggered', {
      appliance: app.toJSON(),
      isAnomaly
    });

    return app.toJSON();
  }

  applyScenario(scenarioName) {
    console.log(`[SimulationEngine] 🔬 Applying scenario: ${scenarioName}`);
    switch (scenarioName) {
      case 'normal':
        // Reset all anomalies, set standard residential baseline
        for (const app of this.appliances.values()) {
          app.isAnomaly = false;
        }
        this.toggleAppliance('AC001', true);
        this.toggleAppliance('FR001', true);
        this.toggleAppliance('TV001', true);
        this.toggleAppliance('PC001', true);
        this.toggleAppliance('LT001', true);
        this.toggleAppliance('FN001', true);
        this.toggleAppliance('WM001', false);
        this.toggleAppliance('GH001', false);
        return { scenario: 'normal', description: 'Standard Residential Baseline (Approx 1.8 kW)' };

      case 'high_demand':
        // Concurrent heavy loads: AC + Geyser + Washer + PC
        for (const app of this.appliances.values()) {
          app.isAnomaly = false;
        }
        this.toggleAppliance('AC001', true);
        this.toggleAppliance('GH001', true);
        this.toggleAppliance('WM001', true);
        this.toggleAppliance('PC001', true);
        this.toggleAppliance('FR001', true);
        return { scenario: 'high_demand', description: 'High Concurrent Demand Surge (> 4.5 kW peak, nears sanctioned domestic limit)' };

      case 'peak_hour':
        // Evening peak window (18:00 - 22:00) with surcharge
        this.toggleAppliance('AC001', true);
        this.toggleAppliance('TV001', true);
        this.toggleAppliance('LT001', true);
        this.toggleAppliance('GH001', true);
        return { scenario: 'peak_hour', description: 'Evening Peak Tariff Window (18:00 - 22:00, 1.25x tariff surcharge applied)' };

      case 'anomaly':
        // Air Conditioner compressor motor winding fault
        this.toggleAppliance('AC001', true);
        this.setApplianceAnomaly('AC001', true);
        return { scenario: 'anomaly', description: 'AC Compressor Fault Anomaly Injected (Excessive power draw > 2.2 kW)' };

      case 'eco_mode':
        // Energy conservation mode: Geyser & Washer shed, AC on eco
        this.toggleAppliance('GH001', false);
        this.toggleAppliance('WM001', false);
        this.toggleAppliance('TV001', false);
        return { scenario: 'eco_mode', description: 'Eco Conservation Mode (Non-critical flexible loads shed)' };

      default:
        return { scenario: 'unknown', description: 'Unknown scenario' };
    }
  }

  reset() {
    for (const sensor of this.sensors.values()) {
      sensor.resetEnergy(0);
    }
    for (const app of this.appliances.values()) {
      app.continuousOnSeconds = 0;
      app.isAnomaly = false;
    }
    this.liveHistory = [];
    try {
      db.prepare('UPDATE appliances SET total_energy_kwh = 0, is_anomaly = 0').run();
      db.prepare('DELETE FROM alerts').run();
      db.prepare('DELETE FROM sensor_readings').run();
    } catch (e) {
      console.error('[SimulationEngine] Reset DB error:', e.message);
    }
    this.emit('simulation:reset');
  }

  /**
   * Main simulation tick cycle (executed every 1 second)
   */
  tick() {
    if (this.isPaused) return;

    this.tickCounter += 1;
    this.esp32.incrementSampleCounter();

    // Effective elapsed seconds in this tick based on speed multiplier
    const deltaSeconds = 1 * this.speedMultiplier;

    // Grid voltage calculation with realistic sinusoidal grid load sway and random noise
    const gridTime = (Date.now() / 10000);
    const gridVoltage = SYSTEM_CONFIG.BASE_VOLTAGE + 
      Math.sin(gridTime) * SYSTEM_CONFIG.VOLTAGE_VARIATION + 
      (Math.random() - 0.5) * 0.8;

    let totalActivePower = 0;
    let totalApparentPower = 0;
    let totalEnergyTodayKwh = 0;
    const applianceReadings = [];

    // Sample all virtual sensors
    for (const [id, app] of this.appliances.entries()) {
      const sensor = this.sensors.get(id);
      const reading = sensor.sample(app, deltaSeconds, gridVoltage);

      totalActivePower += reading.activePower;
      totalApparentPower += reading.apparentPower;
      totalEnergyTodayKwh += reading.cumulativeEnergyKwh;

      applianceReadings.push({
        ...app.toJSON(),
        reading
      });
    }

    // Weighted system power factor
    const systemPowerFactor = totalApparentPower > 0 
      ? Math.min(1.0, Math.max(0.7, totalActivePower / totalApparentPower))
      : 1.0;

    // Peak-hour determination (6 PM - 10 PM)
    const currentHour = new Date().getHours();
    const isPeakHour = currentHour >= 18 && currentHour <= 22;
    const effectiveTariff = isPeakHour 
      ? this.tariff * SYSTEM_CONFIG.PEAK_TARIFF_MULTIPLIER 
      : this.tariff;

    const estimatedCost = totalEnergyTodayKwh * effectiveTariff;
    const carbonKg = totalEnergyTodayKwh * this.carbonFactor;

    const activeCount = applianceReadings.filter(a => a.isOn).length;
    const totalCount = applianceReadings.length;
    const baseMonthly = this.activeUser?.base_monthly_kwh || 120.0;
    const monthlyKwh = Number((totalEnergyTodayKwh + baseMonthly).toFixed(1));
    const estimatedBill = Number((monthlyKwh * effectiveTariff).toFixed(0));
    const dailyAverageKwh = this.activeUser?.daily_avg_kwh || Number((monthlyKwh / 23).toFixed(2));
    const comparisonPct = this.activeUser?.comparison_pct !== undefined ? this.activeUser.comparison_pct : -8.4;
    const monthlyUsage = {
      kwh: monthlyKwh,
      estimatedBill: estimatedBill,
      dailyAverageKwh: dailyAverageKwh,
      comparisonPct: comparisonPct,
      projectedBill: Number((monthlyKwh / 23 * 30 * effectiveTariff).toFixed(0))
    };

    const totalCurrentVal = Number((totalActivePower / (gridVoltage * systemPowerFactor)).toFixed(2));
    
    // Authoritative Transformer Model (10 kVA, 11kV -> 230V, 50Hz)
    const transformerLoadVa = totalApparentPower;
    const transformerLoadPct = Number(((transformerLoadVa / 10000) * 100).toFixed(1));
    const transformer = {
      id: 'TR001',
      name: 'Virtual Substation Transformer',
      type: 'transformer',
      inputVoltage: 11000,
      outputVoltage: Number(gridVoltage.toFixed(1)),
      frequencyHz: 50,
      ratedCapacityKva: 10.0,
      efficiencyPct: 98.6,
      currentLoadW: Number(totalActivePower.toFixed(1)),
      currentLoadVa: Number(transformerLoadVa.toFixed(1)),
      loadPercentage: transformerLoadPct,
      status: transformerLoadPct > 90 ? 'OVERLOAD' : (transformerLoadPct > 70 ? 'HIGH' : 'NORMAL')
    };

    // Authoritative Main Distribution Board (40A rated main breaker)
    const mdbLoadPct = Number(((totalCurrentVal / 40) * 100).toFixed(1));
    const distributionBoard = {
      id: 'MDB001',
      name: 'Main Distribution Board',
      type: 'distribution_board',
      mainBreakerAmps: 40,
      voltage: Number(gridVoltage.toFixed(1)),
      totalActivePower: Number(totalActivePower.toFixed(1)),
      totalCurrent: totalCurrentVal,
      loadPercentage: mdbLoadPct,
      isTripped: totalCurrentVal > 40,
      status: totalCurrentVal > 40 ? 'TRIPPED' : (mdbLoadPct > 80 ? 'WARNING' : 'NORMAL')
    };

    // Authoritative Living Room State (Single Virtual Room)
    const livingRoom = {
      id: 'RM_LIVING',
      name: 'Living Room',
      totalPowerW: Number(totalActivePower.toFixed(1)),
      totalCurrentA: totalCurrentVal,
      activeAppliancesCount: activeCount,
      totalAppliancesCount: totalCount,
      energyConsumedTodayKwh: Number(totalEnergyTodayKwh.toFixed(4)),
      voltage: Number(gridVoltage.toFixed(1)),
      appliances: applianceReadings
    };

    // Authoritative Electrical Topology Tree
    const topology = {
      grid: { name: 'Utility Grid Supply', voltage: 230, frequency: 50, status: 'NORMAL' },
      transformer,
      distributionBoard,
      livingRoom: {
        id: 'RM_LIVING',
        name: 'Living Room',
        totalPowerW: Number(totalActivePower.toFixed(1)),
        totalCurrentA: totalCurrentVal,
        activeAppliancesCount: activeCount
      },
      appliances: applianceReadings.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        category: a.category,
        location: 'Living Room',
        isOn: a.isOn,
        activePowerW: a.reading ? a.reading.activePower : 0,
        currentA: a.reading ? a.reading.current : 0,
        voltageV: a.reading ? a.reading.voltage : Number(gridVoltage.toFixed(1)),
        powerFactor: a.powerFactor,
        cumulativeEnergyKwh: a.reading ? a.reading.cumulativeEnergyKwh : 0
      }))
    };

    const telemetry = {
      deviceId: this.esp32.deviceId,
      timestamp: new Date().toISOString(),
      resident: {
        userId: this.activeUserId,
        name: this.activeUser?.name || 'Dhanush Yadav',
        doorNo: this.activeUser?.door_no || 'Flat 402, Block B',
        consumerId: this.activeUser?.consumer_id || 'BESCOM-BLR-D402-A81'
      },
      gridVoltage: Number(gridVoltage.toFixed(1)),
      totalActivePower: Number(totalActivePower.toFixed(1)),
      totalCurrent: totalCurrentVal,
      systemPowerFactor: Number(systemPowerFactor.toFixed(2)),
      totalEnergyTodayKwh: Number(totalEnergyTodayKwh.toFixed(4)),
      estimatedCost: Number(estimatedCost.toFixed(2)),
      carbonKg: Number(carbonKg.toFixed(3)),
      isPeakHour,
      tariffRate: effectiveTariff,
      speedMultiplier: this.speedMultiplier,
      activeDevicesCount: activeCount,
      totalDevicesCount: totalCount,
      monthlyUsage,
      transformer,
      distributionBoard,
      livingRoom,
      topology,
      appliances: applianceReadings
    };

    // Keep rolling live history (last 30 seconds for live chart)
    const timeLabel = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.liveHistory.push({
      time: timeLabel,
      totalPower: telemetry.totalActivePower,
      voltage: telemetry.gridVoltage,
      current: telemetry.totalCurrent,
      cost: telemetry.estimatedCost
    });
    if (this.liveHistory.length > SYSTEM_CONFIG.MAX_LIVE_POINTS) {
      this.liveHistory.shift();
    }

    // Periodic batch DB sync (every 5 ticks to optimize disk I/O)
    if (this.tickCounter % 5 === 0) {
      this.syncDatabase(applianceReadings, telemetry);
    }

    // Emit event for WebSocket and MQTT dispatches
    this.emit('telemetry:sample', telemetry);
  }

  syncDatabase(applianceReadings, telemetry) {
    try {
      const updateApp = db.prepare(`
        UPDATE appliances 
        SET total_energy_kwh = ?, total_runtime_seconds = ?
        WHERE id = ?
      `);

      const updateUserApp = db.prepare(`
        UPDATE user_appliance_states
        SET cumulative_energy_kwh = ?, runtime_seconds = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND appliance_id = ?
      `);

      const insertReading = db.prepare(`
        INSERT INTO sensor_readings (device_id, appliance_id, voltage, current, power_factor, active_power, apparent_power, energy_delta_kwh, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const tx = db.transaction(() => {
        for (const item of applianceReadings) {
          updateApp.run(item.reading.cumulativeEnergyKwh, item.runtimeSeconds, item.id);
          if (this.activeUserId) {
            updateUserApp.run(item.reading.cumulativeEnergyKwh, item.runtimeSeconds, this.activeUserId, item.id);
          }
          insertReading.run(
            this.esp32.deviceId,
            item.id,
            item.reading.voltage,
            item.reading.current,
            item.reading.powerFactor,
            item.reading.activePower,
            item.reading.apparentPower,
            item.reading.energyDeltaKwh,
            item.reading.status
          );
        }
      });
      tx();
    } catch (e) {
      console.error('[SimulationEngine] DB sync error:', e.message);
    }
  }

  getSnapshot() {
    const gridVoltage = SYSTEM_CONFIG.BASE_VOLTAGE;
    let totalActivePower = 0;
    let totalApparentPower = 0;
    let totalEnergyTodayKwh = 0;

    const apps = Array.from(this.appliances.values()).map(app => {
      const sensor = this.sensors.get(app.id);
      const reading = sensor ? sensor.lastReading : null;
      if (reading) {
        totalActivePower += reading.activePower || 0;
        totalApparentPower += reading.apparentPower || 0;
        totalEnergyTodayKwh += reading.cumulativeEnergyKwh || 0;
      }
      return {
        ...app.toJSON(),
        location: 'Living Room',
        reading
      };
    });

    const systemPowerFactor = totalApparentPower > 0 
      ? Math.min(1.0, Math.max(0.7, totalActivePower / totalApparentPower))
      : 1.0;
    const totalCurrentVal = Number((totalActivePower / (gridVoltage * systemPowerFactor)).toFixed(2));
    const transformerLoadVa = totalApparentPower;
    const transformerLoadPct = Number(((transformerLoadVa / 10000) * 100).toFixed(1));

    const transformer = {
      id: 'TR001',
      name: 'Virtual Substation Transformer',
      type: 'transformer',
      inputVoltage: 11000,
      outputVoltage: gridVoltage,
      frequencyHz: 50,
      ratedCapacityKva: 10.0,
      efficiencyPct: 98.6,
      currentLoadW: Number(totalActivePower.toFixed(1)),
      currentLoadVa: Number(transformerLoadVa.toFixed(1)),
      loadPercentage: transformerLoadPct,
      status: transformerLoadPct > 90 ? 'OVERLOAD' : (transformerLoadPct > 70 ? 'HIGH' : 'NORMAL')
    };

    const mdbLoadPct = Number(((totalCurrentVal / 40) * 100).toFixed(1));
    const distributionBoard = {
      id: 'MDB001',
      name: 'Main Distribution Board',
      type: 'distribution_board',
      mainBreakerAmps: 40,
      voltage: gridVoltage,
      totalActivePower: Number(totalActivePower.toFixed(1)),
      totalCurrent: totalCurrentVal,
      loadPercentage: mdbLoadPct,
      isTripped: totalCurrentVal > 40,
      status: totalCurrentVal > 40 ? 'TRIPPED' : (mdbLoadPct > 80 ? 'WARNING' : 'NORMAL')
    };

    const livingRoom = {
      id: 'RM_LIVING',
      name: 'Living Room',
      totalPowerW: Number(totalActivePower.toFixed(1)),
      totalCurrentA: totalCurrentVal,
      activeAppliancesCount: apps.filter(a => a.isOn).length,
      totalAppliancesCount: apps.length,
      energyConsumedTodayKwh: Number(totalEnergyTodayKwh.toFixed(4)),
      voltage: gridVoltage,
      appliances: apps
    };

    const topology = {
      grid: { name: 'Utility Grid Supply', voltage: 230, frequency: 50, status: 'NORMAL' },
      transformer,
      distributionBoard,
      livingRoom: {
        id: 'RM_LIVING',
        name: 'Living Room',
        totalPowerW: Number(totalActivePower.toFixed(1)),
        totalCurrentA: totalCurrentVal,
        activeAppliancesCount: apps.filter(a => a.isOn).length
      },
      appliances: apps.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        category: a.category,
        location: 'Living Room',
        isOn: a.isOn,
        activePowerW: a.reading ? a.reading.activePower : 0,
        currentA: a.reading ? a.reading.current : 0,
        voltageV: a.reading ? a.reading.voltage : gridVoltage,
        powerFactor: a.powerFactor,
        cumulativeEnergyKwh: a.reading ? a.reading.cumulativeEnergyKwh : 0
      }))
    };

    return {
      resident: {
        userId: this.activeUserId,
        name: this.activeUser?.name || 'Dhanush Yadav',
        doorNo: this.activeUser?.door_no || 'Flat 402, Block B',
        consumerId: this.activeUser?.consumer_id || 'BESCOM-BLR-D402-A81'
      },
      esp32: this.esp32.getStatus(),
      speedMultiplier: this.speedMultiplier,
      isPaused: this.isPaused,
      tariff: this.tariff,
      carbonFactor: this.carbonFactor,
      liveHistory: this.liveHistory,
      transformer,
      distributionBoard,
      livingRoom,
      topology,
      appliances: apps
    };
  }
}
