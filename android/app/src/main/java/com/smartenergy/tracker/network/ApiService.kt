package com.smartenergy.tracker.network

import com.smartenergy.tracker.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @GET("api/appliances")
    suspend fun getAppliances(): Response<ApiResponse<List<Appliance>>>

    @POST("api/appliances/{id}/toggle")
    suspend fun toggleAppliance(
        @Path("id") id: String,
        @Body body: Map<String, Boolean>
    ): Response<ToggleResponse>

    @POST("api/appliances/{id}/anomaly")
    suspend fun injectAnomaly(
        @Path("id") id: String,
        @Body body: Map<String, Any>
    ): Response<ApiResponse<Any>>

    @GET("api/alerts")
    suspend fun getAlerts(): Response<ApiResponse<List<AlertItem>>>

    @POST("api/alerts/{id}/resolve")
    suspend fun resolveAlert(@Path("id") id: Long): Response<ApiResponse<Any>>

    @GET("api/schedules/scenes")
    suspend fun getScenes(): Response<ApiResponse<List<SceneItem>>>

    @POST("api/schedules/scenes/{id}/apply")
    suspend fun applyScene(@Path("id") id: String): Response<ApiResponse<Any>>

    @GET("api/schedules/rules")
    suspend fun getRules(): Response<ApiResponse<List<RuleItem>>>

    @GET("api/schedules/load-shifting")
    suspend fun getLoadShifting(): Response<ApiResponse<LoadShiftingData>>

    @GET("api/analytics/forecast")
    suspend fun getForecast(): Response<ApiResponse<ForecastData>>

    @POST("api/simulation/scenario")
    suspend fun triggerScenario(@Body body: Map<String, String>): Response<ApiResponse<Any>>

    @POST("api/simulation/reset")
    suspend fun resetSimulation(): Response<ApiResponse<Any>>

    @POST("api/auth/switch")
    suspend fun switchUser(@Body body: Map<String, String>): Response<ApiResponse<Any>>

    @GET("api/app/update")
    suspend fun checkAppUpdate(
        @Query("currentVersionCode") currentVersionCode: Int
    ): Response<AppUpdateResponse>

    @Streaming
    @GET
    suspend fun downloadApkFile(
        @Url fileUrl: String
    ): Response<okhttp3.ResponseBody>
}
