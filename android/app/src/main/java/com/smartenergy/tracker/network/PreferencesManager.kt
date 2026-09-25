package com.smartenergy.tracker.network

import android.content.Context
import android.content.SharedPreferences

class PreferencesManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREF_NAME = "smart_energy_prefs"
        private const val KEY_SERVER_URL = "server_url"
        private const val KEY_SERVER_IP = "server_ip"
        private const val KEY_SERVER_PORT = "server_port"
        const val DEFAULT_RAILWAY_URL = "https://web-production-29e8e.up.railway.app"
        const val DEFAULT_LOCAL_URL = "http://192.168.1.42:5000"

        @Volatile
        private var INSTANCE: PreferencesManager? = null

        fun getInstance(context: Context): PreferencesManager {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: PreferencesManager(context.applicationContext).also { INSTANCE = it }
            }
        }
    }

    var serverUrl: String
        get() = prefs.getString(KEY_SERVER_URL, DEFAULT_RAILWAY_URL) ?: DEFAULT_RAILWAY_URL
        set(value) {
            val normalized = normalizeUrl(value)
            prefs.edit().putString(KEY_SERVER_URL, normalized).apply()
        }

    val baseUrl: String
        get() {
            val url = serverUrl.trim()
            return if (url.endsWith("/")) url else "$url/"
        }

    val socketUrl: String
        get() {
            val url = serverUrl.trim()
            return if (url.endsWith("/")) url.substring(0, url.length - 1) else url
        }

    fun normalizeUrl(raw: String): String {
        var clean = raw.trim()
        if (clean.isEmpty()) return DEFAULT_RAILWAY_URL

        while (clean.endsWith("/")) {
            clean = clean.substring(0, clean.length - 1)
        }

        if (clean.startsWith("http://") || clean.startsWith("https://")) {
            return clean
        }

        return if (clean.contains(".railway.app") || clean.contains(".up.railway.app") || clean.contains(".com") || clean.contains(".app") || clean.contains(".org")) {
            "https://$clean"
        } else {
            if (!clean.contains(":")) {
                "http://$clean:5000"
            } else {
                "http://$clean"
            }
        }
    }
}
