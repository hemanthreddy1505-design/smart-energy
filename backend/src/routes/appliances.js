import { Router } from 'express';

export function createApplianceRouter(simulationEngine, mqttService) {
  const router = Router();

  // GET /api/appliances - List all appliances with latest sensor readings
  router.get('/', (req, res) => {
    const snapshot = simulationEngine.getSnapshot();
    res.json({
      success: true,
      count: snapshot.appliances.length,
      data: snapshot.appliances
    });
  });

  // POST /api/appliances/:id/toggle - Remote relay switch
  router.post('/:id/toggle', (req, res) => {
    const { id } = req.params;
    const { state } = req.body; // boolean or undefined to toggle

    const updated = simulationEngine.toggleAppliance(id, state);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Appliance with ID ${id} not found.` });
    }

    // Mirror to MQTT topic if active
    if (mqttService) {
      mqttService.publishRelayCommand(id, updated.isOn);
    }

    res.json({
      success: true,
      message: `Appliance ${updated.name} turned ${updated.isOn ? 'ON' : 'OFF'} successfully.`,
      data: updated
    });
  });

  // PATCH /api/appliances/:id - Update appliance state or parameters
  router.patch('/:id', (req, res) => {
    const { id } = req.params;
    const { state, isOn } = req.body;
    const targetState = state !== undefined ? state : isOn;

    const updated = simulationEngine.toggleAppliance(id, targetState);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Appliance with ID ${id} not found.` });
    }

    if (mqttService) {
      mqttService.publishRelayCommand(id, updated.isOn);
    }

    res.json({
      success: true,
      message: `Appliance ${updated.name} updated successfully.`,
      data: updated
    });
  });

  // POST /api/appliances/:id/anomaly - Inject / clear anomaly
  router.post('/:id/anomaly', (req, res) => {
    const { id } = req.params;
    const { isAnomaly } = req.body;

    const updated = simulationEngine.setApplianceAnomaly(id, isAnomaly !== undefined ? isAnomaly : true);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Appliance with ID ${id} not found.` });
    }

    res.json({
      success: true,
      message: `Appliance ${updated.name} anomaly state set to ${updated.isAnomaly}.`,
      data: updated
    });
  });

  return router;
}
