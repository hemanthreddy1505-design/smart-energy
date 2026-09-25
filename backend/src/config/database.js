import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { INITIAL_APPLIANCES, SYSTEM_CONFIG } from './constants.js';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../tracker.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable WAL mode for high performance concurrent read/write
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appliances (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      rated_power REAL NOT NULL,
      min_power REAL NOT NULL,
      max_power REAL NOT NULL,
      power_factor REAL NOT NULL,
      is_on INTEGER DEFAULT 1,
      is_anomaly INTEGER DEFAULT 0,
      total_runtime_seconds INTEGER DEFAULT 0,
      total_energy_kwh REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sensor_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      appliance_id TEXT NOT NULL,
      voltage REAL NOT NULL,
      current REAL NOT NULL,
      power_factor REAL NOT NULL,
      active_power REAL NOT NULL,
      apparent_power REAL NOT NULL,
      energy_delta_kwh REAL NOT NULL,
      status TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON sensor_readings(timestamp);
    CREATE INDEX IF NOT EXISTS idx_readings_appliance ON sensor_readings(appliance_id, timestamp);

    CREATE TABLE IF NOT EXISTS hourly_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_hour TEXT NOT NULL, -- 'YYYY-MM-DD HH:00'
      appliance_id TEXT NOT NULL,
      total_energy_kwh REAL DEFAULT 0,
      avg_power_w REAL DEFAULT 0,
      peak_power_w REAL DEFAULT 0,
      cost REAL DEFAULT 0,
      carbon_kg REAL DEFAULT 0,
      UNIQUE(date_hour, appliance_id)
    );

    CREATE TABLE IF NOT EXISTS daily_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'usr_dhanush',
      date TEXT NOT NULL, -- 'YYYY-MM-DD'
      appliance_id TEXT NOT NULL,
      total_energy_kwh REAL DEFAULT 0,
      avg_power_w REAL DEFAULT 0,
      peak_power_w REAL DEFAULT 0,
      total_runtime_minutes INTEGER DEFAULT 0,
      cost REAL DEFAULT 0,
      carbon_kg REAL DEFAULT 0,
      UNIQUE(user_id, date, appliance_id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appliance_id TEXT NOT NULL,
      alert_type TEXT NOT NULL,
      severity TEXT NOT NULL, -- 'INFO', 'WARNING', 'CRITICAL'
      message TEXT NOT NULL,
      value REAL,
      threshold REAL,
      is_resolved INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appliance_id TEXT NOT NULL,
      action TEXT NOT NULL, -- 'ON' or 'OFF'
      time TEXT NOT NULL, -- 'HH:MM'
      days TEXT NOT NULL, -- JSON array string
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      door_no TEXT NOT NULL,
      address TEXT NOT NULL,
      consumer_id TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      base_monthly_kwh REAL DEFAULT 120.0,
      daily_avg_kwh REAL DEFAULT 4.0,
      comparison_pct REAL DEFAULT -8.4,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_appliance_states (
      user_id TEXT NOT NULL,
      appliance_id TEXT NOT NULL,
      is_on INTEGER DEFAULT 1,
      cumulative_energy_kwh REAL DEFAULT 0,
      runtime_seconds INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, appliance_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Perform backward-compatible migrations for existing SQLite stores
  try { db.prepare('ALTER TABLE users ADD COLUMN base_monthly_kwh REAL DEFAULT 120.0').run(); } catch (_) {}
  try { db.prepare('ALTER TABLE users ADD COLUMN daily_avg_kwh REAL DEFAULT 4.0').run(); } catch (_) {}
  try { db.prepare('ALTER TABLE users ADD COLUMN comparison_pct REAL DEFAULT -8.4').run(); } catch (_) {}
  try { db.prepare('ALTER TABLE user_appliance_states ADD COLUMN cumulative_energy_kwh REAL DEFAULT 0').run(); } catch (_) {}
  try { db.prepare('ALTER TABLE user_appliance_states ADD COLUMN runtime_seconds INTEGER DEFAULT 0').run(); } catch (_) {}
  try { db.prepare('ALTER TABLE daily_analytics ADD COLUMN user_id TEXT DEFAULT "usr_dhanush"').run(); } catch (_) {}
  try {
    const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='daily_analytics'").get();
    if (tableInfo && tableInfo.sql.includes('UNIQUE(date, appliance_id)')) {
      db.exec(`
        CREATE TABLE daily_analytics_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT DEFAULT 'usr_dhanush',
          date TEXT NOT NULL,
          appliance_id TEXT NOT NULL,
          total_energy_kwh REAL DEFAULT 0,
          avg_power_w REAL DEFAULT 0,
          peak_power_w REAL DEFAULT 0,
          total_runtime_minutes INTEGER DEFAULT 0,
          cost REAL DEFAULT 0,
          carbon_kg REAL DEFAULT 0,
          UNIQUE(user_id, date, appliance_id)
        );
        INSERT OR IGNORE INTO daily_analytics_new (user_id, date, appliance_id, total_energy_kwh, avg_power_w, peak_power_w, total_runtime_minutes, cost, carbon_kg)
        SELECT COALESCE(user_id, 'usr_dhanush'), date, appliance_id, total_energy_kwh, avg_power_w, peak_power_w, total_runtime_minutes, cost, carbon_kg
        FROM daily_analytics;
        DROP TABLE daily_analytics;
        ALTER TABLE daily_analytics_new RENAME TO daily_analytics;
      `);
      console.log('[Database] Migrated daily_analytics table to composite unique constraint (user_id, date, appliance_id)');
      seedHistoricalAnalytics();
    }
  } catch (err) {
    console.warn('[Database] daily_analytics migration warning:', err.message);
  }

  // Seed default users & per-user usage profiles
  seedDefaultUsers();

  // Seed default settings if empty
  const getSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
  if (!getSetting.get('tariff_per_kwh')) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('tariff_per_kwh', String(SYSTEM_CONFIG.DEFAULT_TARIFF));
  }
  if (!getSetting.get('carbon_factor')) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('carbon_factor', String(SYSTEM_CONFIG.DEFAULT_CARBON_FACTOR));
  }
  if (!getSetting.get('sim_speed')) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('sim_speed', '1');
  }

  // Seed default OTA Update settings
  const defaultOtaSettings = {
    'ota_is_active': '1',
    'ota_version_name': '2.1.0',
    'ota_version_code': '3',
    'ota_min_version_code': '1',
    'ota_title': 'GridSense v2.1.0 Update Available',
    'ota_release_notes': '• Multi-tenant resident switching (Dhanush Yadav & Priya Sharma)\n• User-specific diurnal energy curves & billing breakdown\n• Real-time sub-metering telemetry sync\n• In-app Over-The-Air (OTA) auto-updating',
    'ota_apk_url': '/download/apk',
    'ota_file_size': '8.1 MB',
    'ota_is_mandatory': '0'
  };
  for (const [key, val] of Object.entries(defaultOtaSettings)) {
    if (!getSetting.get(key)) {
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, val);
    }
  }

  // Seed appliances if empty
  const countAppliances = db.prepare('SELECT COUNT(*) as count FROM appliances').get().count;
  if (countAppliances === 0) {
    const insertAppliance = db.prepare(`
      INSERT INTO appliances (id, name, type, location, rated_power, min_power, max_power, power_factor, is_on, total_energy_kwh)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Pre-calculate realistic base cumulative energy (e.g. today's consumption so far)
    const initialEnergyEstimates = {
      'AC001': 4.35,
      'FR001': 1.82,
      'TV001': 0.68,
      'PC001': 1.45,
      'LT001': 0.16,
      'FN001': 0.42,
      'WM001': 0.85,
      'GH001': 2.10
    };

    const insertTx = db.transaction((appliances) => {
      for (const app of appliances) {
        insertAppliance.run(
          app.id,
          app.name,
          app.type,
          app.location,
          app.ratedPower,
          app.minPower,
          app.maxPower,
          app.powerFactor,
          app.isOn ? 1 : 0,
          initialEnergyEstimates[app.id] || 0
        );
      }
    });

    insertTx(INITIAL_APPLIANCES);
    console.log(`[Database] Seeded ${INITIAL_APPLIANCES.length} virtual appliances.`);

    // Seed realistic 7-day historical daily analytics so charts are ready for demonstration immediately!
    seedHistoricalAnalytics();
    seedDefaultSchedules();
  }
}

function seedHistoricalAnalytics() {
  const insertDaily = db.prepare(`
    INSERT OR REPLACE INTO daily_analytics (user_id, date, appliance_id, total_energy_kwh, avg_power_w, peak_power_w, total_runtime_minutes, cost, carbon_kg)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date();
  const tariff = SYSTEM_CONFIG.DEFAULT_TARIFF;
  const carbonFactor = SYSTEM_CONFIG.DEFAULT_CARBON_FACTOR;

  // Dhanush's consumption profile (Heavy urban load with AC, PC workstation, TV)
  const dhanushConsumptions = {
    'AC001': { kwh: 7.2, avgW: 1100, peakW: 1750, mins: 390 },
    'FR001': { kwh: 2.1, avgW: 88, peakW: 210, mins: 1440 },
    'TV001': { kwh: 1.15, avgW: 115, peakW: 135, mins: 600 },
    'PC001': { kwh: 2.45, avgW: 180, peakW: 300, mins: 820 },
    'LT001': { kwh: 0.28, avgW: 18, peakW: 20, mins: 900 },
    'FN001': { kwh: 0.75, avgW: 65, peakW: 75, mins: 700 },
    'WM001': { kwh: 0.60, avgW: 450, peakW: 1650, mins: 80 },
    'GH001': { kwh: 1.80, avgW: 2200, peakW: 2250, mins: 50 }
  };

  // Priya's consumption profile (Eco-conscious villa, solar hybrid, off-peak shifting)
  const priyaConsumptions = {
    'AC001': { kwh: 0.0, avgW: 0, peakW: 0, mins: 0 },
    'FR001': { kwh: 1.45, avgW: 65, peakW: 150, mins: 1440 },
    'TV001': { kwh: 0.25, avgW: 75, peakW: 90, mins: 120 },
    'PC001': { kwh: 0.0, avgW: 0, peakW: 0, mins: 0 },
    'LT001': { kwh: 0.18, avgW: 15, peakW: 18, mins: 720 },
    'FN001': { kwh: 0.45, avgW: 55, peakW: 65, mins: 480 },
    'WM001': { kwh: 1.85, avgW: 420, peakW: 1550, mins: 260 },
    'GH001': { kwh: 2.80, avgW: 2100, peakW: 2200, mins: 80 }
  };

  const seedTx = db.transaction(() => {
    // Generate data for past 7 days for both users
    for (let i = 7; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // 1. Seed Dhanush
      for (const [appId, stats] of Object.entries(dhanushConsumptions)) {
        const factor = 0.92 + Math.random() * 0.16;
        const kwh = Number((stats.kwh * factor).toFixed(2));
        const cost = Number((kwh * tariff).toFixed(2));
        const carbon = Number((kwh * carbonFactor).toFixed(2));
        const peakW = Math.round(stats.peakW * (0.95 + Math.random() * 0.1));
        const avgW = Math.round(stats.avgW * factor);
        const mins = Math.round(stats.mins * factor);
        insertDaily.run('usr_dhanush', dateStr, appId, kwh, avgW, peakW, mins, cost, carbon);
      }

      // 2. Seed Priya
      for (const [appId, stats] of Object.entries(priyaConsumptions)) {
        const factor = 0.90 + Math.random() * 0.20;
        const kwh = Number((stats.kwh * factor).toFixed(2));
        const cost = Number((kwh * tariff).toFixed(2));
        const carbon = Number((kwh * carbonFactor).toFixed(2));
        const peakW = Math.round(stats.peakW * (0.95 + Math.random() * 0.1));
        const avgW = Math.round(stats.avgW * factor);
        const mins = Math.round(stats.mins * factor);
        insertDaily.run('usr_priya', dateStr, appId, kwh, avgW, peakW, mins, cost, carbon);
      }
    }
  });

  seedTx();
  console.log('[Database] Seeded 7 days of distinct historical analytics for Dhanush and Priya.');
}

function seedDefaultSchedules() {
  const insertSchedule = db.prepare(`
    INSERT INTO schedules (appliance_id, action, time, days, is_active)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertSchedule.run('GH001', 'ON', '06:30', JSON.stringify(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']), 1);
  insertSchedule.run('GH001', 'OFF', '07:30', JSON.stringify(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']), 1);
  insertSchedule.run('AC001', 'OFF', '07:00', JSON.stringify(['MON', 'TUE', 'WED', 'THU', 'FRI']), 1);
  console.log('[Database] Seeded default automated conservation schedules.');
}

export function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

export function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password, salt, storedHash) {
  const hash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

export function seedDefaultUsers() {
  const upsertUser = db.prepare(`
    INSERT INTO users (id, name, door_no, address, consumer_id, email, password_hash, salt, base_monthly_kwh, daily_avg_kwh, comparison_pct)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      base_monthly_kwh = excluded.base_monthly_kwh,
      daily_avg_kwh = excluded.daily_avg_kwh,
      comparison_pct = excluded.comparison_pct
  `);

  const insertState = db.prepare(`
    INSERT OR REPLACE INTO user_appliance_states (user_id, appliance_id, is_on, cumulative_energy_kwh, runtime_seconds)
    VALUES (?, ?, ?, ?, ?)
  `);

  const dhanushSalt = generateSalt();
  const dhanushHash = hashPassword('password123', dhanushSalt);

  const priyaSalt = generateSalt();
  const priyaHash = hashPassword('password123', priyaSalt);

  const seedTx = db.transaction(() => {
    // 1. Dhanush Yadav (High Urban Domestic Load: 148.2 kWh baseline, 11.45 kWh today)
    upsertUser.run(
      'usr_dhanush',
      'Dhanush Yadav',
      'Flat 402, Block B',
      'Green Glen Layout, Bellandur, Bengaluru - 560103',
      'BESCOM-BLR-D402-A81',
      'dhanush@smartenergy.in',
      dhanushHash,
      dhanushSalt,
      148.2, // base_monthly_kwh
      4.94,  // daily_avg_kwh
      4.2    // comparison_pct (+4.2% vs last month)
    );

    // Dhanush's appliances state: AC, Fridge, TV, PC, Light, Fan ON (11.45 kWh total today)
    const dhanushStates = {
      'AC001': { isOn: 1, kwh: 5.40, runtime: 14400 },
      'FR001': { isOn: 1, kwh: 1.85, runtime: 43200 },
      'TV001': { isOn: 1, kwh: 0.95, runtime: 18000 },
      'PC001': { isOn: 1, kwh: 1.60, runtime: 28800 },
      'LT001': { isOn: 1, kwh: 0.25, runtime: 36000 },
      'FN001': { isOn: 1, kwh: 0.55, runtime: 28800 },
      'WM001': { isOn: 0, kwh: 0.00, runtime: 0 },
      'GH001': { isOn: 0, kwh: 0.85, runtime: 1800 }
    };
    for (const [appId, s] of Object.entries(dhanushStates)) {
      insertState.run('usr_dhanush', appId, s.isOn, s.kwh, s.runtime);
    }

    // 2. Priya Sharma (Eco Solar Hybrid Villa: 76.4 kWh baseline, 5.85 kWh today)
    upsertUser.run(
      'usr_priya',
      'Priya Sharma',
      'Villa 12',
      'Prestige Ozone, Whitefield, Bengaluru - 560066',
      'BESCOM-BLR-V012-C44',
      'priya@smartenergy.in',
      priyaHash,
      priyaSalt,
      76.4,  // base_monthly_kwh
      2.55,  // daily_avg_kwh
      -18.5  // comparison_pct (-18.5% vs last month - Eco savings!)
    );

    // Priya's appliances state: AC OFF, Fridge ON, TV OFF, PC OFF, Light ON, Fan ON, Washer ON, Geyser ON (5.85 kWh total today)
    const priyaStates = {
      'AC001': { isOn: 0, kwh: 0.00, runtime: 0 },
      'FR001': { isOn: 1, kwh: 1.15, runtime: 43200 },
      'TV001': { isOn: 0, kwh: 0.12, runtime: 3600 },
      'PC001': { isOn: 0, kwh: 0.00, runtime: 0 },
      'LT001': { isOn: 1, kwh: 0.18, runtime: 32400 },
      'FN001': { isOn: 1, kwh: 0.35, runtime: 21600 },
      'WM001': { isOn: 1, kwh: 1.65, runtime: 7200 },
      'GH001': { isOn: 1, kwh: 2.40, runtime: 3900 }
    };
    for (const [appId, s] of Object.entries(priyaStates)) {
      insertState.run('usr_priya', appId, s.isOn, s.kwh, s.runtime);
    }
  });

  seedTx();
  console.log('[Database] Seeded distinct user profiles & usages for Dhanush Yadav and Priya Sharma.');
  seedHistoricalAnalytics();
}
