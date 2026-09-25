import { Router } from 'express';
import crypto from 'crypto';
import { db, generateSalt, hashPassword, verifyPassword } from '../config/database.js';

export function createAuthRouter(simulationEngine, mqttService) {
  const router = Router();

  // Keep track of which resident is currently active on the gateway simulation
  let activeUserId = 'usr_dhanush';

  // Helper to get appliances for a specific user
  function getUserApplianceStates(userId) {
    const rows = db.prepare('SELECT appliance_id, is_on FROM user_appliance_states WHERE user_id = ?').all(userId);
    const map = {};
    for (const r of rows) {
      map[r.appliance_id] = Boolean(r.is_on);
    }
    return map;
  }

  // Helper to sync simulation engine with a user's states
  function syncEngineToUser(userId) {
    activeUserId = userId;
    simulationEngine.loadActiveUser(userId);
    if (mqttService) {
      const states = getUserApplianceStates(userId);
      for (const [appId, isOn] of Object.entries(states)) {
        mqttService.publishRelayCommand(appId, isOn);
      }
    }
  }

  // GET /api/auth/users - List all local resident accounts for demo switching
  router.get('/users', (req, res) => {
    try {
      const users = db.prepare(`
        SELECT id, name, door_no, address, consumer_id, email, base_monthly_kwh, daily_avg_kwh, comparison_pct, created_at
        FROM users
        ORDER BY created_at ASC
      `).all();

      res.json({
        success: true,
        activeUserId,
        users
      });
    } catch (err) {
      console.error('[Auth] Error listing users:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve resident accounts.' });
    }
  });

  // GET /api/auth/me - Get current user profile and appliance states
  router.get('/me', (req, res) => {
    try {
      const userId = req.query.userId || activeUserId;
      const user = db.prepare(`
        SELECT id, name, door_no, address, consumer_id, email, base_monthly_kwh, daily_avg_kwh, comparison_pct, created_at
        FROM users
        WHERE id = ?
      `).get(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'Resident account not found.' });
      }

      const applianceStates = getUserApplianceStates(userId);

      res.json({
        success: true,
        user,
        applianceStates,
        isActive: userId === activeUserId
      });
    } catch (err) {
      console.error('[Auth] Error getting user profile:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
    }
  });

  // POST /api/auth/signup - Register a new resident locally
  router.post('/signup', (req, res) => {
    try {
      const { name, doorNo, address, email, password } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Full Name is required.' });
      }
      if (!doorNo || !doorNo.trim()) {
        return res.status(400).json({ success: false, message: 'Door / Flat number is required.' });
      }
      if (!address || !address.trim()) {
        return res.status(400).json({ success: false, message: 'Full Address is required.' });
      }
      if (!email || !email.trim() || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'A valid email address is required.' });
      }
      if (!password || password.length < 4) {
        return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long.' });
      }

      const cleanEmail = email.trim().toLowerCase();

      // Check if user already exists
      const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }

      // Generate unique user ID and Salt
      const userId = `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);

      // Generate realistic BESCOM Consumer ID: BESCOM-BLR-D{cleanDoor}-{Hex4}
      const doorMatch = doorNo.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() || 'RES';
      const randHex = crypto.randomBytes(2).toString('hex').toUpperCase();
      const consumerId = `BESCOM-BLR-D${doorMatch}-${randHex}`;

      const insertUser = db.prepare(`
        INSERT INTO users (id, name, door_no, address, consumer_id, email, password_hash, salt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertState = db.prepare(`
        INSERT OR REPLACE INTO user_appliance_states (user_id, appliance_id, is_on)
        VALUES (?, ?, ?)
      `);

      // All default appliances
      const allAppliances = db.prepare('SELECT id FROM appliances').all();

      const tx = db.transaction(() => {
        insertUser.run(
          userId,
          name.trim(),
          doorNo.trim(),
          address.trim(),
          consumerId,
          cleanEmail,
          passwordHash,
          salt
        );

        // Seed default appliance states for this new resident (sensible standard states)
        const defaultOn = ['AC001', 'FR001', 'TV001', 'LT001', 'FN001'];
        for (const app of allAppliances) {
          const isOn = defaultOn.includes(app.id) ? 1 : 0;
          insertState.run(userId, app.id, isOn);
        }
      });

      tx();

      // Automatically sync engine to this newly registered resident
      syncEngineToUser(userId);

      const newUser = {
        id: userId,
        name: name.trim(),
        door_no: doorNo.trim(),
        address: address.trim(),
        consumer_id: consumerId,
        email: cleanEmail,
        created_at: new Date().toISOString()
      };

      const applianceStates = getUserApplianceStates(userId);

      console.log(`[Auth] Registered new resident: ${newUser.name} (${newUser.door_no}) - Consumer ID: ${consumerId}`);

      res.status(201).json({
        success: true,
        message: 'Resident account created successfully!',
        user: newUser,
        applianceStates
      });
    } catch (err) {
      console.error('[Auth] Signup error:', err);
      res.status(500).json({ success: false, message: 'Failed to create resident account.' });
    }
  });

  // POST /api/auth/login - Local resident authentication
  router.post('/login', (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isValid = verifyPassword(password, user.salt, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // Sync simulation engine states to this resident
      syncEngineToUser(user.id);

      const applianceStates = getUserApplianceStates(user.id);

      const safeUser = {
        id: user.id,
        name: user.name,
        door_no: user.door_no,
        address: user.address,
        consumer_id: user.consumer_id,
        email: user.email,
        created_at: user.created_at
      };

      console.log(`[Auth] Resident signed in: ${safeUser.name} (${safeUser.door_no})`);

      res.json({
        success: true,
        message: `Welcome back, ${safeUser.name}!`,
        user: safeUser,
        applianceStates
      });
    } catch (err) {
      console.error('[Auth] Login error:', err);
      res.status(500).json({ success: false, message: 'Authentication failed.' });
    }
  });

  // POST /api/auth/switch - Switch active resident context
  router.post('/switch', (req, res) => {
    try {
      const { userId } = req.body;

      const user = db.prepare(`
        SELECT id, name, door_no, address, consumer_id, email, base_monthly_kwh, daily_avg_kwh, comparison_pct, created_at
        FROM users
        WHERE id = ?
      `).get(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'Resident not found.' });
      }

      syncEngineToUser(user.id);
      const applianceStates = getUserApplianceStates(user.id);

      console.log(`[Auth] Switched active resident to: ${user.name} (${user.door_no})`);

      res.json({
        success: true,
        message: `Active profile switched to ${user.name}`,
        user,
        applianceStates
      });
    } catch (err) {
      console.error('[Auth] Switch error:', err);
      res.status(500).json({ success: false, message: 'Failed to switch resident.' });
    }
  });

  // POST /api/auth/toggle - Toggle an appliance state for a specific user
  router.post('/toggle', (req, res) => {
    try {
      const { userId, applianceId, state } = req.body;

      const targetUserId = userId || activeUserId;
      const targetState = state ? 1 : 0;

      db.prepare(`
        INSERT OR REPLACE INTO user_appliance_states (user_id, appliance_id, is_on, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `).run(targetUserId, applianceId, targetState);

      // If this user is currently active on the simulation engine, update the engine too
      if (targetUserId === activeUserId) {
        simulationEngine.toggleAppliance(applianceId, Boolean(state));
        if (mqttService) {
          mqttService.publishRelayCommand(applianceId, Boolean(state));
        }
      }

      res.json({
        success: true,
        userId: targetUserId,
        applianceId,
        isOn: Boolean(state)
      });
    } catch (err) {
      console.error('[Auth] Toggle error:', err);
      res.status(500).json({ success: false, message: 'Failed to update appliance state.' });
    }
  });

  return router;
}
