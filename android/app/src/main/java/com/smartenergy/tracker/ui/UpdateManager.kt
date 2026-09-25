package com.smartenergy.tracker.ui

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.view.LayoutInflater
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.core.content.FileProvider
import com.smartenergy.tracker.BuildConfig
import com.smartenergy.tracker.R
import com.smartenergy.tracker.model.AppUpdateResponse
import com.smartenergy.tracker.network.ApiClient
import com.smartenergy.tracker.network.PreferencesManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.ResponseBody
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

object UpdateManager {

    fun checkForUpdates(activity: Activity, silent: Boolean = true) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service = ApiClient.getService(activity)
                val currentVersionCode = BuildConfig.VERSION_CODE
                val response = service.checkAppUpdate(currentVersionCode)

                if (response.isSuccessful && response.body() != null) {
                    val update = response.body()!!
                    if (update.hasUpdate && update.versionCode > currentVersionCode) {
                        withContext(Dispatchers.Main) {
                            showUpdateDialog(activity, update)
                        }
                    } else if (!silent) {
                        withContext(Dispatchers.Main) {
                            Toast.makeText(
                                activity,
                                "GridSense is up to date (v${BuildConfig.VERSION_NAME})",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    }
                } else if (!silent) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(activity, "Unable to check for updates.", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                if (!silent) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(activity, "Update check error: ${e.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    private fun showUpdateDialog(activity: Activity, update: AppUpdateResponse) {
        if (activity.isFinishing || activity.isDestroyed) return

        val view = LayoutInflater.from(activity).inflate(R.layout.dialog_update_available, null)
        val dialog = AlertDialog.Builder(activity)
            .setView(view)
            .setCancelable(!update.isMandatory)
            .create()

        val tvTitle = view.findViewById<TextView>(R.id.tvUpdateTitle)
        val tvSubtitle = view.findViewById<TextView>(R.id.tvUpdateSubtitle)
        val tvNotes = view.findViewById<TextView>(R.id.tvReleaseNotes)
        val btnLater = view.findViewById<Button>(R.id.btnLater)
        val btnDownload = view.findViewById<Button>(R.id.btnDownloadUpdate)
        val layoutProgress = view.findViewById<LinearLayout>(R.id.layoutDownloadProgress)
        val progressBar = view.findViewById<ProgressBar>(R.id.progressBarDownload)
        val tvPercent = view.findViewById<TextView>(R.id.tvDownloadPercent)
        val tvStatus = view.findViewById<TextView>(R.id.tvDownloadStatus)

        tvTitle.text = update.title ?: "GridSense v${update.latestVersion} Available"
        tvSubtitle.text = "Version ${update.latestVersion} (Build ${update.versionCode}) · ${update.fileSizeFormatted ?: "8 MB"}"
        if (!update.releaseNotes.isNullOrBlank()) {
            tvNotes.text = update.releaseNotes
        }

        if (update.isMandatory) {
            btnLater.visibility = View.GONE
        } else {
            btnLater.setOnClickListener {
                dialog.dismiss()
            }
        }

        btnDownload.setOnClickListener {
            // Check unknown sources installation permission on Android 8.0+
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!activity.packageManager.canRequestPackageInstalls()) {
                    Toast.makeText(
                        activity,
                        "Please allow 'Install unknown apps' to install the update",
                        Toast.LENGTH_LONG
                    ).show()
                    val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                        data = Uri.parse("package:${activity.packageName}")
                    }
                    activity.startActivity(intent)
                    return@setOnClickListener
                }
            }

            btnDownload.isEnabled = false
            btnLater.visibility = View.GONE
            layoutProgress.visibility = View.VISIBLE

            val baseUrl = PreferencesManager.getInstance(activity).baseUrl.trimEnd('/')
            val downloadUrl = if (update.apkUrl?.startsWith("http") == true) {
                update.apkUrl
            } else {
                "$baseUrl/${(update.apkUrl ?: "download/apk").trimStart('/')}"
            }

            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val service = ApiClient.getService(activity)
                    val response = service.downloadApkFile(downloadUrl)

                    if (response.isSuccessful && response.body() != null) {
                        val apkFile = downloadResponseBodyToFile(
                            response.body()!!,
                            activity
                        ) { percent ->
                            CoroutineScope(Dispatchers.Main).launch {
                                progressBar.progress = percent
                                tvPercent.text = "$percent%"
                                tvStatus.text = "Downloading update: $percent%"
                            }
                        }

                        withContext(Dispatchers.Main) {
                            tvStatus.text = "Download complete. Starting installer..."
                            dialog.dismiss()
                            installApk(activity, apkFile)
                        }
                    } else {
                        withContext(Dispatchers.Main) {
                            Toast.makeText(activity, "Download failed: Server returned ${response.code()}", Toast.LENGTH_LONG).show()
                            btnDownload.isEnabled = true
                            if (!update.isMandatory) btnLater.visibility = View.VISIBLE
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(activity, "Download error: ${e.message}", Toast.LENGTH_LONG).show()
                        btnDownload.isEnabled = true
                        if (!update.isMandatory) btnLater.visibility = View.VISIBLE
                    }
                }
            }
        }

        dialog.show()
    }

    private fun downloadResponseBodyToFile(
        body: ResponseBody,
        context: Context,
        onProgress: (Int) -> Unit
    ): File {
        val updateDir = File(context.cacheDir, "updates")
        if (!updateDir.exists()) updateDir.mkdirs()
        val file = File(updateDir, "GridSense-update.apk")
        if (file.exists()) file.delete()

        var inputStream: InputStream? = null
        var outputStream: FileOutputStream? = null

        try {
            val fileLength = body.contentLength()
            inputStream = body.byteStream()
            outputStream = FileOutputStream(file)

            val buffer = ByteArray(8192)
            var total: Long = 0
            var count: Int
            var lastProgress = 0

            while (inputStream.read(buffer).also { count = it } != -1) {
                total += count
                outputStream.write(buffer, 0, count)
                if (fileLength > 0) {
                    val percent = ((total * 100) / fileLength).toInt()
                    if (percent != lastProgress) {
                        lastProgress = percent
                        onProgress(percent)
                    }
                }
            }
            outputStream.flush()
            return file
        } finally {
            inputStream?.close()
            outputStream?.close()
        }
    }

    private fun installApk(activity: Activity, apkFile: File) {
        try {
            val apkUri: Uri = FileProvider.getUriForFile(
                activity,
                "${activity.packageName}.fileprovider",
                apkFile
            )

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(apkUri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            activity.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(activity, "Installation failed: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }
}
