import { Router } from 'express';

export function createAnalyticsRouter(analyticsService, recommendationService, simulationEngine) {
  const router = Router();

  // GET /api/analytics/realtime
  router.get('/realtime', (req, res) => {
    const snapshot = simulationEngine.getSnapshot();
    res.json({
      success: true,
      data: {
        liveHistory: snapshot.liveHistory,
        tariff: snapshot.tariff,
        carbonFactor: snapshot.carbonFactor,
        speedMultiplier: snapshot.speedMultiplier,
        isPaused: snapshot.isPaused
      }
    });
  });

  // GET /api/analytics/historical?range=today|yesterday|7d|30d
  router.get('/historical', (req, res) => {
    const range = req.query.range || '7d';
    const clientHour = req.query.clientHour;
    const userId = req.query.userId || req.query.user_id;
    const result = analyticsService.getHistoricalData(range, clientHour, userId);
    res.json({
      success: true,
      data: result
    });
  });

  // GET /api/analytics/attribution
  router.get('/attribution', (req, res) => {
    const attribution = analyticsService.getDeviceAttribution();
    res.json({
      success: true,
      data: attribution
    });
  });

  // GET /api/analytics/peak-hours
  router.get('/peak-hours', (req, res) => {
    const peakInfo = analyticsService.getPeakHourAnalysis();
    res.json({
      success: true,
      data: peakInfo
    });
  });

  // GET /api/analytics/export/csv
  router.get('/export/csv', (req, res) => {
    const attribution = analyticsService.getDeviceAttribution();
    const snapshot = simulationEngine.getSnapshot();
    const esp32 = snapshot.esp32 || {};
    const now = new Date().toISOString();

    let csv = `Smart Energy Conservation Tracker - Energy & Carbon Report\n`;
    csv += `Generated At,${now}\n`;
    csv += `Gateway Device,${esp32.deviceId || 'ESP32-SIM-001'} (${esp32.chipModel || 'ESP32'})\n`;
    csv += `Total Energy Today,${attribution.totalEnergyKwh} kWh\n`;
    csv += `Total Cost Today,₹${attribution.totalCost}\n`;
    csv += `Total Carbon Footprint,${attribution.totalCarbonKg} kg CO2\n`;
    csv += `Current Tariff Rate,₹${snapshot.tariff || 8.0}/kWh\n\n`;

    csv += `Appliance ID,Name,Location,Status,Power (W),Energy (kWh),Share (%),Cost (₹),Carbon (kg CO2)\n`;
    for (const item of attribution.breakdown) {
      csv += `${item.id},"${item.name}","${item.location || 'Home'}",${item.isOn ? 'ON' : 'OFF'},${item.currentPower || 0},${item.energyKwh},${item.percentage}%,${item.cost},${item.carbonKg}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="smart-energy-report-${new Date().toISOString().slice(0,10)}.csv"`);
    res.send(csv);
  });

  // GET /api/analytics/forecast
  router.get('/forecast', (req, res) => {
    const clientHour = req.query.clientHour;
    const forecast = analyticsService.getDemandForecast(clientHour);
    res.json({
      success: true,
      data: forecast
    });
  });

  // GET /api/analytics/cost-intelligence & alias /cost
  router.get(['/cost-intelligence', '/cost'], (req, res) => {
    const costInfo = analyticsService.getCostIntelligence();
    res.json({
      success: true,
      data: costInfo
    });
  });

  // GET /api/analytics/carbon-intelligence & alias /carbon
  router.get(['/carbon-intelligence', '/carbon'], (req, res) => {
    const carbonInfo = analyticsService.getCarbonIntelligence();
    res.json({
      success: true,
      data: carbonInfo
    });
  });

  // GET /api/analytics/recommendations
  router.get('/recommendations', (req, res) => {
    const recommendations = recommendationService.generateRecommendations();
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  });

  return router;
}
