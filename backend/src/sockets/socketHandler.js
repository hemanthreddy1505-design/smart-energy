export function initSocketHandler(io, simulationEngine, anomalyService, recommendationService, mqttService) {
  io.on('connection', (socket) => {
    const clientIp = socket.handshake.address;
    console.log(`[Socket.IO] New client connected: ${socket.id} from ${clientIp}`);

    // Send initial snapshot immediately upon connection
    const snapshot = simulationEngine.getSnapshot();
    const recommendations = recommendationService.generateRecommendations();
    const recentAlerts = anomalyService.getAlerts(10);

    socket.emit('init:snapshot', {
      ...snapshot,
      recommendations,
      recentAlerts,
      serverTime: new Date().toISOString()
    });

    // Remote control from phone or laptop
    socket.on('appliance:toggle', (data) => {
      const { id, state } = data;
      console.log(`[Socket.IO] Remote control received from ${socket.id} -> ${id}: ${state}`);
      const updated = simulationEngine.toggleAppliance(id, state);

      if (updated) {
        if (mqttService) {
          mqttService.publishRelayCommand(id, updated.isOn);
        }
        // Broadcast state change to ALL clients (instant sync on laptop and phone)
        io.emit('appliance:state_changed', updated);
      }
    });

    // Simulation speed change
    socket.on('simulation:set_speed', (speed) => {
      const newSpeed = simulationEngine.setSpeed(speed);
      io.emit('simulation:speed_changed', newSpeed);
    });

    // Inject anomaly
    socket.on('simulation:inject_anomaly', (data) => {
      const { id = 'AC001', isAnomaly = true } = data || {};
      const updated = simulationEngine.setApplianceAnomaly(id, isAnomaly);
      if (updated) {
        io.emit('appliance:state_changed', updated);
      }
    });

    // Simulation reset
    socket.on('simulation:reset', () => {
      simulationEngine.reset();
      io.emit('simulation:reset_done');
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  // Broadcast simulation engine tick updates to all clients
  simulationEngine.on('telemetry:sample', (telemetry) => {
    io.emit('telemetry:update', telemetry);
  });

  // Broadcast anomaly alerts as push notifications
  anomalyService.on('alert:new', (alert) => {
    io.emit('alert:new', alert);
  });

  // Periodically emit recommendations update (every 10 ticks)
  let tickCount = 0;
  simulationEngine.on('telemetry:sample', () => {
    tickCount++;
    if (tickCount % 10 === 0) {
      const recs = recommendationService.generateRecommendations();
      io.emit('recommendations:update', recs);
    }
  });
}
