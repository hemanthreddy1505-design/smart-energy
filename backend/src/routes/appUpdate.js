import { Router } from 'express';
import { db } from '../config/database.js';

export function createAppUpdateRouter() {
  const router = Router();

  function getOtaSettings() {
    const rows = db.prepare(`
      SELECT key, value FROM settings 
      WHERE key LIKE 'ota_%'
    `).all();
    const config = {};
    for (const r of rows) {
      config[r.key] = r.value;
    }
    return {
      isActive: config.ota_is_active === '1',
      versionName: config.ota_version_name || '2.1.0',
      versionCode: parseInt(config.ota_version_code || '3', 10),
      minVersionCode: parseInt(config.ota_min_version_code || '1', 10),
      title: config.ota_title || 'GridSense Update Available',
      releaseNotes: config.ota_release_notes || '• Performance optimizations and bug fixes.',
      apkUrl: config.ota_apk_url || '/download/apk',
      fileSizeFormatted: config.ota_file_size || '8.1 MB',
      isMandatory: config.ota_is_mandatory === '1'
    };
  }

  function setOtaSetting(key, value) {
    db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(key, String(value));
  }

  // GET /api/app/update - Client check for available updates
  router.get('/', (req, res) => {
    try {
      const ota = getOtaSettings();
      const clientVersionCode = parseInt(req.query.currentVersionCode || '0', 10);

      if (!ota.isActive) {
        return res.json({
          success: true,
          hasUpdate: false,
          message: 'No active update published.'
        });
      }

      // If client supplied their current version code and they are already on or above it
      if (clientVersionCode > 0 && clientVersionCode >= ota.versionCode) {
        return res.json({
          success: true,
          hasUpdate: false,
          latestVersion: ota.versionName,
          versionCode: ota.versionCode,
          message: 'Your application is up to date.'
        });
      }

      res.json({
        success: true,
        hasUpdate: true,
        latestVersion: ota.versionName,
        versionCode: ota.versionCode,
        title: ota.title,
        releaseNotes: ota.releaseNotes,
        apkUrl: ota.apkUrl,
        fileSizeFormatted: ota.fileSizeFormatted,
        isMandatory: ota.isMandatory
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // GET /api/app/update/admin - Full status for admin dashboard
  router.get('/admin', (req, res) => {
    try {
      const ota = getOtaSettings();
      res.json({ success: true, data: ota });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // POST /api/app/update/publish - Admin publishes or edits an update
  router.post('/publish', (req, res) => {
    try {
      const {
        versionName,
        versionCode,
        title,
        releaseNotes,
        apkUrl,
        fileSizeFormatted,
        isMandatory
      } = req.body;

      if (versionName) setOtaSetting('ota_version_name', versionName.trim());
      if (versionCode) setOtaSetting('ota_version_code', parseInt(versionCode, 10));
      if (title) setOtaSetting('ota_title', title.trim());
      if (releaseNotes) setOtaSetting('ota_release_notes', releaseNotes.trim());
      if (apkUrl) setOtaSetting('ota_apk_url', apkUrl.trim());
      if (fileSizeFormatted) setOtaSetting('ota_file_size', fileSizeFormatted.trim());
      if (isMandatory !== undefined) setOtaSetting('ota_is_mandatory', isMandatory ? '1' : '0');

      setOtaSetting('ota_is_active', '1');

      const updated = getOtaSettings();
      res.json({
        success: true,
        message: `Update v${updated.versionName} successfully published to all mobile clients.`,
        data: updated
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // POST /api/app/update/retract - Admin pulls/cancels the update
  router.post('/retract', (req, res) => {
    try {
      setOtaSetting('ota_is_active', '0');
      const updated = getOtaSettings();
      res.json({
        success: true,
        message: 'Update retracted. Mobile devices will not be prompted to update.',
        data: updated
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  return router;
}
