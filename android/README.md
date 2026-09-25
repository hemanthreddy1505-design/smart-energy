# GridSense Mobile EMS — Native Android Kotlin Application

<div align="center">

[![Platform](https://img.shields.io/badge/Platform-Android%2014-3ddc84.svg?style=flat-square&logo=android)](https://www.android.com/)
[![Kotlin](https://img.shields.io/badge/Kotlin-1.9.22-7f52ff.svg?style=flat-square&logo=kotlin)](https://kotlinlang.org/)
[![Target SDK](https://img.shields.io/badge/Target%20SDK-34-blue.svg?style=flat-square)](https://developer.android.com/)
[![Min SDK](https://img.shields.io/badge/Min%20SDK-26-orange.svg?style=flat-square)](https://developer.android.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blueviolet.svg?style=flat-square)](../LICENSE)

</div>

This module provides the native Android client for **GridSense Enterprise EMS** (NHCE Major Project 22CSE74), engineered with clean Architecture (MVVM), Coroutines, Material Design 3, and sub-50ms Socket.IO WebSocket synchronization.

---

## 1. Architectural Highlights

- **Single Source of Truth**: Centralized [`EnergyRepository`](app/src/main/java/com/gridsense/ems/network/EnergyRepository.kt) enforcing synchronous recalculation of system active load ($P = \sum P_i$), line current ($I = \frac{P}{V \cdot \text{PF}}$), and accumulated energy.
- **Strict Functional Differentiation**:
  - **Home**: Executive summary displaying the Primary Active Power Card (`211 W`), dedicated Monthly Usage Card (`124.6 kWh`, `₹996`, `4.15 kWh/day`), 3-KPI Status Strip, curated Live Loads, and Peak-Shifting insights.
  - **Devices**: Full 8-circuit sub-metering catalog with live electrical metrics ($W, A, \text{PF}$), `ONLINE`/`STANDBY` badges, and haptic relay switches.
  - **Analytics**: 6-part analytical breakdown including MPAndroidChart 24-hr diurnal load curve, weekly breakdown, TOU cost analysis, and CEA carbon accounting.
  - **Automations & Settings**: 4 macro scenes (Night Mode, Eco Shift, Work Mode, Viva Full Load), actionable peak-shifting schedules, and gateway configuration.
- **Resilient Connectivity**:
  - Dynamic base URL switching targeting local Wi-Fi host (`192.168.1.42:5000`).
  - Automatic reconnection backoff with optimistic relay actuation.

---

## 2. Directory Structure

```
android/
├── build.gradle                 # Top-level Gradle configuration (Kotlin 1.9.22)
├── settings.gradle              # Module includes & repository declarations
├── gradlew                      # Gradle build wrapper
└── app/
    ├── build.gradle             # Dependencies: Retrofit 2, Socket.IO 2.1, MPAndroidChart v3.1.0
    └── src/main/
        ├── AndroidManifest.xml  # Permissions & hardware acceleration flags
        ├── res/                 # Vector drawables, layouts, and typography
        └── java/com/gridsense/ems/
            ├── model/           # Unified telemetry & circuit data classes
            ├── network/         # EnergyRepository, ApiClient, SocketManager
            ├── adapter/         # CircuitAdapter (DiffUtil, ListAdapter)
            └── ui/              # MainActivity, HomeFragment, DevicesFragment, AnalyticsFragment, AutomationsFragment
```

---

## 3. Compilation & Installation

### Build Debug APK:
```bash
./gradlew assembleDebug --no-daemon
```

### Install onto Device via ADB:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```
*Pre-compiled production binary is available at repository root: [`GridSense-Android-v2.0.apk`](../GridSense-Android-v2.0.apk).*
