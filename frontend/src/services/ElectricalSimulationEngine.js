/**
 * Smart Energy Conservation Virtual Laboratory - Electrical Simulation Engine
 * Calculates active power, current, apparent power, reactive power, power factor,
 * energy accumulation, and hierarchical upstream load propagation.
 */

export class ElectricalSimulationEngine {
  constructor() {
    this.nominalVoltage = 230.0; // Standard 1-Phase RMS Grid Voltage in Volts
    this.frequency = 50.0; // Standard Grid Frequency in Hz
    this.tariffRate = 8.0; // ₹ per kWh
    this.carbonFactor = 0.82; // kg CO2 per kWh (CEA Grid Factor)
    this.voltageVariation = 2.5; // Realistic +/- V fluctuation
  }

  /**
   * Calculate single appliance instantaneous electrical readings
   */
  calculateApplianceReading(device, currentVoltage = this.nominalVoltage) {
    if (!device.isOn) {
      return {
        activePower: 0,
        current: 0,
        apparentPower: 0,
        reactivePower: 0,
        powerFactor: device.powerFactor || 0.95,
        voltage: currentVoltage,
        frequency: this.frequency,
        isOverloaded: false
      };
    }

    // Active power with realistic small operating fluctuations (+/- 1.5%)
    const noise = 0.985 + Math.random() * 0.03;
    const activePower = Math.round((device.ratedPower || 100) * noise);
    const powerFactor = Math.max(0.6, Math.min(1.0, device.powerFactor || 0.92));
    
    // I = P / (V * cos phi)
    const current = Number((activePower / (currentVoltage * powerFactor)).toFixed(2));
    
    // S = V * I (VA)
    const apparentPower = Math.round(currentVoltage * current);
    
    // Q = sqrt(S^2 - P^2) (VAR)
    const reactivePower = Math.round(Math.sqrt(Math.max(0, Math.pow(apparentPower, 2) - Math.pow(activePower, 2))));

    const isOverloaded = device.maxPower ? activePower > device.maxPower : false;

    return {
      activePower,
      current,
      apparentPower,
      reactivePower,
      powerFactor,
      voltage: currentVoltage,
      frequency: this.frequency,
      isOverloaded
    };
  }

  /**
   * Propagate load upstream from appliances to sockets, circuits, distribution board, and transformer
   */
  propagateHierarchy(transformer, distributionBoard, circuits, rooms, appliances, currentVoltage = this.nominalVoltage) {
    // 1. Calculate each appliance reading
    const applianceReadings = {};
    appliances.forEach(app => {
      applianceReadings[app.id] = this.calculateApplianceReading(app, currentVoltage);
    });

    // 2. Aggregate Room Loads
    const roomSummaries = rooms.map(room => {
      const roomApps = appliances.filter(a => a.roomId === room.id);
      const activeApps = roomApps.filter(a => a.isOn);
      
      const totalPower = roomApps.reduce((sum, a) => sum + (applianceReadings[a.id]?.activePower || 0), 0);
      const totalCurrent = Number(roomApps.reduce((sum, a) => sum + (applianceReadings[a.id]?.current || 0), 0).toFixed(2));
      const totalApparent = roomApps.reduce((sum, a) => sum + (applianceReadings[a.id]?.apparentPower || 0), 0);
      const totalReactive = roomApps.reduce((sum, a) => sum + (applianceReadings[a.id]?.reactivePower || 0), 0);
      
      return {
        ...room,
        totalPower,
        totalCurrent,
        totalApparent,
        totalReactive,
        deviceCount: roomApps.length,
        activeCount: activeApps.length,
        isEnergized: totalPower > 0
      };
    });

    // 3. Aggregate Branch Circuit Loads & Check Breaker Capacity
    const circuitSummaries = circuits.map(circuit => {
      const circuitApps = appliances.filter(a => a.circuitId === circuit.id);
      const totalPower = circuitApps.reduce((sum, a) => sum + (applianceReadings[a.id]?.activePower || 0), 0);
      const totalCurrent = Number(circuitApps.reduce((sum, a) => sum + (applianceReadings[a.id]?.current || 0), 0).toFixed(2));
      
      const ratedAmps = circuit.ratedAmps || 16;
      const loadPercentage = Math.min(150, Math.round((totalCurrent / ratedAmps) * 100));
      const isOverloaded = totalCurrent > ratedAmps;
      const isTripped = circuit.isTripped || (isOverloaded && totalCurrent > ratedAmps * 1.3);

      return {
        ...circuit,
        totalPower: isTripped ? 0 : totalPower,
        totalCurrent: isTripped ? 0 : totalCurrent,
        loadPercentage: isTripped ? 0 : loadPercentage,
        isOverloaded,
        isTripped,
        activeDeviceCount: isTripped ? 0 : circuitApps.filter(a => a.isOn).length
      };
    });

    // 4. Main Distribution Board (MDB) Aggregation
    const totalActivePower = circuitSummaries.reduce((sum, c) => sum + c.totalPower, 0);
    const totalCurrent = Number(circuitSummaries.reduce((sum, c) => sum + c.totalCurrent, 0).toFixed(2));
    const mainRatedAmps = distributionBoard.mainBreakerAmps || 40;
    const mdbLoadPercentage = Math.min(150, Math.round((totalCurrent / mainRatedAmps) * 100));
    const isMdbOverloaded = totalCurrent > mainRatedAmps;

    const mdbSummary = {
      ...distributionBoard,
      totalActivePower,
      totalCurrent,
      loadPercentage: mdbLoadPercentage,
      isOverloaded: isMdbOverloaded,
      isTripped: distributionBoard.isTripped || false,
      activeCircuitCount: circuitSummaries.filter(c => c.totalPower > 0).length
    };

    // 5. Virtual Step-Down Transformer (11kV -> 230V, rated in kVA)
    const ratedCapacityVa = (transformer.ratedCapacityKva || 10) * 1000;
    const apparentPowerVa = Math.round(currentVoltage * totalCurrent);
    const transformerLoadPercentage = Math.min(150, Math.round((apparentPowerVa / ratedCapacityVa) * 100));
    
    let transformerStatus = 'NORMAL';
    if (transformerLoadPercentage > 100) {
      transformerStatus = 'OVERLOAD';
    } else if (transformerLoadPercentage > 80) {
      transformerStatus = 'HIGH_LOAD';
    }

    const transformerSummary = {
      ...transformer,
      inputVoltage: 11000,
      outputVoltage: currentVoltage,
      currentLoadW: totalActivePower,
      currentLoadVa: apparentPowerVa,
      loadPercentage: transformerLoadPercentage,
      status: transformerStatus,
      efficiency: 98.6
    };

    return {
      applianceReadings,
      roomSummaries,
      circuitSummaries,
      mdbSummary,
      transformerSummary,
      totalActivePower,
      totalCurrent,
      gridVoltage: currentVoltage
    };
  }
}
