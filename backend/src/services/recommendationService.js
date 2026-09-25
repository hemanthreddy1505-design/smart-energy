import { SYSTEM_CONFIG } from '../config/constants.js';

/**
 * Energy-Saving Recommendation Engine
 * Dynamically computes actionable, quantitative advice based on real-time and daily telemetry.
 */
export class RecommendationService {
  constructor(simulationEngine) {
    this.simulationEngine = simulationEngine;
  }

  generateRecommendations() {
    const recommendations = [];
    const snapshot = this.simulationEngine.getSnapshot();
    const appliances = snapshot.appliances || [];
    const tariff = snapshot.tariff || SYSTEM_CONFIG.DEFAULT_TARIFF;
    const carbonFactor = snapshot.carbonFactor || SYSTEM_CONFIG.DEFAULT_CARBON_FACTOR;

    const totalEnergy = appliances.reduce((sum, a) => sum + (a.reading ? a.reading.cumulativeEnergyKwh : 0), 0);
    const nowHour = new Date().getHours();
    const isPeakHour = nowHour >= 18 && nowHour <= 22;

    // 1. Device-Level Attribution / Major Consumer Heuristic
    if (totalEnergy > 0.5) {
      const sortedByEnergy = [...appliances].sort((a, b) => {
        const ea = a.reading ? a.reading.cumulativeEnergyKwh : 0;
        const eb = b.reading ? b.reading.cumulativeEnergyKwh : 0;
        return eb - ea;
      });

      const topConsumer = sortedByEnergy[0];
      const topEnergy = topConsumer.reading ? topConsumer.reading.cumulativeEnergyKwh : 0;
      const sharePercentage = Math.round((topEnergy / totalEnergy) * 100);

      if (sharePercentage >= 35) {
        let specificTip = '';
        if (topConsumer.id === 'AC001') {
          const potentialKwh = Number((topEnergy * 0.15).toFixed(2));
          const potentialSavings = Number((potentialKwh * tariff).toFixed(2));
          specificTip = `Adjusting your Air Conditioner setpoint from 20°C to 24°C can conserve ~15% energy (~${potentialKwh} kWh / ₹${potentialSavings} today).`;
        } else if (topConsumer.id === 'GH001') {
          specificTip = `Water Heater is driving your bill. Installing a 45-minute timer cutoff could save up to 25% of heating expenditure.`;
        } else {
          specificTip = `Consider reviewing usage patterns or scheduling automated turn-off for ${topConsumer.name}.`;
        }

        recommendations.push({
          id: `rec-dominant-${topConsumer.id}`,
          title: `${topConsumer.name} Dominates Energy Usage`,
          category: 'High Consumption',
          impact: 'HIGH',
          sharePercentage,
          applianceId: topConsumer.id,
          message: `${topConsumer.name} accounts for ${sharePercentage}% of total building energy today (${topEnergy.toFixed(2)} kWh). ${specificTip}`,
          estimatedSavingsRupees: Number((topEnergy * 0.12 * tariff).toFixed(2)),
          carbonReductionKg: Number((topEnergy * 0.12 * carbonFactor).toFixed(2))
        });
      }
    }

    // 2. Peak Demand Shifting Heuristic (6 PM - 10 PM)
    const heavyAppliances = appliances.filter(a => (a.id === 'WM001' || a.id === 'GH001') && a.isOn);
    if (isPeakHour && heavyAppliances.length > 0) {
      for (const heavy of heavyAppliances) {
        const activeW = heavy.reading ? heavy.reading.activePower : heavy.ratedPower;
        const peakSaving = Number(((activeW / 1000) * 1 * tariff * 0.25).toFixed(2));
        recommendations.push({
          id: `rec-peak-${heavy.id}`,
          title: `Peak-Hour Tariff Active: Shift ${heavy.name}`,
          category: 'Peak Demand Shifting',
          impact: 'MEDIUM',
          applianceId: heavy.id,
          message: `Grid is currently operating under peak pricing (1.25x surcharge). Shifting ${heavy.name} operation to off-peak (after 10 PM or before 6 PM) eliminates surcharges and relieves grid congestion.`,
          estimatedSavingsRupees: peakSaving,
          carbonReductionKg: Number(((activeW / 1000) * 0.2).toFixed(2))
        });
      }
    }

    // 3. Prolonged Runtime Heuristic
    for (const app of appliances) {
      if (app.id === 'PC001' && app.isOn && app.continuousOnSeconds > 14400) {
        const hoursOn = (app.continuousOnSeconds / 3600).toFixed(1);
        recommendations.push({
          id: 'rec-pc-prolonged',
          title: 'Workstation Idle Power Optimization',
          category: 'Standby Loss',
          impact: 'LOW',
          applianceId: app.id,
          message: `Computer has been active continuously for ${hoursOn} hours. If unattended, configuring auto-sleep after 15 minutes of inactivity saves ~0.4 kWh daily.`,
          estimatedSavingsRupees: Number((0.4 * tariff).toFixed(2)),
          carbonReductionKg: Number((0.4 * carbonFactor).toFixed(2))
        });
      }

      if (app.id === 'GH001' && app.isOn && app.continuousOnSeconds > 1800) {
        recommendations.push({
          id: 'rec-geyser-runtime',
          title: 'Water Heater Ready - Switch Off',
          category: 'Conservation',
          impact: 'HIGH',
          applianceId: app.id,
          message: `Geyser has run for over 30 minutes. Water has reached optimal shower temperature (~60°C). Switching OFF now prevents continuous reheat cycles.`,
          estimatedSavingsRupees: Number((1.5 * tariff).toFixed(2)),
          carbonReductionKg: Number((1.5 * carbonFactor).toFixed(2))
        });
      }
    }

    // 4. Default / Baselines if system is minimal
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'rec-general-bldc',
        title: 'Optimal Energy Efficiency Maintained',
        category: 'Best Practice',
        impact: 'INFO',
        applianceId: null,
        message: 'Current appliance loads are well-balanced within normal thresholds. Maintain automated night schedules to minimize phantom standby loads.',
        estimatedSavingsRupees: 0,
        carbonReductionKg: 0
      });
    }

    return recommendations;
  }
}
