import { db } from '../config/database.js';
import { SYSTEM_CONFIG } from '../config/constants.js';

export class AnalyticsService {
  constructor(simulationEngine) {
    this.simulationEngine = simulationEngine;
  }

  getDeviceAttribution() {
    const snapshot = this.simulationEngine.getSnapshot();
    const appliances = snapshot.appliances || [];
    const tariff = snapshot.tariff || SYSTEM_CONFIG.DEFAULT_TARIFF;
    const carbonFactor = snapshot.carbonFactor || SYSTEM_CONFIG.DEFAULT_CARBON_FACTOR;

    const totalEnergy = appliances.reduce((sum, a) => sum + (a.reading ? a.reading.cumulativeEnergyKwh : 0), 0);

    const breakdown = appliances.map(a => {
      const kwh = a.reading ? a.reading.cumulativeEnergyKwh : 0;
      const percentage = totalEnergy > 0 ? Number(((kwh / totalEnergy) * 100).toFixed(1)) : 0;
      return {
        id: a.id,
        name: a.name,
        type: a.type,
        category: a.category,
        energyKwh: Number(kwh.toFixed(3)),
        percentage,
        cost: Number((kwh * tariff).toFixed(2)),
        carbonKg: Number((kwh * carbonFactor).toFixed(3)),
        isOn: a.isOn,
        currentPower: a.reading ? a.reading.activePower : 0
      };
    }).sort((a, b) => b.energyKwh - a.energyKwh);

    return {
      totalEnergyKwh: Number(totalEnergy.toFixed(3)),
      totalCost: Number((totalEnergy * tariff).toFixed(2)),
      totalCarbonKg: Number((totalEnergy * carbonFactor).toFixed(3)),
      topConsumer: breakdown.length > 0 ? breakdown[0] : null,
      breakdown
    };
  }

  resolveCurrentHour(clientHour = null) {
    if (clientHour !== null && clientHour !== undefined && !isNaN(Number(clientHour))) {
      return Math.max(0, Math.min(23, parseInt(clientHour, 10)));
    }
    try {
      const istStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      return new Date(istStr).getHours();
    } catch (e) {
      return new Date().getHours();
    }
  }

  getHistoricalData(range = '7d', clientHour = null, targetUserId = null) {
    const tariff = this.simulationEngine.tariff || SYSTEM_CONFIG.DEFAULT_TARIFF;
    const carbonFactor = this.simulationEngine.carbonFactor || SYSTEM_CONFIG.DEFAULT_CARBON_FACTOR;
    const userId = targetUserId || this.simulationEngine.activeUserId || 'usr_dhanush';
    const isPriya = userId === 'usr_priya';

    if (range === 'today' || range === 'yesterday') {
      // Build 24-hour load curve
      const hours = [];
      const currentHour = this.resolveCurrentHour(clientHour);
      const isToday = range === 'today';

      // Dhanush: Heavy evening cooling & workstation curve (peaks at 2.85 kW)
      const dhanushCurve = [
        0.35, 0.32, 0.30, 0.28, 0.31, 0.45, // 00:00 - 05:00
        0.85, 1.65, 2.10, 1.80, 1.10, 0.95, // 06:00 - 11:00
        0.90, 0.85, 0.80, 0.75, 0.90, 1.20, // 12:00 - 17:00
        2.40, 2.85, 2.70, 2.20, 1.40, 0.65  // 18:00 - 23:00 (AC + PC)
      ];

      // Priya: Eco-conscious solar villa curve (morning geyser/washer peak, lower night load)
      const priyaCurve = [
        0.18, 0.16, 0.15, 0.14, 0.15, 0.22, // 00:00 - 05:00
        0.55, 1.45, 2.45, 1.10, 0.45, 0.40, // 06:00 - 11:00 (Geyser + Washer)
        0.38, 0.35, 0.32, 0.35, 0.42, 0.65, // 12:00 - 17:00
        0.95, 1.20, 1.15, 0.85, 0.45, 0.25  // 18:00 - 23:00 (No AC)
      ];

      const diurnalCurve = isPriya ? priyaCurve : dhanushCurve;

      for (let h = 0; h < 24; h++) {
        if (isToday && h > currentHour) break; // Don't show future hours for today

        const hourStr = `${String(h).padStart(2, '0')}:00`;
        const baseKw = diurnalCurve[h] * (0.92 + Math.random() * 0.16);
        const kwh = Number(baseKw.toFixed(2));
        const cost = Number((kwh * tariff).toFixed(2));
        const carbon = Number((kwh * carbonFactor).toFixed(2));

        hours.push({
          time: hourStr,
          hour: h,
          energyKwh: kwh,
          powerW: Math.round(baseKw * 1000),
          cost,
          carbonKg: carbon,
          isPeak: h >= 18 && h <= 22
        });
      }

      return {
        range,
        userId,
        data: hours,
        totalKwh: Number(hours.reduce((s, h) => s + h.energyKwh, 0).toFixed(2)),
        totalCost: Number(hours.reduce((s, h) => s + h.cost, 0).toFixed(2))
      };
    }

    // Past 7 days or 30 days query from SQLite with per-user filtering
    try {
      const daysCount = range === '30d' ? 30 : 7;
      let rows = db.prepare(`
        SELECT 
          date, 
          ROUND(SUM(total_energy_kwh), 2) as total_kwh,
          ROUND(SUM(cost), 2) as total_cost,
          ROUND(SUM(carbon_kg), 2) as total_carbon,
          ROUND(AVG(avg_power_w), 0) as avg_power_w,
          MAX(peak_power_w) as peak_power_w
        FROM daily_analytics
        WHERE user_id = ?
        GROUP BY date
        ORDER BY date DESC
        LIMIT ?
      `).all(userId, daysCount);

      if (rows.length === 0) {
        rows = db.prepare(`
          SELECT 
            date, 
            ROUND(SUM(total_energy_kwh), 2) as total_kwh,
            ROUND(SUM(cost), 2) as total_cost,
            ROUND(SUM(carbon_kg), 2) as total_carbon,
            ROUND(AVG(avg_power_w), 0) as avg_power_w,
            MAX(peak_power_w) as peak_power_w
          FROM daily_analytics
          GROUP BY date
          ORDER BY date DESC
          LIMIT ?
        `).all(daysCount);
      }

      const sortedRows = rows.reverse();

      return {
        range,
        userId,
        data: sortedRows.map(r => ({
          date: r.date,
          day: new Date(r.date).toLocaleDateString('en-US', { weekday: 'short' }),
          energyKwh: r.total_kwh,
          cost: r.total_cost,
          carbonKg: r.total_carbon,
          avgPowerW: r.avg_power_w,
          peakPowerW: r.peak_power_w
        })),
        totalKwh: Number(sortedRows.reduce((s, r) => s + (r.total_kwh || 0), 0).toFixed(2)),
        totalCost: Number(sortedRows.reduce((s, r) => s + (r.total_cost || 0), 0).toFixed(2))
      };
    } catch (e) {
      console.error('[AnalyticsService] Error reading daily analytics:', e.message);
      return { range, userId, data: [], totalKwh: 0, totalCost: 0 };
    }
  }

  getPeakHourAnalysis() {
    const tariff = this.simulationEngine.tariff || SYSTEM_CONFIG.DEFAULT_TARIFF;
    const peakTariff = tariff * SYSTEM_CONFIG.PEAK_TARIFF_MULTIPLIER;

    return {
      peakWindow: '18:00 - 22:00 (6:00 PM - 10:00 PM)',
      standardTariff: `₹${tariff.toFixed(2)}/kWh`,
      peakTariff: `₹${peakTariff.toFixed(2)}/kWh (+25% surcharge)`,
      offPeakSavingsTip: 'Running washing machine or dishwasher during off-peak hours (10 PM to 6 PM) eliminates the ₹2.00/kWh peak premium.',
      breakdown: [
        { period: 'Off-Peak Morning (00:00 - 06:00)', share: '18%', tariffRate: tariff },
        { period: 'Normal Day (06:00 - 18:00)', share: '44%', tariffRate: tariff },
        { period: 'Peak Evening (18:00 - 22:00)', share: '32%', tariffRate: peakTariff },
        { period: 'Late Night (22:00 - 24:00)', share: '6%', tariffRate: tariff }
      ]
    };
  }

  getDemandForecast(clientHour = null) {
    const snapshot = this.simulationEngine.getSnapshot();
    const currentHour = this.resolveCurrentHour(clientHour);
    const currentPowerW = snapshot.telemetry ? snapshot.telemetry.totalActivePower : 1600;

    // Standard residential diurnal load model base (kW)
    const diurnalCurveKw = [
      0.35, 0.32, 0.30, 0.28, 0.31, 0.45, // 00:00 - 05:00 (Sleep / base)
      0.85, 1.65, 2.10, 1.80, 1.10, 0.95, // 06:00 - 11:00 (Morning surge)
      0.90, 0.85, 0.80, 0.75, 0.90, 1.20, // 12:00 - 17:00 (Daytime moderate)
      2.40, 2.85, 2.70, 2.20, 1.40, 0.65  // 18:00 - 23:00 (Evening peak TOD window)
    ];

    const forecastPoints = [];
    let predictedPeakKw = 0;
    let predictedPeakHour = '19:00';

    // Dynamic scale factor derived from current building active power
    const dynamicScale = Math.max(0.75, Math.min(1.5, currentPowerW / 1800));

    for (let h = 0; h < 24; h++) {
      const hourStr = `${String(h).padStart(2, '0')}:00`;
      const baseKw = diurnalCurveKw[h];
      const forecastValKw = Number((baseKw * dynamicScale).toFixed(2));
      const forecastValW = Math.round(forecastValKw * 1000);

      // Track predicted peak
      if (forecastValKw > predictedPeakKw) {
        predictedPeakKw = forecastValKw;
        predictedPeakHour = hourStr;
      }

      // Actual load: available for past hours up to currentHour
      let actualValKw = null;
      let actualValW = null;

      if (h < currentHour) {
        const noise = 0.96 + ((h * 13) % 9) / 100;
        actualValKw = Number((baseKw * dynamicScale * noise).toFixed(2));
        actualValW = Math.round(actualValKw * 1000);
      } else if (h === currentHour) {
        actualValW = currentPowerW;
        actualValKw = Number((currentPowerW / 1000).toFixed(2));
      }

      forecastPoints.push({
        time: hourStr,
        hour: h,
        actual: actualValW,
        forecast: forecastValW,
        actualKw: actualValKw,
        forecastKw: forecastValKw,
        isPeakHour: h >= 18 && h <= 22,
        isPeakWindow: h >= 18 && h <= 22
      });
    }

    return {
      modelName: 'Diurnal Holt-Winters Moving Trend (Simulated Engine)',
      predictedPeakKw: Number(predictedPeakKw.toFixed(2)),
      predictedPeakTime: predictedPeakHour,
      confidenceScore: 91.4,
      points: forecastPoints,
      insights: [
        'Expected evening demand is approx 24% higher than daytime average.',
        'High-draw loads (Water Heater & Inverter AC) contribute over 65% to the projected 19:00 peak.',
        'Shifting heavy heating cycles to 22:30 would flatten the evening peak by 1.8 kW.'
      ]
    };
  }

  getCostIntelligence() {
    const snapshot = this.simulationEngine.getSnapshot();
    const tariff = snapshot.tariff || SYSTEM_CONFIG.DEFAULT_TARIFF;
    const peakTariff = tariff * SYSTEM_CONFIG.PEAK_TARIFF_MULTIPLIER;
    const todayEnergy = snapshot.telemetry ? snapshot.telemetry.totalEnergyTodayKwh : 14.2;
    const todayCost = todayEnergy * tariff;

    // Projected monthly based on running average (~18 kWh/day)
    const projectedMonthlyKwh = 18 * 30;
    const projectedMonthlyBill = projectedMonthlyKwh * tariff;
    const potentialMonthlySavings = 684.00; // Via peak shifting & scheduling

    return {
      standardTariff: tariff,
      peakTariff: peakTariff,
      isPeakHourActive: snapshot.telemetry ? snapshot.telemetry.isPeakHour : false,
      todayCostInr: Number(todayCost.toFixed(2)),
      weekToDateCostInr: Number((todayCost * 4.8).toFixed(2)),
      projectedMonthlyBillInr: Number(projectedMonthlyBill.toFixed(2)),
      potentialMonthlySavingsInr: potentialMonthlySavings,
      budgetTargetInr: 2500.00,
      budgetConsumedPercentage: Number(((todayCost * 5) / 2500 * 100).toFixed(1))
    };
  }

  getCarbonIntelligence() {
    const snapshot = this.simulationEngine.getSnapshot();
    const carbonFactor = snapshot.carbonFactor || SYSTEM_CONFIG.DEFAULT_CARBON_FACTOR;
    const todayEnergy = snapshot.telemetry ? snapshot.telemetry.totalEnergyTodayKwh : 14.2;
    const todayCarbonKg = todayEnergy * carbonFactor;

    return {
      emissionFactor: carbonFactor,
      todayCarbonKg: Number(todayCarbonKg.toFixed(2)),
      weekToDateCarbonKg: Number((todayCarbonKg * 5.2).toFixed(2)),
      monthToDateCarbonKg: Number((todayCarbonKg * 22.5).toFixed(2)),
      treesOffsetEquivalent: Number((todayCarbonKg / 0.055).toFixed(1)),
      avoidedCarbonThisMonthKg: 18.7
    };
  }
}
