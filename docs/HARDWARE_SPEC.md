# GridSense Enterprise EMS — Hardware Specification & Transducer Interface

## 1. System Hardware Architecture

The physical counterpart to GridSense Enterprise EMS interfaces non-invasive Current Transformers (CT) with a 240MHz dual-core 32-bit microcontroller (ESP32-WROOM-32) through 16-bit analog-to-digital converters (ADS1115).

```
                      ┌──────────────────────────────────────┐
                      │    Mains 230V AC 50Hz Supply Line    │
                      └──────────────────┬───────────────────┘
                                         │
              ┌──────────────────────────┴──────────────────────────┐
              │                                                     │
              ▼                                                     ▼
     ┌─────────────────┐                                   ┌─────────────────┐
     │  ZMPT101B Active│                                   │ 8x SCT-013-000  │
     │ Voltage Sensor  │                                   │ 100A:50mA Clamps│
     └────────┬────────┘                                   └────────┬────────┘
              │ 0-5V AC Analog Output                               │ 0-50mA AC
              ▼                                                     ▼
     ┌─────────────────┐                                   ┌─────────────────┐
     │ Calibration &   │                                   │ Burden Resistor │
     │ DC Bias Circuit │                                   │ RB = 33 Ω ± 1%  │
     └────────┬────────┘                                   └────────┬────────┘
              │                                                     │
              │                                                     ▼
              │                                            ┌─────────────────┐
              │                                            │ DC Bias Offset  │
              │                                            │ Vref = 1.65V DC │
              │                                            └────────┬────────┘
              │                                                     │
              └──────────────────────────┬──────────────────────────┘
                                         ▼
                   ┌──────────────────────────────────────────┐
                   │  2x ADS1115 16-Bit I2C ADC Multiplexers  │
                   │  - I2C Addresses: 0x48 (CH1-4), 0x49     │
                   │  - 860 Samples/Second per channel        │
                   └─────────────────────┬────────────────────┘
                                         │ I2C Bus (SDA: GPIO 21, SCL: GPIO 22)
                                         ▼
                   ┌──────────────────────────────────────────┐
                   │       ESP32-WROOM-32 Microcontroller     │
                   │  - 240MHz Xtensa Dual-Core LX6           │
                   │  - FreeRTOS True RMS Signal Processing   │
                   │  - MQTT Telemetry Publisher (Port 1883)  │
                   │  - 8-Channel Relay Driver via ULN2803A   │
                   └─────────────────────┬────────────────────┘
                                         │ GPIO 13, 14, 27, 26, 25, 33, 32, 19
                                         ▼
                   ┌──────────────────────────────────────────┐
                   │  8-Channel Optoisolated Relay Module     │
                   │  (Songle SRD-05VDC-SL-C, 10A 250V AC)    │
                   └──────────────────────────────────────────┘
```

---

## 2. Component Bill of Materials (BOM)

| Item | Component | Specification | Qty | Target Function |
|---|---|---|:---:|---|
| **U1** | ESP32-WROOM-32D | Dual-Core 240MHz, 4MB Flash, Wi-Fi 802.11 b/g/n + BLE 4.2 | 1 | Edge Gateway & Signal Processing |
| **U2, U3** | ADS1115 | 16-Bit $\Delta\Sigma$ ADC, Programmable Gain Amplifier, I2C Interface | 2 | High-precision sub-circuit analog sampling |
| **CT1–CT8** | SCT-013-000 | 100A rated current, 50mA secondary current output, Non-invasive split-core | 8 | Sub-metering individual appliance lines |
| **VT1** | ZMPT101B | Active AC Single-Phase Voltage Transformer Module (0–250V AC) | 1 | Real-time mains voltage phase & RMS sensing |
| **K1–K8** | SRD-05VDC-SL-C | 5V DC coil, 10A 250V AC contact rating, Optocoupled isolation | 1 | Automated Demand-Side load curtailment |
| **PS1** | Hi-Link HLK-PM01 | 230V AC to 5V DC isolated switching power module (3W) | 1 | Internal DC rail power supply |
| **R_B** | Burden Resistors | $33\,\Omega \pm 1\%$, 0.5W metal film | 8 | Current-to-voltage conversion for SCT-013 |
| **R_DIV** | Divider Resistors | $10\,\text{k}\Omega \pm 0.1\%$ matched pairs | 16 | Biasing AC signal around $V_{\text{AREF}}/2$ ($1.65\text{V}$) |
| **C_FLT** | Filter Capacitors | $10\,\mu\text{F}$ 16V low-ESR tantalum capacitor | 8 | DC bias ripple rejection and AC bypass |

---

## 3. Mathematical Calculations for Hardware Design

### 3.1 Burden Resistor Calculation ($R_B$)
The SCT-013-000 provides a secondary current ratio of $100\text{ A} : 0.050\text{ A}$ ($2000:1$ turns ratio).
For a maximum primary root-mean-square current $I_{\text{primary\_RMS}} = 30\text{ A}$ (typical residential branch):

$$I_{\text{primary\_peak}} = I_{\text{primary\_RMS}} \times \sqrt{2} = 30 \times 1.414 = 42.42\text{ A}$$

The secondary peak current $I_{\text{secondary\_peak}}$ is:

$$I_{\text{secondary\_peak}} = \frac{I_{\text{primary\_peak}}}{2000} = \frac{42.42}{2000} = 0.02121\text{ A} = 21.21\text{ mA}$$

To maximize the ADS1115 input dynamic range within $\pm 1.65\text{V}$ peak-to-peak around the DC bias offset:

$$R_B = \frac{V_{\text{peak}}}{I_{\text{secondary\_peak}}} = \frac{1.65\text{ V}}{0.02121\text{ A}} \approx 77.8\,\Omega$$

For standard $50\text{ A}$ maximum headroom, standard $33\,\Omega$ or $62\,\Omega$ metal film resistors are selected:
- With $R_B = 33\,\Omega$:
  $$V_{\text{out\_peak}} = 0.050\text{ A} \times \sqrt{2} \times 33\,\Omega = 2.33\text{ V}_{\text{pk-pk}}$$
  Fitting comfortably within the $3.3\text{V}$ operating window of the ADS1115 without saturation.

### 3.2 True RMS Discrete Integration
The ESP32 firmware executes discrete sampling at $1.0\text{ kHz}$ ($N = 1000$ samples per second, 20 samples per $50\text{ Hz}$ mains cycle):

$$V_{\text{RMS}} = \sqrt{\frac{1}{N} \sum_{n=1}^N \left( v[n] - V_{\text{offset}} \right)^2}$$

$$I_{\text{RMS}} = \sqrt{\frac{1}{N} \sum_{n=1}^N \left( i[n] - I_{\text{offset}} \right)^2}$$

$$P_{\text{active}} = \frac{1}{N} \sum_{n=1}^N \left( v[n] - V_{\text{offset}} \right) \times \left( i[n] - I_{\text{offset}} \right)$$

$$S_{\text{apparent}} = V_{\text{RMS}} \times I_{\text{RMS}}$$

$$\text{Power Factor } (\cos\phi) = \frac{P_{\text{active}}}{S_{\text{apparent}}}$$
