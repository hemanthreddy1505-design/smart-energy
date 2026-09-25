package com.smartenergy.tracker.model

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: T?,
    @SerializedName("message") val message: String?,
    @SerializedName("count") val count: Int? = null
)

data class MonthlyUsage(
    @SerializedName("kwh") var kwh: Double = 124.6,
    @SerializedName("estimatedBill") var estimatedBill: Double = 996.0,
    @SerializedName("dailyAverageKwh") var dailyAverageKwh: Double = 4.15,
    @SerializedName("comparisonPct") var comparisonPct: Double = -8.4,
    @SerializedName("projectedBill") var projectedBill: Double = 1240.0
)

data class ResidentInfo(
    @SerializedName("userId") val userId: String = "usr_dhanush",
    @SerializedName("name") val name: String = "Dhanush Yadav",
    @SerializedName("doorNo") val doorNo: String = "Flat 402, Block B",
    @SerializedName("consumerId") val consumerId: String = "BESCOM-BLR-D402-A81"
)

data class Telemetry(
    @SerializedName("deviceId") val deviceId: String? = "ESP32-SIM-001",
    @SerializedName("timestamp") val timestamp: String? = null,
    @SerializedName("resident") var resident: ResidentInfo? = ResidentInfo(),
    @SerializedName("gridVoltage") var gridVoltage: Double = 229.4,
    @SerializedName("totalActivePower") var totalActivePower: Double = 211.0,
    @SerializedName("totalCurrent") var totalCurrent: Double = 0.98,
    @SerializedName("systemPowerFactor") var systemPowerFactor: Double = 0.94,
    @SerializedName("frequency") var frequency: Double = 50.0,
    @SerializedName("totalEnergyTodayKwh") var totalEnergyTodayKwh: Double = 4.20,
    @SerializedName("estimatedCost") var estimatedCost: Double = 33.60,
    @SerializedName("carbonKg") var carbonKg: Double = 102.17,
    @SerializedName("isPeakHour") var isPeakHour: Boolean = false,
    @SerializedName("tariffRate") var tariffRate: Double = 8.00,
    @SerializedName("speedMultiplier") var speedMultiplier: Double = 1.0,
    @SerializedName("activeDevicesCount") var activeDevicesCount: Int = 3,
    @SerializedName("totalDevicesCount") var totalDevicesCount: Int = 8,
    @SerializedName("monthlyUsage") var monthlyUsage: MonthlyUsage = MonthlyUsage(),
    @SerializedName("appliances") val appliances: List<Appliance>? = null
)

data class Appliance(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("type") val type: String? = null,
    @SerializedName("location") val location: String? = "Main Board",
    @SerializedName("ratedPower") val ratedPower: Double = 0.0,
    @SerializedName("minPower") val minPower: Double = 0.0,
    @SerializedName("maxPower") val maxPower: Double = 0.0,
    @SerializedName("powerFactor") val powerFactor: Double = 0.95,
    @SerializedName("isOn") var isOn: Boolean = false,
    @SerializedName("isAnomaly") var isAnomaly: Boolean = false,
    @SerializedName("category") val category: String? = "General",
    @SerializedName("icon") val icon: String? = null,
    @SerializedName("runtimeSeconds") var runtimeSeconds: Long = 0,
    @SerializedName("continuousOnSeconds") var continuousOnSeconds: Long = 0,
    @SerializedName("reading") var reading: SensorReading? = null
)

data class SensorReading(
    @SerializedName("sensorType") val sensorType: String? = "CT Clamp PZEM-004T",
    @SerializedName("voltage") var voltage: Double = 229.4,
    @SerializedName("current") var current: Double = 0.0,
    @SerializedName("powerFactor") var powerFactor: Double = 0.95,
    @SerializedName("activePower") var activePower: Double = 0.0,
    @SerializedName("apparentPower") var apparentPower: Double = 0.0,
    @SerializedName("reactivePower") var reactivePower: Double = 0.0,
    @SerializedName("cumulativeEnergyKwh") var cumulativeEnergyKwh: Double = 0.0,
    @SerializedName("status") var status: String? = "NORMAL"
)

data class AlertItem(
    @SerializedName("id") val id: Long = 0,
    @SerializedName("appliance_id") val applianceId: String? = null,
    @SerializedName("alert_type") val alertType: String? = "WARNING",
    @SerializedName("severity") val severity: String? = "warning",
    @SerializedName("message") val message: String? = "",
    @SerializedName("is_resolved") var isResolved: Int = 0,
    @SerializedName("timestamp") val timestamp: String? = null
) {
    val resolved: Boolean get() = isResolved == 1
}

data class SceneItem(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String? = "",
    @SerializedName("icon") val icon: String? = "leaf",
    @SerializedName("active") var active: Boolean = false
)

data class RuleItem(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("condition") val condition: String? = "",
    @SerializedName("action") val action: String? = "",
    @SerializedName("enabled") var enabled: Boolean = true
)

data class ForecastData(
    @SerializedName("model") val model: String? = "Diurnal Peak Predictor (Ridge-Polynomial)",
    @SerializedName("hourly") val hourly: List<ForecastHour>? = null,
    @SerializedName("totalExpectedKwh") val totalExpectedKwh: Double? = 0.0,
    @SerializedName("predictedCost") val predictedCost: Double? = 0.0,
    @SerializedName("peakHour") val peakHour: Int? = 19
)

data class ForecastHour(
    @SerializedName("hour") val hour: Int = 0,
    @SerializedName("predictedKw") val predictedKw: Double = 0.0,
    @SerializedName("cost") val cost: Double = 0.0,
    @SerializedName("isPeak") val isPeak: Boolean = false
)

data class LoadShiftingData(
    @SerializedName("currentPeakHour") val currentPeakHour: Boolean = false,
    @SerializedName("recommendations") val recommendations: List<ShiftRecommendation>? = null,
    @SerializedName("potentialSavings") val potentialSavings: Double? = 42.70
)

data class ShiftRecommendation(
    @SerializedName("applianceId") val applianceId: String,
    @SerializedName("applianceName") val applianceName: String,
    @SerializedName("currentCost") val currentCost: Double = 0.0,
    @SerializedName("shiftedCost") val shiftedCost: Double = 0.0,
    @SerializedName("savings") val savings: Double = 0.0,
    @SerializedName("suggestedHour") val suggestedHour: String = "23:00"
)

data class ToggleResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?,
    @SerializedName("data") val data: Appliance?
)

data class AppUpdateResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("hasUpdate") val hasUpdate: Boolean = false,
    @SerializedName("latestVersion") val latestVersion: String? = null,
    @SerializedName("versionCode") val versionCode: Int = 0,
    @SerializedName("title") val title: String? = null,
    @SerializedName("releaseNotes") val releaseNotes: String? = null,
    @SerializedName("apkUrl") val apkUrl: String? = null,
    @SerializedName("fileSizeFormatted") val fileSizeFormatted: String? = null,
    @SerializedName("isMandatory") val isMandatory: Boolean = false,
    @SerializedName("message") val message: String? = null
)
