// Force Indian Standard Time (IST) timezone for residential energy model & Time-of-Day tariff compliance
process.env.TZ = process.env.TZ || 'Asia/Kolkata';

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { SYSTEM_CONFIG } from './config/constants.js';
import { initDatabase } from './config/database.js';
import { SimulationEngine } from './simulation/SimulationEngine.js';
import { MQTTBrokerService } from './mqtt/broker.js';
import { AnomalyService } from './services/anomalyService.js';
import { RecommendationService } from './services/recommendationService.js';
import { SchedulerService } from './services/schedulerService.js';
import { initSocketHandler } from './sockets/socketHandler.js';

import { createApplianceRouter } from './routes/appliances.js';
import { createAnalyticsRouter } from './routes/analytics.js';
import { createAlertsRouter } from './routes/alerts.js';
import { createSchedulesRouter } from './routes/schedules.js';
import { createSimulationRouter } from './routes/simulation.js';
import { createSystemRouter } from './routes/system.js';
import { createAuthRouter } from './routes/auth.js';
import { createAppUpdateRouter } from './routes/appUpdate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Initialize SQLite Database
initDatabase();

// 2. Initialize Simulation Engine & IoT Controller
const simulationEngine = new SimulationEngine();

// 3. Initialize MQTT Broker Service (Port 1883)
const mqttService = new MQTTBrokerService(simulationEngine);
mqttService.start();

// 4. Initialize Domain Services
const anomalyService = new AnomalyService(simulationEngine);
const recommendationService = new RecommendationService(simulationEngine);
const schedulerService = new SchedulerService(simulationEngine);
schedulerService.start();

// 5. Initialize Express App & HTTP Server
const app = express();
const httpServer = createServer(app);

// Enable CORS for cross-device mobile Wi-Fi connectivity
app.use(cors({ origin: '*' }));
app.use(express.json());

// 6. Initialize Socket.IO Server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
initSocketHandler(io, simulationEngine, anomalyService, recommendationService, mqttService);

// 7. Mount REST API Routes
app.use('/api/auth', createAuthRouter(simulationEngine, mqttService));
const applianceRouter = createApplianceRouter(simulationEngine, mqttService);
app.use('/api/appliances', applianceRouter);
app.use('/api/devices', applianceRouter); // Direct alias for devices

// Dedicated Single-Room Architecture Endpoint
app.get('/api/rooms', (req, res) => {
  const snapshot = simulationEngine.getSnapshot();
  res.json({
    success: true,
    count: 1,
    data: [snapshot.livingRoom]
  });
});

// Authoritative Single-Room Electrical Topology Endpoint
app.get('/api/topology', (req, res) => {
  const snapshot = simulationEngine.getSnapshot();
  res.json({
    success: true,
    data: snapshot.topology
  });
});

// Real-Time Energy Summary Endpoint
app.get('/api/energy/summary', (req, res) => {
  const snapshot = simulationEngine.getSnapshot();
  res.json({
    success: true,
    data: {
      gridVoltage: snapshot.transformer.outputVoltage,
      frequencyHz: snapshot.transformer.frequencyHz,
      totalActivePower: snapshot.distributionBoard.totalActivePower,
      totalCurrent: snapshot.distributionBoard.totalCurrent,
      totalEnergyTodayKwh: snapshot.livingRoom.energyConsumedTodayKwh,
      activeDevicesCount: snapshot.livingRoom.activeAppliancesCount,
      totalDevicesCount: snapshot.livingRoom.totalAppliancesCount,
      transformerLoadPercentage: snapshot.transformer.loadPercentage,
      mainBreakerStatus: snapshot.distributionBoard.status
    }
  });
});

app.use('/api/analytics', createAnalyticsRouter(analyticsServiceInstance(analyticsServiceWrapper(simulationEngine)), recommendationService, simulationEngine));
app.use('/api/alerts', createAlertsRouter(anomalyService));
app.use('/api/schedules', createSchedulesRouter(schedulerService));
app.use('/api/simulation', createSimulationRouter(simulationEngine));
app.use('/api/system', createSystemRouter(simulationEngine, mqttService));
app.use('/api/app/update', createAppUpdateRouter());

// Helper for AnalyticsService import cleanly
import { AnalyticsService } from './services/analyticsService.js';
function analyticsServiceInstance() {
  return new AnalyticsService(simulationEngine);
}
function analyticsServiceWrapper(engine) {
  return new AnalyticsService(engine);
}

// Direct APK download route for mobile devices on local Wi-Fi
app.get('/download/apk', (req, res) => {
  const apkPath = path.resolve(__dirname, '../../GridSense-Android-v2.0.apk');
  if (fs.existsSync(apkPath)) {
    res.download(apkPath, 'GridSense-Android-v2.0.apk');
  } else {
    res.status(404).send('APK not found on server');
  }
});

// 8. Serve Frontend Static Production Build (if present)
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    // If request does not start with /api, serve index.html
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    } else {
      res.status(404).json({ success: false, message: `API route not found: ${req.path}` });
    }
  });
  console.log(`[Frontend] Serving pre-built web client from ${frontendDistPath}`);
}

// 9. Start Simulation Engine Clock
simulationEngine.start();

// 10. Listen on Port 5000 bound to 0.0.0.0 (enables local Wi-Fi mobile access)
const PORT = SYSTEM_CONFIG.PORT;
httpServer.listen(PORT, '0.0.0.0', () => {
  const localIp = simulationEngine.esp32.getLocalIP();
  console.log('\n===============================================================');
  console.log('⚡ SMART ENERGY CONVERTER - SIMULATION SYSTEM ⚡');
  console.log('===============================================================');
  console.log(`📡 IoT Edge Gateway:  ${SYSTEM_CONFIG.DEVICE_ID} (ONLINE)`);
  console.log(`🔌 MQTT Broker:       mqtt://localhost:${SYSTEM_CONFIG.MQTT_PORT}`);
  console.log(`💻 Laptop Dashboard:  http://localhost:${PORT}`);
  console.log(`📱 Mobile (Same Wi-Fi): http://${localIp}:${PORT}`);
  console.log('===============================================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down Smart Energy Conservation Simulation...');
  simulationEngine.stop();
  schedulerService.stop();
  process.exit(0);
});
