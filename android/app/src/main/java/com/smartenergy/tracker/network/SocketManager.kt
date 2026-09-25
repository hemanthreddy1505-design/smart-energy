package com.smartenergy.tracker.network

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.google.gson.Gson
import com.smartenergy.tracker.model.AlertItem
import com.smartenergy.tracker.model.Appliance
import com.smartenergy.tracker.model.Telemetry
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import io.socket.engineio.client.transports.Polling
import io.socket.engineio.client.transports.WebSocket
import java.net.URI

class SocketManager private constructor(private val context: Context) {
    private var socket: Socket? = null
    private val gson = Gson()
    private val mainHandler = Handler(Looper.getMainLooper())

    var isConnected: Boolean = false
        private set

    // Callbacks
    var onConnectionChanged: ((Boolean) -> Unit)? = null
    var onTelemetryReceived: ((Telemetry) -> Unit)? = null
    var onApplianceChanged: ((Appliance) -> Unit)? = null
    var onAlertReceived: ((AlertItem) -> Unit)? = null

    companion object {
        private const val TAG = "SocketManager"

        @Volatile
        private var INSTANCE: SocketManager? = null

        fun getInstance(context: Context): SocketManager {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: SocketManager(context.applicationContext).also { INSTANCE = it }
            }
        }
    }

    fun connect() {
        val prefs = PreferencesManager.getInstance(context)
        val url = prefs.socketUrl
        Log.d(TAG, "Connecting to Socket.IO at $url")

        try {
            socket?.disconnect()
            socket?.off()

            val opts = IO.Options().apply {
                reconnection = true
                reconnectionAttempts = 50
                reconnectionDelay = 2000
                timeout = 10000
                forceNew = true
                transports = arrayOf(WebSocket.NAME, Polling.NAME)
            }

            socket = IO.socket(URI.create(url), opts)

            socket?.on(Socket.EVENT_CONNECT) {
                Log.d(TAG, "Socket connected: ${socket?.id()}")
                isConnected = true
                mainHandler.post { onConnectionChanged?.invoke(true) }
            }

            socket?.on(Socket.EVENT_DISCONNECT) {
                Log.d(TAG, "Socket disconnected")
                isConnected = false
                mainHandler.post { onConnectionChanged?.invoke(false) }
            }

            socket?.on(Socket.EVENT_CONNECT_ERROR) { args ->
                Log.e(TAG, "Socket connect error: ${args.firstOrNull()}")
                isConnected = false
                mainHandler.post { onConnectionChanged?.invoke(false) }
            }

            // Real-time telemetry tick stream (every 1s)
            socket?.on("telemetry:update") { args ->
                if (args.isNotEmpty() && args[0] != null) {
                    try {
                        val json = args[0].toString()
                        val telemetry = gson.fromJson(json, Telemetry::class.java)
                        mainHandler.post { onTelemetryReceived?.invoke(telemetry) }
                    } catch (e: Exception) {
                        Log.e(TAG, "Error parsing telemetry:update", e)
                    }
                }
            }

            // Snapshot upon connection
            socket?.on("init:snapshot") { args ->
                if (args.isNotEmpty() && args[0] != null) {
                    try {
                        val json = args[0].toString()
                        val telemetry = gson.fromJson(json, Telemetry::class.java)
                        mainHandler.post { onTelemetryReceived?.invoke(telemetry) }
                    } catch (e: Exception) {
                        Log.e(TAG, "Error parsing init:snapshot", e)
                    }
                }
            }

            // Appliance relay status change broadcast
            socket?.on("appliance:state_changed") { args ->
                if (args.isNotEmpty() && args[0] != null) {
                    try {
                        val json = args[0].toString()
                        val appliance = gson.fromJson(json, Appliance::class.java)
                        mainHandler.post { onApplianceChanged?.invoke(appliance) }
                    } catch (e: Exception) {
                        Log.e(TAG, "Error parsing appliance:state_changed", e)
                    }
                }
            }

            // Anomaly push alert
            socket?.on("alert:new") { args ->
                if (args.isNotEmpty() && args[0] != null) {
                    try {
                        val json = args[0].toString()
                        val alert = gson.fromJson(json, AlertItem::class.java)
                        mainHandler.post { onAlertReceived?.invoke(alert) }
                    } catch (e: Exception) {
                        Log.e(TAG, "Error parsing alert:new", e)
                    }
                }
            }

            socket?.connect()

        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize socket", e)
            isConnected = false
            mainHandler.post { onConnectionChanged?.invoke(false) }
        }
    }

    fun toggleAppliance(id: String, state: Boolean) {
        try {
            val payload = JSONObject().apply {
                put("id", id)
                put("state", state)
            }
            socket?.emit("appliance:toggle", payload)
            Log.d(TAG, "Emitted appliance:toggle for $id -> $state")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to emit appliance:toggle", e)
        }
    }

    fun disconnect() {
        socket?.disconnect()
        socket?.off()
        isConnected = false
    }
}
