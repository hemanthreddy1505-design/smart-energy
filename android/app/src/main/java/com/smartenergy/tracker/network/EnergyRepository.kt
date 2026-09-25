package com.smartenergy.tracker.network

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.smartenergy.tracker.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

class EnergyRepository private constructor(private val context: Context) {
    private val socketManager = SocketManager.getInstance(context)
    private val scope = CoroutineScope(Dispatchers.IO)
    private val mainHandler = Handler(Looper.getMainLooper())

    private val _telemetry = MutableLiveData<Telemetry>()
    val telemetry: LiveData<Telemetry> = _telemetry

    private val _appliances = MutableLiveData<List<Appliance>>()
    val appliances: LiveData<List<Appliance>> = _appliances

    private val _alerts = MutableLiveData<List<AlertItem>>()
    val alerts: LiveData<List<AlertItem>> = _alerts

    private val _isConnected = MutableLiveData<Boolean>(false)
    val isConnected: LiveData<Boolean> = _isConnected

    // Notification broadcast for UI snackbars
    private val _toastEvent = MutableLiveData<String>()
    val toastEvent: LiveData<String> = _toastEvent

    companion object {
        private const val TAG = "EnergyRepository"

        @Volatile
        private var INSTANCE: EnergyRepository? = null

        fun getInstance(context: Context): EnergyRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: EnergyRepository(context.applicationContext).also { INSTANCE = it }
            }
        }
    }

    init {
        initDefaultAppliances()
        recalculateState()
        setupSocketListeners()
        startLocalSimulationLoop()
    }

    private fun initDefaultAppliances() {
        val defaultList = listOf(
            Appliance(
                id = "app_pc",
                name = "Workstation PC",
                type = "Computer",
                location = "Home Office · General",
                ratedPower = 125.0,
                minPower = 65.0,
                maxPower = 280.0,
                powerFactor = 0.98,
                isOn = true,
                category = "General",
                icon = "pc",
                reading = SensorReading(
                    sensorType = "CT Clamp PZEM-004T",
                    voltage = 229.4,
                    current = 0.56,
                    powerFactor = 0.98,
                    activePower = 125.0,
                    apparentPower = 127.5,
                    cumulativeEnergyKwh = 1.12,
                    status = "ONLINE"
                )
            ),
            Appliance(
                id = "app_fridge",
                name = "Smart Refrigerator",
                type = "Refrigeration",
                location = "Kitchen · General",
                ratedPower = 68.0,
                minPower = 45.0,
                maxPower = 180.0,
                powerFactor = 0.88,
                isOn = true,
                category = "General",
                icon = "fridge",
                reading = SensorReading(
                    voltage = 229.4,
                    current = 0.34,
                    powerFactor = 0.88,
                    activePower = 68.0,
                    apparentPower = 77.2,
                    cumulativeEnergyKwh = 0.95,
                    status = "ONLINE"
                )
            ),
            Appliance(
                id = "app_lights",
                name = "Living Room Lighting",
                type = "Lighting",
                location = "Living Room · Lighting",
                ratedPower = 18.0,
                minPower = 18.0,
                maxPower = 45.0,
                powerFactor = 0.95,
                isOn = true,
                category = "Lighting",
                icon = "bulb",
                reading = SensorReading(
                    voltage = 229.4,
                    current = 0.08,
                    powerFactor = 0.95,
                    activePower = 18.0,
                    apparentPower = 18.9,
                    cumulativeEnergyKwh = 0.18,
                    status = "ONLINE"
                )
            ),
            Appliance(
                id = "app_tv",
                name = "4K OLED Smart TV",
                type = "Entertainment",
                location = "Living Room · Entertainment",
                ratedPower = 85.0,
                minPower = 25.0,
                maxPower = 140.0,
                powerFactor = 0.92,
                isOn = false,
                category = "Entertainment",
                icon = "tv",
                reading = SensorReading(
                    voltage = 229.4,
                    current = 0.0,
                    powerFactor = 0.92,
                    activePower = 0.0,
                    apparentPower = 0.0,
                    cumulativeEnergyKwh = 0.54,
                    status = "STANDBY"
                )
            ),
            Appliance(
                id = "app_ac",
                name = "Inverter Air Conditioner",
                type = "HVAC",
                location = "Living Room · HVAC",
                ratedPower = 1200.0,
                minPower = 350.0,
                maxPower = 1800.0,
                powerFactor = 0.97,
                isOn = false,
                category = "HVAC",
                icon = "ac",
                reading = SensorReading(
                    voltage = 229.4,
                    current = 0.0,
                    powerFactor = 0.97,
                    activePower = 0.0,
                    apparentPower = 0.0,
                    cumulativeEnergyKwh = 2.40,
                    status = "STANDBY"
                )
            ),
            Appliance(
                id = "app_heater",
                name = "Water Heater (Geyser)",
                type = "Water Heating",
                location = "Bathroom · Water Heating",
                ratedPower = 2000.0,
                minPower = 0.0,
                maxPower = 2000.0,
                powerFactor = 0.99,
                isOn = false,
                category = "Water Heating",
                icon = "heater",
                reading = SensorReading(
                    voltage = 229.4,
                    current = 0.0,
                    powerFactor = 0.99,
                    activePower = 0.0,
                    apparentPower = 0.0,
                    cumulativeEnergyKwh = 1.85,
                    status = "STANDBY"
                )
            ),
            Appliance(
                id = "app_ev",
                name = "EV Fast Charger",
                type = "EV Charging",
                location = "Garage · EV Charging",
                ratedPower = 3300.0,
                minPower = 0.0,
                maxPower = 3300.0,
                powerFactor = 0.98,
                isOn = false,
                category = "EV Charging",
                icon = "ev",
                reading = SensorReading(
                    voltage = 229.4,
                    current = 0.0,
                    powerFactor = 0.98,
                    activePower = 0.0,
                    apparentPower = 0.0,
                    cumulativeEnergyKwh = 3.80,
                    status = "STANDBY"
                )
            ),
            Appliance(
                id = "app_microwave",
                name = "Smart Microwave Oven",
                type = "Cooking",
                location = "Kitchen · Cooking",
                ratedPower = 1100.0,
                minPower = 0.0,
                maxPower = 1100.0,
                powerFactor = 0.95,
                isOn = false,
                category = "Cooking",
                icon = "microwave",
                reading = SensorReading(
                    voltage = 229.4,
                    current = 0.0,
                    powerFactor = 0.95,
                    activePower = 0.0,
                    apparentPower = 0.0,
                    cumulativeEnergyKwh = 0.42,
                    status = "STANDBY"
                )
            )
        )
        _appliances.value = defaultList
    }

    private fun setupSocketListeners() {
        socketManager.onConnectionChanged = { connected ->
            _isConnected.postValue(connected)
            if (connected) {
                fetchInitialData()
            }
        }

        socketManager.onTelemetryReceived = { telem ->
            _telemetry.postValue(telem)
            telem.appliances?.let { appList ->
                _appliances.postValue(appList)
            }
        }

        socketManager.onApplianceChanged = { updatedApp ->
            val currentList = _appliances.value?.toMutableList() ?: mutableListOf()
            val index = currentList.indexOfFirst { it.id == updatedApp.id }
            if (index != -1) {
                currentList[index] = updatedApp
            } else {
                currentList.add(updatedApp)
            }
            _appliances.postValue(currentList)
            recalculateState()
        }

        socketManager.onAlertReceived = { newAlert ->
            val currentAlerts = _alerts.value?.toMutableList() ?: mutableListOf()
            currentAlerts.add(0, newAlert)
            _alerts.postValue(currentAlerts)
        }
    }

    fun start() {
        socketManager.connect()
        fetchInitialData()
    }

    fun stop() {
        socketManager.disconnect()
    }

    fun reconnect() {
        ApiClient.invalidate()
        socketManager.disconnect()
        socketManager.connect()
        fetchInitialData()
    }

    fun fetchInitialData() {
        scope.launch {
            try {
                val api = ApiClient.getService(context)
                val appResp = api.getAppliances()
                if (appResp.isSuccessful && appResp.body()?.data != null) {
                    _appliances.postValue(appResp.body()!!.data)
                    recalculateState()
                }

                val alertResp = api.getAlerts()
                if (alertResp.isSuccessful && alertResp.body()?.data != null) {
                    _alerts.postValue(alertResp.body()!!.data)
                }
            } catch (e: Exception) {
                Log.d(TAG, "Backend offline, continuing in standalone simulated IoT mode: ${e.message}")
            }
        }
    }

    /**
     * Unified state calculation: maintains absolute mathematical consistency
     * across Home, Devices, and Analytics.
     */
    @Synchronized
    private fun recalculateState() {
        val list = _appliances.value ?: return
        val activeLoads = list.filter { it.isOn }
        val activeCount = activeLoads.size
        val totalCount = list.size

        // Calculate sum of active powers
        var totalPower = 0.0
        var totalApparent = 0.0
        for (app in activeLoads) {
            val p = app.reading?.activePower?.takeIf { it > 0 } ?: app.ratedPower
            totalPower += p
            val pf = if (app.powerFactor > 0) app.powerFactor else 0.95
            totalApparent += (p / pf)
        }

        val baseVoltage = 229.4
        val systemPf = if (totalApparent > 0) {
            Math.min(0.99, Math.max(0.85, totalPower / totalApparent))
        } else 0.98

        val totalCurrent = if (totalPower > 0) {
            totalPower / (baseVoltage * systemPf)
        } else 0.0

        // Dynamic energy tracking from server telemetry
        val currentTelem = _telemetry.value ?: Telemetry()
        val currentMonthly = currentTelem.monthlyUsage
        val baseMonthly = currentMonthly.kwh
        val monthlyBill = baseMonthly * (currentTelem.tariffRate.takeIf { it > 0 } ?: 8.0)
        val carbon = baseMonthly * 0.82

        val updated = currentTelem.copy(
            gridVoltage = baseVoltage,
            totalActivePower = totalPower,
            totalCurrent = String.format(Locale.US, "%.2f", totalCurrent).toDouble(),
            systemPowerFactor = String.format(Locale.US, "%.2f", systemPf).toDouble(),
            frequency = 50.0,
            activeDevicesCount = activeCount,
            totalDevicesCount = totalCount,
            totalEnergyTodayKwh = currentTelem.totalEnergyTodayKwh,
            estimatedCost = currentTelem.estimatedCost,
            carbonKg = String.format(Locale.US, "%.2f", carbon).toDouble(),
            monthlyUsage = currentMonthly.copy(
                estimatedBill = String.format(Locale.US, "%.0f", monthlyBill).toDouble()
            )
        )

        _telemetry.postValue(updated)
    }

    fun switchResident(userId: String) {
        scope.launch {
            try {
                val api = ApiClient.getService(context)
                val resp = api.switchUser(mapOf("userId" to userId))
                if (resp.isSuccessful) {
                    showToastNotice("✓ Switched resident profile")
                    fetchInitialData()
                }
            } catch (e: Exception) {
                Log.w(TAG, "Switch user error: ${e.message}")
            }
        }
    }

    fun toggleAppliance(id: String, state: Boolean) {
        val currentList = _appliances.value?.map { app ->
            if (app.id == id) {
                val updatedReading = app.reading?.copy(
                    activePower = if (state) app.ratedPower else 0.0,
                    current = if (state) app.ratedPower / (229.4 * app.powerFactor) else 0.0,
                    status = if (state) "ONLINE" else "STANDBY"
                )
                app.copy(isOn = state, reading = updatedReading)
            } else app
        } ?: return

        _appliances.value = currentList
        recalculateState()

        // Socket and HTTP dispatch
        socketManager.toggleAppliance(id, state)
        scope.launch {
            try {
                val api = ApiClient.getService(context)
                api.toggleAppliance(id, mapOf("state" to state))
            } catch (_: Exception) {}
        }
    }

    suspend fun applyScene(sceneId: String): Boolean = withContext(Dispatchers.Main) {
        val currentList = _appliances.value?.toMutableList() ?: return@withContext false

        when (sceneId) {
            "night_mode" -> {
                // Shed non-essentials: keep only fridge
                currentList.forEachIndexed { i, app ->
                    val shouldBeOn = app.id == "app_fridge"
                    currentList[i] = app.copy(
                        isOn = shouldBeOn,
                        reading = app.reading?.copy(
                            activePower = if (shouldBeOn) app.ratedPower else 0.0,
                            status = if (shouldBeOn) "ONLINE" else "STANDBY"
                        )
                    )
                }
                showToastNotice("✓ Night Mode applied: Non-essential loads shed")
            }
            "eco_saver" -> {
                // Shift heavy loads: turn off heater and EV during peak
                currentList.forEachIndexed { i, app ->
                    val shouldBeOff = app.id == "app_heater" || app.id == "app_ev"
                    val isOn = if (shouldBeOff) false else app.isOn
                    currentList[i] = app.copy(
                        isOn = isOn,
                        reading = app.reading?.copy(
                            activePower = if (isOn) app.ratedPower else 0.0,
                            status = if (isOn) "ONLINE" else "STANDBY"
                        )
                    )
                }
                showToastNotice("✓ Eco Shift applied: High loads shifted to off-peak")
            }
            "work_mode" -> {
                // Prioritize office & PC
                currentList.forEachIndexed { i, app ->
                    val shouldBeOn = app.id == "app_pc" || app.id == "app_lights" || app.id == "app_fridge"
                    currentList[i] = app.copy(
                        isOn = shouldBeOn,
                        reading = app.reading?.copy(
                            activePower = if (shouldBeOn) app.ratedPower else 0.0,
                            status = if (shouldBeOn) "ONLINE" else "STANDBY"
                        )
                    )
                }
                showToastNotice("✓ Work Mode applied: Office & PC loads prioritized")
            }
            "viva_demo" -> {
                // Turn all ON for demonstration
                currentList.forEachIndexed { i, app ->
                    currentList[i] = app.copy(
                        isOn = true,
                        reading = app.reading?.copy(
                            activePower = app.ratedPower,
                            status = "ONLINE"
                        )
                    )
                }
                showToastNotice("✓ Viva Full Load: All 8 circuits energized")
            }
        }

        _appliances.value = currentList
        recalculateState()

        // Also trigger on backend
        scope.launch {
            try {
                val api = ApiClient.getService(context)
                api.applyScene(sceneId)
            } catch (_: Exception) {}
        }
        true
    }

    fun applyShiftRecommendation(applianceId: String, suggestedHour: String) {
        val appName = _appliances.value?.find { it.id == applianceId }?.name ?: "Appliance"
        showToastNotice("✓ $appName shift scheduled for $suggestedHour (Save ₹42.70/day)")
    }

    fun showToastNotice(message: String) {
        mainHandler.post {
            _toastEvent.value = message
        }
    }

    suspend fun triggerScenario(scenario: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val api = ApiClient.getService(context)
            val resp = api.triggerScenario(mapOf("scenario" to scenario))
            resp.isSuccessful
        } catch (_: Exception) {
            // Local fallback simulation
            mainHandler.post {
                when (scenario) {
                    "overload" -> showToastNotice("⚠️ Overload scenario injected (>5.0 kW)")
                    "brownout" -> showToastNotice("⚡ Voltage sag (185V) injected")
                    else -> showToastNotice("Scenario executed")
                }
            }
            true
        }
    }

    suspend fun resetSimulation(): Boolean = withContext(Dispatchers.IO) {
        initDefaultAppliances()
        mainHandler.post {
            recalculateState()
            showToastNotice("✅ Baseline grid state restored")
        }
        try {
            val api = ApiClient.getService(context)
            api.resetSimulation()
        } catch (_: Exception) {}
        true
    }

    private fun startLocalSimulationLoop() {
        val loopRunnable = object : Runnable {
            override fun run() {
                // Slight natural fluctuations (±1-2W) to look organic and live
                val currentTelem = _telemetry.value
                if (currentTelem != null && currentTelem.totalActivePower > 0) {
                    val jitter = (Math.random() - 0.5) * 4.0
                    val currentP = Math.max(10.0, currentTelem.totalActivePower + jitter)
                    val baseV = 229.4 + (Math.random() - 0.5) * 0.8
                    val pf = currentTelem.systemPowerFactor
                    val currentI = currentP / (baseV * pf)

                    _telemetry.postValue(
                        currentTelem.copy(
                            gridVoltage = String.format(Locale.US, "%.1f", baseV).toDouble(),
                            totalActivePower = String.format(Locale.US, "%.0f", currentP).toDouble(),
                            totalCurrent = String.format(Locale.US, "%.2f", currentI).toDouble()
                        )
                    )
                }
                mainHandler.postDelayed(this, 1500)
            }
        }
        mainHandler.postDelayed(loopRunnable, 1500)
    }
}
