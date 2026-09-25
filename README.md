# Smart Energy Converter

<div align="center">

```
  ____      _     _ ____                              _____ __  __ ____  
 / ___|_ __(_) __| / ___|  ___ _ __  ___  ___        | ____|  \/  / ___| 
| |  _| '__| |/ _` \___ \ / _ \ '_ \/ __|/ _ \ _____ |  _| | |\/| \___ \ 
| |_| | |  | | (_| |___) |  __/ | | \__ \  __/_____| | |___| |  | |___) |
 \____|_|  |_|\__,_|____/ \___|_| |_|___/\___|      |_____|_|  |_|____/  
```

### High-Performance IoT Sub-Metering, Diurnal Machine Learning Forecasting & Automated Demand-Side Conservation Platform

[![CI Status](https://img.shields.io/badge/CI-Passing-10b981.svg?style=for-the-badge&logo=github-actions)](https://github.com/DHNSHYDV/smart_energy/actions)
[![Release](https://img.shields.io/badge/Release-v2.0.0-3b82f6.svg?style=for-the-badge&logo=semver)](https://github.com/DHNSHYDV/smart_energy/releases/tag/v2.0.0)
[![License](https://img.shields.io/badge/License-Apache--2.0-8b5cf6.svg?style=for-the-badge)](LICENSE)
[![Android](https://img.shields.io/badge/Android-Kotlin%201.9-3ddc84.svg?style=for-the-badge&logo=android)](android/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%2020%20LTS-68a063.svg?style=for-the-badge&logo=node.js)](backend/)
[![Protocol](https://img.shields.io/badge/Protocol-MQTT%203.1.1-660066.svg?style=for-the-badge&logo=eclipse-mosquitto)](https://mqtt.org/)
[![Standard](https://img.shields.io/badge/Standard-IEC%2062053--21-0284c7.svg?style=for-the-badge)](data/)
[![Academic](https://img.shields.io/badge/NHCE-CSE%2022CSE74-dc2626.svg?style=for-the-badge)](https://newhorizonindia.edu/)
[![Railway](https://img.shields.io/badge/Deploy-Railway.com-0B0D0E.svg?style=for-the-badge&logo=railway)](https://railway.app/)

**Department of Computer Science and Engineering | Academic Year 2026-27**  
**Course:** 22CSE74 – Project Phase-II | **Institution:** New Horizon College of Engineering (NHCE), Bangalore  

[Live Demo](http://localhost:5000) • [Architecture](docs/ARCHITECTURE.md) • [Hardware Specification](docs/HARDWARE_SPEC.md) • [Datasets](data/) • [Android APK](GridSense-Android-v2.0.apk)

</div>

---

## 1. Executive Summary

Traditional residential and commercial energy meters operate as coarse, passive accumulators: they record gross consumption at the utility boundary while remaining blind to individual circuit behavior, diurnal load patterns, power factor distortion, and peak-tariff pricing penalties.

**Smart Energy Converter** is an industrial-grade Energy Management System designed to bridge the gap between low-cost IoT edge sensing and enterprise SCADA analytics. It provides:
1. **Sub-Second Sub-Metering**: Real-time instrumentation across 8 distinct electrical branch circuits, computing True RMS voltage ($V_{\text{RMS}}$), branch current ($I_{\text{RMS}}$), active power ($P$), apparent power ($S$), reactive power ($Q$), and displacement power factor ($\cos\phi$).
2. **Deterministic Physical-to-Virtual Emulation**: An asynchronous physics engine executing at $1.0\text{ Hz}$ that mirrors the exact electrical behavior of non-invasive split-core Current Transformers (SCT-013), 16-bit analog-to-digital converters (ADS1115), and a 240MHz ESP32 edge gateway.
3. **Automated Demand-Side Management (DSM)**: Dynamic load-curtailment rules, Time-of-Day (TOD) peak shifting, and 4 macro-scene automation profiles with sub-50ms optimistic relay feedback.
4. **Holt-Winters Diurnal Predictive Forecasting**: Rolling exponential regression modeling 24-hour diurnal demand trajectories to proactively warn of sanctioned contract demand exceedances.
5. **Dual-Screen Unified Ecosystem**: An enterprise desktop analytics command center paired with a native Android Kotlin application ([`GridSense-Android-v2.0.apk`](GridSense-Android-v2.0.apk)) communicating over MQTT and bidirectional WebSockets.

---

## 2. End-to-End System Architecture

```
                    +-------------------------------------------------------+
                    |           Mains Single-Phase 230V AC Supply           |
                    +---------------------------+---------------------------+
                                                |
               +--------------------------------+-------------------------------+
               |                                                                |
               v                                                                v
+-------------------------------+                              +-------------------------------+
|  ZMPT101B Voltage Transformer |                              | 8x SCT-013 Split-Core CTs     |
|  - 0-250V AC Isolation        |                              | - 100A:50mA Secondary Ratio   |
|  - Precision Potential Divider|                              | - Burden Resistor RB = 33 Ω   |
+---------------+---------------+                              +---------------+---------------+
                |                                                              |
                +-------------------------------+------------------------------+
                                                |
                                                v
                        +-----------------------------------------------+
                        | Dual ADS1115 16-Bit ΔΣ ADC Multiplexers       |
                        | - High-Speed I2C Bus (Addresses: 0x48, 0x49)  |
                        | - 860 Samples/Sec Differential Dynamic Range  |
                        +-----------------------+-----------------------+
                                                | I2C (SDA: GPIO 21, SCL: GPIO 22)
                                                v
                        +-----------------------------------------------+
                        | ESP32-WROOM-32 Edge IoT Gateway (240MHz LX6)  |
                        | - FreeRTOS Waveform Sampling Task (1.0 kHz)   |
                        | - Discrete True RMS Math & Power Calculations |
                        | - Non-Volatile Energy Integration (kWh)       |
                        | - 8-Channel Relay Driver (SRD-05VDC-SL-C)    |
                        +-----------------------+-----------------------+
                                                | MQTT Telemetry (TCP 1883)
                                                v
                        +-----------------------------------------------+
                        | Embedded Aedes MQTT Broker & Node.js Engine   |
                        | - Internal QoS 1 Telemetry Ingestion Pipeline |
                        | - SQLite3 Time-Series Store (WAL Mode)        |
                        | - Anomaly Deduplication & Resolution Service  |
                        | - CEA Carbon Accounting & TOD Tariff Evaluator|
                        +-----------------------+-----------------------+
                                                |
                        +-----------------------+-----------------------+
                        | Socket.IO (<50ms)                             | REST API (JSON)
                        v                                               v
+-----------------------------------------------+       +-----------------------------------------------+
| Enterprise Web Operations Suite               |       | Native Android Kotlin Application             |
| - Vite + React 18 + Tailwind CSS              |       | - Modern Clean UI (Zero AI Slop)              |
| - Recharts Diurnal Predictive Curves          |       | - MPAndroidChart 24h Diurnal Load Graph       |
| - Slide-Over Circuit Diagnostic Drawers       |       | - 4 Differentiated Functional Tabs            |
| - Interactive Evaluator Viva Sandbox          |       | - Sub-50ms Haptic Sub-Meter Relay Toggles     |
+-----------------------------------------------+       +-----------------------------------------------+
```

---

## 3. Hardware Bill of Materials (BOM)

| Item | Component Designator | Industrial Part Number | Quantity | Key Electrical Specifications | Interface / Bus |
|:---:|---|---|:---:|---|---|
| **1** | Edge Microcontroller | ESP32-WROOM-32D | 1 | 240MHz 32-bit Xtensa Dual-Core, 520KB SRAM, 4MB Flash | Wi-Fi 802.11 b/g/n, BLE 4.2 |
| **2** | ADC Multiplexer | ADS1115IDGSR | 2 | 16-Bit $\Delta\Sigma$ ADC, Programmable Gain ($PGA = 2/3\times$), 860 SPS | I2C ($0\times48, 0\times49$) |
| **3** | Current Transducers | SCT-013-000 | 8 | Split-core, $100\text{ A} : 50\text{ mA}$, Non-linearity $\pm 1\%$ | Analog AC Current Loop |
| **4** | Voltage Sensor | ZMPT101B Active Module | 1 | $2\text{ mA} : 2\text{ mA}$ micro-PT, $4000\text{ V}$ Galvanic Isolation | Analog AC Voltage Output |
| **5** | Actuation Module | SRD-05VDC-SL-C Board | 1 | 8-Channel Optoisolated, $10\text{ A} @ 250\text{ V AC}$, Flyback Diodes | GPIO 13, 14, 27, 26, 25, 33, 32, 19 |
| **6** | Burden Resistors | Metal Film $33\,\Omega$ | 8 | $33\,\Omega \pm 1\%$, $0.5\text{ W}$, $50\text{ ppm}/^\circ\text{C}$ temperature coefficient | Onboard ADC bias network |
| **7** | DC Bias Voltage Divider | Metal Film $10\,\text{k}\Omega$ | 16 | Matched pairs $\pm 0.1\%$ tolerance, $1.65\text{ V}$ mid-rail reference | Analog Front-End (AFE) |
| **8** | Bypass Filtering | Low-ESR Tantalum | 8 | $10\,\mu\text{F}$, $16\text{ V}$, Low-impedance ripple rejection | Analog Ground Return |
| **9** | Power Supply | Hi-Link HLK-PM01 | 1 | Universal $85\text{--}264\text{ V AC}$ input to $5\text{ V DC} @ 600\text{ mA}$ isolated | Terminal Blocks |

---

## 4. Mathematical Foundations & Physics Engine

### 4.1 Instantaneous True RMS Integration
Because modern residential branch loads exhibit non-linear current waveforms (switching power supplies, LED drivers, and inverter compressors), conventional peak-detection creates severe metering errors. The system computes discrete True RMS over integer multiples of the $50\text{ Hz}$ grid period ($T = 20\text{ ms}$):

$$V_{\text{RMS}} = \sqrt{\frac{1}{N} \sum_{n=1}^{N} \left( v[n] - V_{\text{bias}} \right)^2}, \qquad I_{\text{RMS}} = \sqrt{\frac{1}{N} \sum_{n=1}^{N} \left( i[n] - I_{\text{bias}} \right)^2}$$

### 4.2 Power Triangle & Power Factor
Real Power ($P$), Apparent Power ($S$), and Reactive Power ($Q$) are derived instantaneously:

$$P_{\text{active}} = \frac{1}{N} \sum_{n=1}^{N} \left( v[n] - V_{\text{bias}} \right) \times \left( i[n] - I_{\text{bias}} \right) \quad [\text{Watts}]$$

$$S_{\text{apparent}} = V_{\text{RMS}} \times I_{\text{RMS}} \quad [\text{VA}]$$

$$Q_{\text{reactive}} = \sqrt{S_{\text{apparent}}^2 - P_{\text{active}}^2} \quad [\text{VAR}]$$

$$\text{Displacement Power Factor } (\cos\phi) = \frac{P_{\text{active}}}{S_{\text{apparent}}}$$

### 4.3 Time-of-Day (TOD) Piecewise Tariff Accounting
To capture grid stress pricing, billing is integrated piecewise using statutory electricity regulatory commission (BESCOM LT-2) schedules:

$$\text{Cost}(t) = \int_{0}^{t} P(\tau) \cdot \lambda(\tau) \, d\tau$$

$$\text{where } \lambda(t) = \begin{cases} \lambda_{\text{base}} \times 1.25 = ₹10.00/\text{kWh}, & t \in [18:00, 22:00] \quad (\text{Evening Peak}) \\ \lambda_{\text{base}} = ₹8.00/\text{kWh}, & \text{otherwise} \end{cases}$$

### 4.4 Central Electricity Authority (CEA) Carbon Emission Intensity
Grid carbon emissions are tracked in real-time according to the statutory CEA Baseline Carbon Dioxide Emission Database (v19):

$$\text{CO}_2 \text{ Footprint } [\text{kg CO}_2] = E_{\text{cumulative}} [\text{kWh}] \times 0.82 \, \frac{\text{kg CO}_2}{\text{kWh}}$$

---

## 5. Experimental Datasets (`data/`)

This repository includes a full suite of open research datasets adhering to the IEC 62053-21 metering standard:

| Resource | Records | Format | Direct Link |
|---|---|---|---|
| **24-Hour Diurnal Load Profile** | 1,440 entries (1-min resolution) | CSV | [`data/telemetry_sample_24h.csv`](data/telemetry_sample_24h.csv) |
| **Aggregated KPI & Sampled Profile** | 288 points + Meta Summary | JSON | [`data/telemetry_sample_24h.json`](data/telemetry_sample_24h.json) |
| **8-Circuit Transducer Metadata** | 8 monitored sub-circuits | JSON | [`data/appliances_metadata.json`](data/appliances_metadata.json) |
| **Time-of-Day Tariff Structures** | BESCOM & MSEDCL Schedules | JSON | [`data/tod_tariff_structure.json`](data/tod_tariff_structure.json) |
| **Electrical Anomaly Benchmark Catalog**| 4 verified fault events | JSON | [`data/synthetic_anomalies.json`](data/synthetic_anomalies.json) |

```python
# Quick Load in Python / Pandas
import pandas as pd
df = pd.read_csv('data/telemetry_sample_24h.csv', parse_dates=['timestamp'])
print(f"Total 24h Energy: {df['cumulative_energy_kwh'].iloc[-1]} kWh | Peak: {df['mains_total_power_w'].max()} W")
```

---

## 6. Monitored Sub-Circuit Channels

| Channel | Identifier | Appliance / Load Name | Type | Location | Rated Power | Nominal PF | Priority Tier |
|:---:|:---:|---|---|---|:---:|:---:|:---:|
| **CT-CH01** | `AC001` | Air Conditioner | 1.5 Ton Dual Inverter | Master Bedroom | $1500\text{ W}$ | $0.92$ | Tier 3 (Interruptible) |
| **CT-CH02** | `FR001` | Refrigerator | Frost-Free Cold Storage | Kitchen | $180\text{ W}$ | $0.85$ | Tier 1 (Critical 24/7) |
| **CT-CH03** | `TV001` | Smart Television | 55-inch 4K OLED | Living Room | $120\text{ W}$ | $0.95$ | Tier 4 (Discretionary) |
| **CT-CH04** | `PC001` | Workstation PC | High-Performance Computing | Home Office | $200\text{ W}$ | $0.98$ | Tier 2 (Essential Work) |
| **CT-CH05** | `LT001` | Living Room Lighting | Solid-State LED Array | Living Room | $18\text{ W}$ | $0.90$ | Tier 4 (Discretionary) |
| **CT-CH06** | `FN001` | Ceiling Fan | 3-Speed BLDC Motor Drive | Living Room | $65\text{ W}$ | $0.88$ | Tier 3 (Comfort) |
| **CT-CH07** | `WM001` | Washing Machine | Front-Load Drum + Heater | Utility Area | $450\text{ W}$ | $0.82$ | Tier 3 (Shiftable) |
| **CT-CH08** | `GH001` | Water Heater / Geyser | 25L Immersion Element | Bathroom | $2200\text{ W}$ | $1.00$ | Tier 3 (Shiftable) |

---

## 7. Interactive System Lab & Viva Demonstration Presets

To facilitate external academic examination, the platform features a dedicated **System Simulation Lab** with one-click test presets:

1. **Standard Baseline Mode**: Demonstrates nominal residential diurnal consumption with cyclic refrigeration and office computing.
2. **High Demand Stress Test**: Concurrently energizes the Water Heater ($2200\text{ W}$), Air Conditioner ($1500\text{ W}$), and Washing Machine heating cycle ($450\text{ W}$) to breach the $5.0\text{ kW}$ contract demand and trigger automated Demand-Side shedding.
3. **Peak Tariff Surge Mode**: Forces simulation clock into the $18:00\text{--}22:00$ window to demonstrate the $+25\%$ tariff surcharge multiplier and display quantified load-shifting financial savings (₹540/month).
4. **Vampire / Low PF Inductive Anomaly**: Injects inductive phase-angle lag ($\cos\phi < 0.70$) and compressor stalling ($2450\text{ W}$) to trigger deduplicated critical alerts.
5. **Time Acceleration Clock**: Accelerate the simulation from $1\times$ up to $50\times$ to demonstrate 24 hours of energy accumulation and billing integration in seconds.

---

## 8. API & Industrial MQTT Specification

### 8.1 REST API Endpoints

| Method | Endpoint | Description | Sample Response Key |
|:---:|---|---|---|
| `GET` | `/api/simulation/snapshot` | Returns live ESP32 status, line electrical metrics, and all 8 circuits | `data.activeCircuits`, `data.telemetry` |
| `POST` | `/api/simulation/relay` | Actuates physical/virtual relay switch for target appliance | `{"applianceId":"AC001","isOn":false}` |
| `POST` | `/api/simulation/scenario` | Triggers one of 5 evaluator lab test presets | `{"preset":"HIGH_DEMAND"}` |
| `GET` | `/api/schedules/scenes` | Retrieves macro scene profiles (Night Mode, Eco Shift, Work Mode) | `scenes[]` |
| `POST` | `/api/schedules/scenes/:id/activate` | Executes coordinated multi-relay macro profile | `{"success":true,"actuated":3}` |
| `GET` | `/api/analytics/forecast` | Returns 24-hour diurnal Holt-Winters predictive load trajectory | `forecastPoints[]` |
| `GET` | `/api/analytics/cost` | Incomer TOD cost analytics, peak share, and potential shift savings | `todCost`, `peakCost`, `savings` |
| `GET` | `/api/analytics/export/csv` | Generates on-the-fly downloadable CSV compliance energy audit log | `Content-Type: text/csv` |

### 8.2 MQTT Industrial Topic Tree

```
smartenergy/
  |-- telemetry/
  |     +-- ESP32-SIM-001          # 1.0Hz JSON payload: V_rms, I_rms, P_active, S, Q, PF, kWh
  |-- control/
  |     +-- ESP32-SIM-001/
  |           +-- relay            # JSON command: {"applianceId": "GH001", "state": "OFF"}
  +-- status/
        +-- ESP32-SIM-001          # LWT (Last Will and Testament): "ONLINE" | "OFFLINE"
```

---


---

## 9. 🚀 Deploy on Railway.com (1-Click Cloud Deployment)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

The **Smart Energy Converter** is fully containerized and production-ready for instant deployment on **[Railway.com](https://railway.com)** via its native Docker engine and `railway.json` configuration.

### Steps to Deploy:
1. **Fork or Push** this repository to your GitHub account (`https://github.com/DHNSHYDV/smart_energy`).
2. Log in to [Railway.com](https://railway.com) and click **"New Project"**.
3. Select **"Deploy from GitHub repo"** and choose your `smart_energy` repository.
4. Railway will automatically detect the root [`Dockerfile`](Dockerfile) and [`railway.json`](railway.json).
5. *(Optional Persistent Storage)*:
   - Click **Add Service / Volume** and mount a persistent volume at path `/data`.
   - In the **Variables** tab, set:
     ```env
     DATABASE_PATH=/data/tracker.db
     ```
6. Railway will automatically:
   - Build the frontend assets using Vite (`frontend/dist`).
   - Install backend production dependencies with native SQLite bindings.
   - Bind dynamically to `$PORT` on `0.0.0.0`.
   - Run health checks against `/api/simulation/snapshot`.
7. Once deployed, Railway provides an instant public HTTPS URL (e.g. `https://smart-energy-converter.up.railway.app`). Both the web client and WebSocket streams operate seamlessly over HTTPS/WSS!

---
## 10. Quickstart & Local Installation Guide

### Prerequisites
- **Node.js**: `v20.x` or higher (LTS recommended)
- **Java Development Kit (JDK)**: JDK 17 (for compiling the Android Kotlin app)
- **Android SDK**: API level 26 minimum, API level 34 target

### Step 1: Clone Repository
```bash
git clone https://github.com/DHNSHYDV/smart_energy.git
cd smart_energy
```

### Step 2: Launch Platform
Run the self-contained launch script from the project root:
```bash
chmod +x start.sh
./start.sh
```
*The script will install all dependencies, build the Vite frontend, initialize the SQLite WAL database, launch the embedded Aedes MQTT broker on port `1883`, and start the simulation server on port `5000` (`http://localhost:5000`).*

### Step 3: Install Android Kotlin Mobile App
Install the pre-compiled production APK onto your Android device or emulator via ADB:
```bash
adb install -r GridSense-Android-v2.0.apk
```
*Alternatively, transfer [`GridSense-Android-v2.0.apk`](GridSense-Android-v2.0.apk) directly to your Android device.*

---

## 11. Repository File Structure

```
.
├── android/                        # Native Android Kotlin Application
│   ├── app/src/main/
│   │   ├── java/com/gridsense/ems/ # Clean MVVM Architecture (Repository, Models, Adapters)
│   │   └── res/                    # Dual-Curved Card XML Layouts & Coherent Vectors
│   └── build.gradle                # Gradle Build Configuration (Kotlin 1.9, Coroutines)
├── backend/                        # Node.js Edge Simulation & IoT Orchestrator
│   ├── src/
│   │   ├── config/                 # Constants, Database Initialization, Appliance Specs
│   │   ├── mqtt/                   # Embedded Aedes MQTT Broker & Internal Client
│   │   ├── routes/                 # Express REST Endpoints (Simulation, Analytics, DSM)
│   │   ├── services/               # Anomaly Deduplication, Forecasting, Scheduler
│   │   └── simulation/             # VirtualESP32, VirtualEnergySensor, VirtualAppliance
│   └── package.json
├── data/                           # Open Research & Telemetry Datasets
│   ├── appliances_metadata.json    # 8-Circuit Transducer Specification
│   ├── synthetic_anomalies.json    # Fault Classification Benchmark Dataset
│   ├── telemetry_sample_24h.csv    # 1,440-minute 24-hr Diurnal Telemetry Dataset
│   ├── telemetry_sample_24h.json   # Sampled JSON Telemetry Profile with KPI Summary
│   └── tod_tariff_structure.json   # BESCOM & MSEDCL Time-of-Day Tariff Schedules
├── docs/                           # Technical Specifications & Documentation
│   ├── ARCHITECTURE.md             # End-to-End Architectural Pipeline & Flow
│   └── HARDWARE_SPEC.md            # Transducer Schematics, Burden Calculations & BOM
├── frontend/                       # Vite + React 18 Enterprise Web Dashboard
│   ├── src/components/             # High-Density Dashboard Views, Drawers & Modals
│   └── tailwind.config.js          # Industrial Slate Color Palette & Layout Tokens
├── .github/                        # CI/CD Workflows, PR Templates & Issue Trackers
│   ├── workflows/                  # GitHub Actions (Node.js CI + Android APK Builder)
│   └── ISSUE_TEMPLATE/             # Standardized Bug Reports & Feature Requests
├── GridSense-Android-v2.0.apk      # Compiled Standalone Production Android Release
├── CITATION.cff                    # Machine-Readable Academic Citation Specification
├── CONTRIBUTING.md                 # Contribution Guidelines & GitFlow Conventions
├── LICENSE                         # Apache License 2.0
├── SECURITY.md                     # Security Vulnerability Reporting Policy
├── package.json                    # Workspace Scripts & Orchestration
└── start.sh                        # Automated Single-Command Environment Launch Script
```

---

## 12. Academic Authorship & Citation

This project was engineered as part of the Major Project Phase-II curriculum (**22CSE74**) under the Department of Computer Science and Engineering, **New Horizon College of Engineering (NHCE)**, Bangalore.

### Project Investigators:
- **Yash Sunil Bongale**
- **Venkata Sai Ankith G**
- **Aman Thakur**
- **Hemasrija C**

### BibTeX Citation:
```bibtex
@software{gridsense_enterprise_ems_2026,
  author       = {Bongale, Yash Sunil and Ankith G, Venkata Sai and Thakur, Aman and C, Hemasrija},
  title        = {GridSense Enterprise EMS: IoT-Driven Energy Sensing, Diurnal ML Forecasting & Demand-Side Conservation Platform},
  month        = mar,
  year         = 2026,
  publisher    = {GitHub},
  version      = {v2.0.0},
  url          = {https://github.com/DHNSHYDV/smart_energy}
}
```

---

<div align="center">
  <b>Built with precision for sustainable grid operations and intelligent demand-side energy conservation.</b><br>
  Released under the <a href="LICENSE">Apache 2.0 License</a>.
</div>
