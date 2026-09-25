import { Router } from 'express';
import QRCode from 'qrcode';
import os from 'os';
import { SYSTEM_CONFIG } from '../config/constants.js';

export function createSystemRouter(simulationEngine, mqttService) {
  const router = Router();

  // GET /api/system/gateway - Edge controller status
  router.get('/gateway', (req, res) => {
    const status = simulationEngine.esp32.getStatus();
    res.json({
      success: true,
      data: {
        ...status,
        mqttConnected: mqttService ? mqttService.isConnected : false,
        activeAppliances: Array.from(simulationEngine.appliances.values()).filter(a => a.isOn).length,
        totalAppliances: simulationEngine.appliances.size
      }
    });
  });

  // GET /api/system/network - Local Wi-Fi IP and generated QR code for mobile pairing
  router.get('/network', async (req, res) => {
    let localIp = '127.0.0.1';
    let isWifiConnected = false;
    const interfaces = os.networkInterfaces();

    // Gather non-internal IPv4 candidates
    const candidates = [];
    for (const [name, ifaceList] of Object.entries(interfaces)) {
      const lowerName = name.toLowerCase();
      // Skip docker/virtual interfaces
      if (lowerName.includes('docker') || lowerName.includes('veth') || lowerName.includes('br-') || lowerName.includes('virbr')) {
        continue;
      }
      for (const iface of ifaceList) {
        if (iface.family === 'IPv4' && !iface.internal && iface.address !== '127.0.0.1') {
          const isWifi = lowerName.startsWith('wl') || lowerName.includes('wifi') || lowerName.includes('wlan');
          const isEth = lowerName.startsWith('en') || lowerName.startsWith('eth');
          const isStandardPrivate = iface.address.startsWith('192.168.') || iface.address.startsWith('10.') || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(iface.address);
          
          let score = 0;
          if (isWifi) score += 20;
          if (isEth) score += 10;
          if (isStandardPrivate) score += 5;

          candidates.push({ name, address: iface.address, score });
        }
      }
    }

    candidates.sort((a, b) => b.score - a.score);

    if (candidates.length > 0) {
      localIp = candidates[0].address;
      isWifiConnected = true;
    } else {
      const hostHeader = req.headers.host;
      if (hostHeader) {
        const hostIp = hostHeader.split(':')[0];
        if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
          localIp = hostIp;
          isWifiConnected = true;
        }
      }
    }

    const port = SYSTEM_CONFIG.PORT;
    const mobileUrl = `http://${localIp}:${port}`;

    try {
      const qrDataUrl = await QRCode.toDataURL(mobileUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });

      res.json({
        success: true,
        data: {
          localIp,
          port,
          mobileUrl,
          qrCode: qrDataUrl,
          isLoopback: localIp === '127.0.0.1' || localIp === 'localhost',
          instructions: [
            'Ensure your mobile phone is connected to the SAME Wi-Fi network as this laptop.',
            `Open your phone camera or browser and navigate to: ${mobileUrl}`,
            'Or simply scan the QR code above with your phone camera.'
          ]
        }
      });
    } catch (e) {
      res.status(500).json({ success: false, message: 'QR Code generation failed: ' + e.message });
    }
  });

  return router;
}
