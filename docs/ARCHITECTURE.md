# GridSense Enterprise EMS — Architecture & Data Pipeline

## 1. System Topology Overview

GridSense Enterprise EMS uses an event-driven, decoupled micro-architecture designed for sub-second telemetry aggregation, real-time load disaggregation, and automated Demand-Side Management (DSM).

```
                      +-----------------------------+
                      | Physical / Virtual Incomer  |
                      |   230V AC Single-Phase      |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |  SCT-013 Transducers &      |
                      |  ADS1115 16-Bit Converters  |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      | ESP32 Edge Gateway (Node 1) |
                      | - FreeRTOS Real-Time Kernel |
                      | - True RMS Math Engine      |
                      +--------------+--------------+
                                     |  MQTT (TCP 1883)
                                     v
                      +-----------------------------+
                      | Embedded Aedes Broker       |
                      +--------------+--------------+
                                     |  Internal Node.js Client
                                     v
+------------------------------------+------------------------------------+
|                      Node.js EMS Orchestration Engine                   |
|                                                                         |
|  +------------------+   +--------------------+   +-------------------+  |
|  | SimulationEngine |   | AnomalyService     |   | SchedulerService  |  |
|  | (1Hz Telemetry)  |   | (Deduplication)    |   | (DSM & Scenes)    |  |
|  +--------+---------+   +---------+----------+   +---------+---------+  |
|           |                       |                        |            |
|           +-----------------------+------------------------+            |
|                                   |                                     |
|                                   v                                     |
|               +---------------------------------------+                 |
|               |  SQLite WAL Mode High-Throughput DB   |                 |
|               +-------------------+-------------------+                 |
|                                   |                                     |
+-----------------------------------+-------------------------------------+
                                    |
            +-----------------------+-----------------------+
            | Socket.IO (sub-50ms)                          | HTTP REST API
            v                                               v
+-----------------------------+               +-----------------------------+
| Desktop Enterprise EMS      |               | Native Android Kotlin App   |
| (Vite + React 18 + Tailwind)|               | (Jetpack, MPAndroidChart)   |
+-----------------------------+               +-----------------------------+
```

---

## 2. Telemetry Pipeline & Frequency

1. **Edge Sampling Layer ($1000\text{ Hz}$)**:
   - High-frequency sampling of instantaneous voltage and current waveforms.
   - Elimination of DC offset ($1.65\text{V}$) via software high-pass filter.

2. **Edge-to-Broker Transport ($1\text{ Hz}$)**:
   - Aggregated metrics are published every $1.0\text{ second}$ to MQTT topic:
     ```
     smartenergy/telemetry/ESP32-SIM-001
     ```
   - Payload schema conforms to IEC metering format including active power ($W$), voltage ($V$), current ($A$), and accumulated energy ($kWh$).

3. **Storage Engine (SQLite WAL)**:
   - Synchronous WAL (Write-Ahead Logging) mode allows non-blocking reads during 1-second continuous telemetry ingestion.
   - Rolling partition cleanup maintains database health under multi-day continuous runs.

4. **Client Push Synchronization ($<50\text{ ms}$)**:
   - Socket.IO distributes delta snapshots across connected desktop dashboards and mobile clients simultaneously.
   - Actuating a relay from either the Android app or web UI propagates through the MQTT command channel `smartenergy/control/ESP32-SIM-001/relay` and reflects on all peer clients instantly.
