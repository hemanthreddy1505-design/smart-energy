/**
 * Virtual Appliance Class
 * Simulates electrical behaviour, thermal state machines, and dynamic wattage curves.
 */
export class VirtualAppliance {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.location = config.location;
    this.ratedPower = config.ratedPower;
    this.minPower = config.minPower;
    this.maxPower = config.maxPower;
    this.powerFactor = config.powerFactor;
    this.isOn = Boolean(config.isOn);
    this.isAnomaly = Boolean(config.isAnomaly);
    this.category = config.category || 'general';
    this.icon = config.icon || 'Zap';

    // Internal state variables for realistic simulation
    this.runtimeSeconds = config.total_runtime_seconds || 0;
    this.continuousOnSeconds = 0;
    this.internalCycleTick = Math.floor(Math.random() * 100);
    this.washCyclePhase = 0; // for washing machine: 0=wash, 1=heat, 2=spin
    this.geyserThermostatCutoff = false;
  }

  toggle(targetState = null) {
    if (targetState !== null) {
      this.isOn = Boolean(targetState);
    } else {
      this.isOn = !this.isOn;
    }
    if (!this.isOn) {
      this.continuousOnSeconds = 0;
      this.isAnomaly = false;
      this.geyserThermostatCutoff = false;
    }
    return this.isOn;
  }

  setAnomaly(state = true) {
    this.isAnomaly = Boolean(state);
    if (this.isAnomaly && !this.isOn) {
      this.isOn = true; // An anomaly turns it on with high draw
    }
  }

  /**
   * Generates realistic active power draw in Watts for the current tick
   * @param {number} timeSeconds - Current elapsed simulation time
   * @param {number} speedMultiplier - Current simulation acceleration
   */
  calculatePower(timeSeconds, speedMultiplier = 1) {
    if (!this.isOn) {
      // Off state: True zero or nominal vampire standby for plugged-in electronics
      return 0.0;
    }

    this.runtimeSeconds += speedMultiplier;
    this.continuousOnSeconds += speedMultiplier;
    this.internalCycleTick += 1;

    // Injected Anomaly Behavior: high surge or stall
    if (this.isAnomaly) {
      switch (this.id) {
        case 'AC001':
          return 2450 + Math.sin(this.internalCycleTick * 0.5) * 80; // Compressor stall
        case 'GH001':
          return 2700 + Math.sin(this.internalCycleTick * 0.5) * 50; // Element overheating
        case 'PC001':
          return 380 + Math.sin(this.internalCycleTick * 0.8) * 30; // Overclock loop
        default:
          return this.ratedPower * 1.6 + Math.random() * 20;
      }
    }

    // Normal realistic thermodynamic and electrical simulation
    switch (this.id) {
      case 'AC001': {
        // Air conditioner: Inverter compressor behavior
        // First 3 minutes high pull, then oscillates between 900W-1250W based on thermostat
        const cycleProgress = (this.internalCycleTick % 60) / 60; // 60-step thermostat loop
        const modulation = Math.sin(cycleProgress * Math.PI * 2);
        const noise = (Math.random() - 0.5) * 15;
        if (this.continuousOnSeconds < 180) {
          // Cool down ramp
          return 1650 + modulation * 100 + noise;
        } else {
          // Temperature maintained
          return 1050 + modulation * 150 + noise;
        }
      }

      case 'FR001': {
        // Refrigerator: 40% compressor ON (160W), 60% idle (12W fan/standby)
        const fridgeCycle = this.internalCycleTick % 50;
        if (fridgeCycle < 20) {
          // Compressor actively cooling
          return 165 + (Math.random() - 0.5) * 10;
        } else {
          // Standby/defrost fan
          return 12 + (Math.random() - 0.5) * 2;
        }
      }

      case 'TV001': {
        // Smart TV: Dynamic power depending on simulated scene brightness
        const sceneNoise = Math.sin(this.internalCycleTick * 0.3) * 20;
        return 110 + sceneNoise + (Math.random() - 0.5) * 5;
      }

      case 'PC001': {
        // Workstation PC: Base load 140W with bursty CPU/GPU loads up to 260W
        const burstChance = Math.random();
        if (burstChance > 0.85) {
          return 240 + Math.random() * 40; // Compilation / GPU rendering spike
        }
        return 145 + Math.sin(this.internalCycleTick * 0.2) * 20;
      }

      case 'LT001': {
        // LED Lighting: Clean steady load with minimal ripple
        return 18.0 + (Math.random() - 0.5) * 0.4;
      }

      case 'FN001': {
        // Ceiling Fan: BLDC motor at medium-high speed
        return 62.0 + Math.sin(this.internalCycleTick * 0.1) * 3;
      }

      case 'WM001': {
        // Washing machine: Transitions through Wash (350W) -> Spin (520W) -> Heater (1600W)
        const wmTick = this.internalCycleTick % 90;
        if (wmTick < 40) {
          // Tumble wash
          return 340 + Math.sin(wmTick * 0.8) * 60;
        } else if (wmTick < 65) {
          // Spin dry
          return 520 + Math.random() * 30;
        } else {
          // Gentle rinse
          return 180 + Math.random() * 15;
        }
      }

      case 'GH001': {
        // Water Heater / Geyser: 2200W resistive. Thermostat trips after prolonged run
        if (this.continuousOnSeconds > 2400) {
          // Water has reached 65°C, thermostat shuts off element
          this.geyserThermostatCutoff = true;
          return 0.0;
        }
        return 2200 + (Math.random() - 0.5) * 20;
      }

      default:
        return this.ratedPower + (Math.random() - 0.5) * (this.maxPower - this.minPower) * 0.1;
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      location: this.location,
      ratedPower: this.ratedPower,
      minPower: this.minPower,
      maxPower: this.maxPower,
      powerFactor: this.powerFactor,
      isOn: this.isOn,
      isAnomaly: this.isAnomaly,
      category: this.category,
      icon: this.icon,
      runtimeSeconds: this.runtimeSeconds,
      continuousOnSeconds: this.continuousOnSeconds,
    };
  }
}
