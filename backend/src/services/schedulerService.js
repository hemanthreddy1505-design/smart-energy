import { db } from '../config/database.js';

export class SchedulerService {
  constructor(simulationEngine) {
    this.simulationEngine = simulationEngine;
    this.timer = null;
    this.lastTriggeredMinute = null;
  }

  start() {
    this.timer = setInterval(() => this.checkSchedules(), 10000); // Check every 10s
    console.log('[SchedulerService] Automation scheduler active.');
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  checkSchedules() {
    const now = new Date();
    const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const currentDay = dayNames[now.getDay()];

    const triggerKey = `${currentDay}_${currentHourMin}`;
    if (this.lastTriggeredMinute === triggerKey) {
      return; // Already executed this minute
    }

    try {
      const activeSchedules = db.prepare('SELECT * FROM schedules WHERE is_active = 1').all();

      for (const schedule of activeSchedules) {
        if (schedule.time === currentHourMin) {
          let days = [];
          try {
            days = JSON.parse(schedule.days);
          } catch (e) {
            days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
          }

          if (days.includes(currentDay)) {
            const targetState = schedule.action === 'ON';
            console.log(`[Scheduler] ⏰ Auto-executing schedule #${schedule.id}: Turn ${schedule.action} on ${schedule.appliance_id}`);
            this.simulationEngine.toggleAppliance(schedule.appliance_id, targetState);
          }
        }
      }

      this.lastTriggeredMinute = triggerKey;
    } catch (e) {
      console.error('[SchedulerService] Error evaluating schedules:', e.message);
    }
  }

  getSchedules() {
    try {
      return db.prepare(`
        SELECT s.*, a.name as appliance_name, a.location 
        FROM schedules s
        JOIN appliances a ON s.appliance_id = a.id
        ORDER BY s.time ASC
      `).all();
    } catch (e) {
      console.error('[SchedulerService] Error fetching schedules:', e.message);
      return [];
    }
  }

  addSchedule({ applianceId, action, time, days }) {
    try {
      const daysStr = JSON.stringify(days || ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
      const stmt = db.prepare(`
        INSERT INTO schedules (appliance_id, action, time, days, is_active)
        VALUES (?, ?, ?, ?, 1)
      `);
      const info = stmt.run(applianceId, action, time, daysStr);
      return {
        id: info.lastInsertRowid,
        applianceId,
        action,
        time,
        days: JSON.parse(daysStr),
        isActive: true
      };
    } catch (e) {
      console.error('[SchedulerService] Error creating schedule:', e.message);
      throw e;
    }
  }

  toggleSchedule(id) {
    try {
      db.prepare('UPDATE schedules SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
      return true;
    } catch (e) {
      console.error('[SchedulerService] Error toggling schedule:', e.message);
      return false;
    }
  }

  deleteSchedule(id) {
    try {
      db.prepare('DELETE FROM schedules WHERE id = ?').run(id);
      return true;
    } catch (e) {
      console.error('[SchedulerService] Error deleting schedule:', e.message);
      return false;
    }
  }

  getScenes() {
    return [
      {
        id: 'night_mode',
        name: 'Night Mode',
        description: 'Powers down entertainment, non-essential lighting, and keeps HVAC in low-power eco operation.',
        actions: [
          { applianceId: 'TV001', state: false, name: 'Smart Television' },
          { applianceId: 'LT001', state: false, name: 'Living Room Lighting' },
          { applianceId: 'WM001', state: false, name: 'Washing Machine' },
          { applianceId: 'GH001', state: false, name: 'Water Heater / Geyser' }
        ],
        icon: 'Moon'
      },
      {
        id: 'work_mode',
        name: 'Work / Office Mode',
        description: 'Energizes high-performance workstation and office task lighting while idling heavy utility loads.',
        actions: [
          { applianceId: 'PC001', state: true, name: 'Workstation PC' },
          { applianceId: 'LT001', state: true, name: 'Living Room Lighting' },
          { applianceId: 'FN001', state: true, name: 'Ceiling Fan' }
        ],
        icon: 'Briefcase'
      },
      {
        id: 'eco_peak_shift',
        name: 'Eco Peak Load Shedding',
        description: 'Sheds flexible heavy resistive heating loads during high-tariff surcharge intervals (18:00 - 22:00).',
        actions: [
          { applianceId: 'GH001', state: false, name: 'Water Heater / Geyser' },
          { applianceId: 'WM001', state: false, name: 'Washing Machine' }
        ],
        icon: 'ZapOff'
      },
      {
        id: 'away_mode',
        name: 'Away / Vacant Mode',
        description: 'Turns off all non-critical loads, leaving only essential cold storage (Refrigerator) energized.',
        actions: [
          { applianceId: 'AC001', state: false, name: 'Air Conditioner' },
          { applianceId: 'TV001', state: false, name: 'Smart Television' },
          { applianceId: 'PC001', state: false, name: 'Workstation PC' },
          { applianceId: 'LT001', state: false, name: 'Living Room Lighting' },
          { applianceId: 'GH001', state: false, name: 'Water Heater / Geyser' }
        ],
        icon: 'Home'
      }
    ];
  }

  applyScene(sceneId) {
    const scenes = this.getScenes();
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return null;

    const results = [];
    for (const action of scene.actions) {
      const res = this.simulationEngine.toggleAppliance(action.applianceId, action.state);
      results.push({ id: action.applianceId, state: action.state, success: !!res });
    }
    console.log(`[SchedulerService] 🎬 Executed scene: ${scene.name} (${results.length} devices updated)`);
    return { scene, results };
  }

  getRules() {
    return [
      {
        id: 'rule_peak_demand',
        name: 'Sanctioned Load Threshold Protection',
        trigger: 'Total building demand exceeds 4.5 kW',
        action: 'Dispatch critical warning alert & recommend shedding Water Heater',
        isActive: true,
        thresholdKw: 4.5,
        type: 'DEMAND_LIMIT'
      },
      {
        id: 'rule_water_heater_runtime',
        name: 'Thermostat Loss Prevention',
        trigger: 'Water Heater remains continuously active for > 45 minutes',
        action: 'Issue prolonged runtime warning & prompt autonomous shutdown',
        isActive: true,
        thresholdMins: 45,
        type: 'RUNTIME_LIMIT'
      },
      {
        id: 'rule_peak_tariff_notification',
        name: 'Time-of-Day Tariff Surcharge Sentinel',
        trigger: 'System clock reaches 18:00 (Peak window begin)',
        action: 'Alert dashboard to defer washing machine & geyser until 22:00',
        isActive: true,
        type: 'TARIFF_SHIFT'
      }
    ];
  }

  getLoadShiftingAnalysis() {
    return {
      peakWindow: '18:00 - 22:00',
      standardRate: 8.0,
      peakRate: 10.0,
      surchargePerKwh: 2.0,
      opportunities: [
        {
          applianceId: 'GH001',
          name: 'Water Heater / Geyser',
          typicalKwhPerCycle: 2.2,
          currentSchedule: '19:00',
          recommendedSchedule: '22:30 (Off-Peak)',
          dailySavingsInr: 4.40,
          monthlySavingsInr: 132.00,
          carbonAvoidedKgMonth: 10.8
        },
        {
          applianceId: 'WM001',
          name: 'Washing Machine',
          typicalKwhPerCycle: 1.6,
          currentSchedule: '20:00',
          recommendedSchedule: '14:00 (Solar / Off-Peak)',
          dailySavingsInr: 3.20,
          monthlySavingsInr: 96.00,
          carbonAvoidedKgMonth: 7.9
        }
      ],
      totalPotentialSavingsMonth: 228.00,
      totalCarbonAvoidedMonth: 18.7
    };
  }
}
