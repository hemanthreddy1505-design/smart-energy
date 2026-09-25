package com.smartenergy.tracker.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.smartenergy.tracker.R
import com.smartenergy.tracker.databinding.BottomSheetDeviceDetailBinding
import com.smartenergy.tracker.model.Appliance
import com.smartenergy.tracker.network.ApiClient
import com.smartenergy.tracker.network.EnergyRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

class DeviceDetailBottomSheet : BottomSheetDialogFragment() {
    private var _binding: BottomSheetDeviceDetailBinding? = null
    private val binding get() = _binding!!

    private var appliance: Appliance? = null

    companion object {
        fun newInstance(appliance: Appliance): DeviceDetailBottomSheet {
            val sheet = DeviceDetailBottomSheet()
            sheet.appliance = appliance
            return sheet
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetDeviceDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val app = appliance ?: return
        bindData(app)
        setupActions(app)
    }

    private fun bindData(app: Appliance) {
        binding.sheetApplianceName.text = app.name
        binding.sheetApplianceLocation.text = "${app.location ?: "General"} · ${app.category ?: "Zone"}"

        val nameLower = app.name.lowercase(Locale.US)
        val iconType = app.icon?.lowercase(Locale.US) ?: ""
        when {
            iconType == "pc" || nameLower.contains("pc") || nameLower.contains("workstation") ->
                binding.sheetApplianceIcon.setImageResource(R.drawable.ic_pc)
            iconType == "fridge" || nameLower.contains("fridge") || nameLower.contains("refrigerator") ->
                binding.sheetApplianceIcon.setImageResource(R.drawable.ic_fridge)
            iconType == "bulb" || nameLower.contains("light") ->
                binding.sheetApplianceIcon.setImageResource(R.drawable.ic_bulb)
            iconType == "tv" || nameLower.contains("tv") ->
                binding.sheetApplianceIcon.setImageResource(R.drawable.ic_tv)
            iconType == "ac" || nameLower.contains("ac") || nameLower.contains("air") ->
                binding.sheetApplianceIcon.setImageResource(R.drawable.ic_ac)
            iconType == "heater" || nameLower.contains("heater") ->
                binding.sheetApplianceIcon.setImageResource(R.drawable.ic_heater)
            iconType == "ev" || nameLower.contains("ev") ->
                binding.sheetApplianceIcon.setImageResource(R.drawable.ic_ev)
            iconType == "microwave" || nameLower.contains("microwave") ->
                binding.sheetApplianceIcon.setImageResource(R.drawable.ic_microwave)
            else ->
                binding.sheetApplianceIcon.setImageResource(R.drawable.ic_bolt)
        }

        val reading = app.reading
        val activeWatts = if (app.isOn) reading?.activePower ?: app.ratedPower else 0.0
        val currentAmps = if (app.isOn) reading?.current ?: (activeWatts / 230.0) else 0.0
        val pf = if (app.isOn) reading?.powerFactor ?: app.powerFactor else 1.0
        val kwh = reading?.cumulativeEnergyKwh ?: 0.0

        binding.sheetValActivePower.text = String.format(Locale.US, "%,.0f W", activeWatts)
        binding.sheetValCurrent.text = String.format(Locale.US, "%.2f A", currentAmps)
        binding.sheetValPf.text = String.format(Locale.US, "%.2f", pf)
        binding.sheetValEnergy.text = String.format(Locale.US, "%.2f kWh", kwh)

        binding.sheetRelaySwitch.setOnCheckedChangeListener(null)
        binding.sheetRelaySwitch.isChecked = app.isOn
        binding.sheetRelaySwitch.setOnCheckedChangeListener { _, isChecked ->
            EnergyRepository.getInstance(requireContext()).toggleAppliance(app.id, isChecked)
            app.isOn = isChecked
            bindData(app)
        }
    }

    private fun setupActions(app: Appliance) {
        binding.btnInjectSpike.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                try {
                    val api = ApiClient.getService(requireContext())
                    val resp = withContext(Dispatchers.IO) {
                        api.injectAnomaly(app.id, mapOf("type" to "OVERCURRENT", "multiplier" to 2.5))
                    }
                    if (resp.isSuccessful) {
                        Toast.makeText(context, "Injected Overcurrent spike on ${app.name}!", Toast.LENGTH_SHORT).show()
                        dismiss()
                    }
                } catch (e: Exception) {
                    Toast.makeText(context, "Failed: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        binding.btnInjectBadPf.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                try {
                    val api = ApiClient.getService(requireContext())
                    val resp = withContext(Dispatchers.IO) {
                        api.injectAnomaly(app.id, mapOf("type" to "BAD_POWER_FACTOR", "targetPf" to 0.62))
                    }
                    if (resp.isSuccessful) {
                        Toast.makeText(context, "Simulating PF degradation on ${app.name}!", Toast.LENGTH_SHORT).show()
                        dismiss()
                    }
                } catch (e: Exception) {
                    Toast.makeText(context, "Failed: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
