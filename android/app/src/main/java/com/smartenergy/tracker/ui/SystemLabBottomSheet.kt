package com.smartenergy.tracker.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.smartenergy.tracker.databinding.BottomSheetSystemLabBinding
import com.smartenergy.tracker.network.EnergyRepository
import com.smartenergy.tracker.network.PreferencesManager
import kotlinx.coroutines.launch

class SystemLabBottomSheet : BottomSheetDialogFragment() {
    private var _binding: BottomSheetSystemLabBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = BottomSheetSystemLabBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val prefs = PreferencesManager.getInstance(requireContext())
        binding.tvLabServerUrl.text = "Target: ${prefs.baseUrl}"

        val repo = EnergyRepository.getInstance(requireContext())

        binding.btnScenarioOverload.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                val ok = repo.triggerScenario("overload")
                if (ok) {
                    Toast.makeText(context, "⚠️ Overload scenario triggered! Automatic shedding active.", Toast.LENGTH_LONG).show()
                    dismiss()
                } else {
                    Toast.makeText(context, "Failed to reach simulation engine", Toast.LENGTH_SHORT).show()
                }
            }
        }

        binding.btnScenarioBrownout.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                val ok = repo.triggerScenario("brownout")
                if (ok) {
                    Toast.makeText(context, "⚡ Voltage sag (185V) injected! Testing undervoltage protection.", Toast.LENGTH_LONG).show()
                    dismiss()
                } else {
                    Toast.makeText(context, "Failed to reach simulation engine", Toast.LENGTH_SHORT).show()
                }
            }
        }

        binding.btnScenarioReset.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                val ok = repo.resetSimulation()
                if (ok) {
                    Toast.makeText(context, "✅ Baseline grid state restored!", Toast.LENGTH_SHORT).show()
                    dismiss()
                } else {
                    Toast.makeText(context, "Failed to reach simulation engine", Toast.LENGTH_SHORT).show()
                }
            }
        }

        binding.btnConfigureIp.setOnClickListener {
            dismiss()
            ServerConfigDialog().show(parentFragmentManager, "ServerConfigDialog")
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
