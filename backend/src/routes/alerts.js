import { Router } from 'express';

export function createAlertsRouter(anomalyService) {
  const router = Router();

  // GET /api/alerts
  router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 50;
    const alerts = anomalyService.getAlerts(limit);
    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  });

  // POST /api/alerts/:id/resolve
  router.post('/:id/resolve', (req, res) => {
    const { id } = req.params;
    const resolved = anomalyService.resolveAlert(id);
    if (!resolved) {
      return res.status(404).json({ success: false, message: 'Alert not found or could not be resolved.' });
    }
    res.json({
      success: true,
      message: `Alert #${id} marked as resolved.`
    });
  });

  return router;
}
