import { Router } from 'express';

export function createSchedulesRouter(schedulerService) {
  const router = Router();

  // GET /api/schedules
  router.get('/', (req, res) => {
    const schedules = schedulerService.getSchedules();
    res.json({
      success: true,
      data: schedules
    });
  });

  // POST /api/schedules
  router.post('/', (req, res) => {
    const { applianceId, action, time, days } = req.body;
    if (!applianceId || !action || !time) {
      return res.status(400).json({ success: false, message: 'Missing required schedule fields (applianceId, action, time).' });
    }

    try {
      const created = schedulerService.addSchedule({ applianceId, action, time, days });
      res.status(201).json({
        success: true,
        message: 'Schedule created successfully.',
        data: created
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // POST /api/schedules/:id/toggle
  router.post('/:id/toggle', (req, res) => {
    const { id } = req.params;
    const ok = schedulerService.toggleSchedule(id);
    if (!ok) return res.status(404).json({ success: false, message: 'Schedule not found.' });
    res.json({ success: true, message: 'Schedule status toggled.' });
  });

  // GET /api/schedules/scenes
  router.get('/scenes', (req, res) => {
    res.json({
      success: true,
      data: schedulerService.getScenes()
    });
  });

  // POST /api/schedules/scenes/:id/apply (or activate)
  const handleApplyScene = (req, res) => {
    const { id } = req.params;
    const result = schedulerService.applyScene(id);
    if (!result) return res.status(404).json({ success: false, message: 'Scene not found.' });
    res.json({
      success: true,
      message: `Scene '${result.scene.name}' executed successfully.`,
      data: result
    });
  };
  router.post('/scenes/:id/apply', handleApplyScene);
  router.post('/scenes/:id/activate', handleApplyScene);

  // GET /api/schedules/rules
  router.get('/rules', (req, res) => {
    res.json({
      success: true,
      data: schedulerService.getRules()
    });
  });

  // GET /api/schedules/load-shifting
  router.get('/load-shifting', (req, res) => {
    res.json({
      success: true,
      data: schedulerService.getLoadShiftingAnalysis()
    });
  });

  // DELETE /api/schedules/:id
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const ok = schedulerService.deleteSchedule(id);
    if (!ok) return res.status(404).json({ success: false, message: 'Schedule not found.' });
    res.json({ success: true, message: 'Schedule deleted.' });
  });

  return router;
}
