export const SYSTEM_CONFIG = {
  PORT: process.env.PORT || 5000,
  MQTT_PORT: process.env.MQTT_PORT || 1883,
  DEVICE_ID: 'ESP32-SIM-001',
  DEFAULT_TARIFF: 8.0, // ₹ per kWh (Indian domestic standard tier)
  PEAK_TARIFF_MULTIPLIER: 1.25, // 25% surcharge during peak hours (6 PM - 10 PM)
  DEFAULT_CARBON_FACTOR: 0.82, // kg CO2 per kWh (India CEA Grid Emission Factor)
  BASE_VOLTAGE: 230.0, // Indian grid standard nominal voltage
  VOLTAGE_VARIATION: 3.5, // Realistic RMS grid voltage variation (+/- Volts)
  SAMPLE_INTERVAL_MS: 1000, // 1 second standard sampling
  MAX_LIVE_POINTS: 30, // Rolling window for real-time chart
};

export const INITIAL_APPLIANCES = [
  {
    id: 'AC001',
    name: 'Air Conditioner',
    type: 'HVAC',
    location: 'Master Bedroom',
    ratedPower: 1500, // Watts (1.5 Ton Inverter)
    minPower: 850,
    maxPower: 1850,
    powerFactor: 0.92,
    isOn: true,
    category: 'cooling',
    normalRange: { min: 800, max: 1900 },
    icon: 'Snowflake',
  },
  {
    id: 'FR001',
    name: 'Refrigerator',
    type: 'Cold Storage',
    location: 'Kitchen',
    ratedPower: 180, // Double Door Frost-Free
    minPower: 10, // Standby / interior lights / defrost
    maxPower: 220, // Compressor active
    powerFactor: 0.85,
    isOn: true,
    category: 'cooling',
    normalRange: { min: 5, max: 240 },
    icon: 'Refrigerator',
  },
  {
    id: 'TV001',
    name: 'Smart Television',
    type: 'Entertainment',
    location: 'Living Room',
    ratedPower: 120, // 55-inch 4K UHD
    minPower: 1.5, // Standby
    maxPower: 145,
    powerFactor: 0.95,
    isOn: true,
    category: 'entertainment',
    normalRange: { min: 1, max: 160 },
    icon: 'Tv',
  },
  {
    id: 'PC001',
    name: 'Workstation PC',
    type: 'Computing',
    location: 'Home Office',
    ratedPower: 200,
    minPower: 3, // Sleep/standby
    maxPower: 320, // High CPU/GPU load
    powerFactor: 0.98,
    isOn: true,
    category: 'computing',
    normalRange: { min: 2, max: 350 },
    icon: 'Monitor',
  },
  {
    id: 'LT001',
    name: 'Living Room Lighting',
    type: 'Lighting',
    location: 'Living Room',
    ratedPower: 18, // LED array
    minPower: 12,
    maxPower: 20,
    powerFactor: 0.90,
    isOn: true,
    category: 'lighting',
    normalRange: { min: 0, max: 25 },
    icon: 'Lightbulb',
  },
  {
    id: 'FN001',
    name: 'Ceiling Fan',
    type: 'Ventilation',
    location: 'Living Room',
    ratedPower: 65, // BLDC Motor 3-speed
    minPower: 35,
    maxPower: 75,
    powerFactor: 0.88,
    isOn: true,
    category: 'ventilation',
    normalRange: { min: 30, max: 85 },
    icon: 'Fan',
  },
  {
    id: 'WM001',
    name: 'Washing Machine',
    type: 'Heavy Appliance',
    location: 'Utility Area',
    ratedPower: 450, // Front load motor + periodic heater
    minPower: 2, // Standby
    maxPower: 1800, // Water heater cycle
    powerFactor: 0.82,
    isOn: false,
    category: 'heavy',
    normalRange: { min: 0, max: 2000 },
    icon: 'WashingMachine',
  },
  {
    id: 'GH001',
    name: 'Water Heater / Geyser',
    type: 'Heavy Appliance',
    location: 'Bathroom',
    ratedPower: 2200, // 25L Storage Geyser
    minPower: 0,
    maxPower: 2300,
    powerFactor: 1.00, // Pure resistive load
    isOn: false,
    category: 'heavy',
    normalRange: { min: 0, max: 2500 },
    icon: 'Flame',
  }
];
