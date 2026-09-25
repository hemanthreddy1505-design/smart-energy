package com.smartenergy.tracker.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.smartenergy.tracker.R
import com.smartenergy.tracker.adapter.CircuitAdapter
import com.smartenergy.tracker.databinding.FragmentHomeBinding
import com.smartenergy.tracker.network.EnergyRepository
import kotlinx.coroutines.launch
import java.util.Locale

class HomeFragment : Fragment() {
    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private lateinit var circuitAdapter: CircuitAdapter
    private lateinit var repo: EnergyRepository

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        repo = EnergyRepository.getInstance(requireContext())

        setupRecyclerView()
        setupListeners()
        observeData()
    }

    private fun setupRecyclerView() {
        circuitAdapter = CircuitAdapter(
            onCircuitClick = { appliance ->
                DeviceDetailBottomSheet.newInstance(appliance)
                    .show(parentFragmentManager, "DeviceDetailBottomSheet")
            },
            onRelayToggle = { appliance, newState ->
                repo.toggleAppliance(appliance.id, newState)
            }
        )

        binding.rvCircuits.layoutManager = LinearLayoutManager(requireContext())
        binding.rvCircuits.adapter = circuitAdapter
    }

    private fun setupListeners() {
        binding.swipeRefresh.setOnRefreshListener {
            repo.fetchInitialData()
            binding.swipeRefresh.isRefreshing = false
        }

        binding.btnMenu.setOnClickListener {
            ServerConfigDialog().show(parentFragmentManager, "ServerConfigDialog")
        }

        binding.btnBell.setOnClickListener {
            val alerts = repo.alerts.value
            if (!alerts.isNullOrEmpty()) {
                val latest = alerts.first()
                Toast.makeText(context, "Alert: ${latest.message}", Toast.LENGTH_LONG).show()
            } else {
                Toast.makeText(context, "All electrical parameters nominal. No anomalies.", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnProfile.setOnClickListener {
            val residentLabels = arrayOf(
                "Dhanush Yadav (Flat 402, Block B · ~148 kWh/mo, est. ₹1,185)",
                "Priya Sharma (Villa 12, Whitefield · ~76 kWh/mo, est. ₹611)"
            )
            val residentIds = arrayOf("usr_dhanush", "usr_priya")
            androidx.appcompat.app.AlertDialog.Builder(requireContext())
                .setTitle("Switch Resident Profile")
                .setItems(residentLabels) { _, which ->
                    repo.switchResident(residentIds[which])
                }
                .setNegativeButton("Cancel", null)
                .show()
        }

        binding.btnVivaSandbox.setOnClickListener {
            SystemLabBottomSheet().show(parentFragmentManager, "SystemLabBottomSheet")
        }

        // Navigate to full Devices screen
        binding.btnViewAllDevices.setOnClickListener {
            (activity as? MainActivity)?.navigateToTab(R.id.nav_devices)
        }

        // 4 Macro Actions
        binding.actionNightMode.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                repo.applyScene("night_mode")
            }
        }

        binding.actionEcoShift.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                repo.applyScene("eco_saver")
            }
        }

        binding.actionWorkMode.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                repo.applyScene("work_mode")
            }
        }

        binding.actionSandbox.setOnClickListener {
            SystemLabBottomSheet().show(parentFragmentManager, "SystemLabBottomSheet")
        }
    }

    private fun observeData() {
        repo.isConnected.observe(viewLifecycleOwner) { connected ->
            if (connected) {
                binding.tvOnlineBadge.text = "● ONLINE 50.0Hz"
                binding.tvOnlineBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.emerald_400))
            } else {
                binding.tvOnlineBadge.text = "● SIMULATION 50.0Hz"
                binding.tvOnlineBadge.setTextColor(ContextCompat.getColor(requireContext(), R.color.emerald_400))
            }
        }

        repo.telemetry.observe(viewLifecycleOwner) { telem ->
            // Resident Profile header updates
            telem.resident?.let { res ->
                val firstName = res.name.split(" ").firstOrNull() ?: res.name
                binding.tvGreetingTitle.text = "Hello, $firstName"
                binding.tvGreetingSubtitle.text = "${res.doorNo} · ${res.consumerId}"
                val initials = res.name.split(" ")
                    .filter { it.isNotEmpty() }
                    .take(2)
                    .map { it.first().uppercase() }
                    .joinToString("")
                if (initials.isNotEmpty()) {
                    binding.tvProfileInitials.text = initials
                }
            }

            // Current Power (W)
            binding.tvTotalPowerValue.text = String.format(Locale.US, "%,.0f", telem.totalActivePower)
            binding.tvCardBottomMetrics.text = String.format(
                Locale.US,
                "%.1f V · %.2f PF · %.1f Hz",
                telem.gridVoltage,
                telem.systemPowerFactor,
                telem.frequency
            )

            // Monthly billing inside card
            val monthly = telem.monthlyUsage
            binding.tvCardBillingSummary.text = String.format(
                Locale.US,
                "This Month: %.1f kWh · ₹%.0f est.",
                monthly.kwh,
                monthly.estimatedBill
            )

            // Monthly Energy Card
            binding.tvMonthlyKwh.text = String.format(Locale.US, "%.1f kWh", monthly.kwh)
            binding.tvMonthlyBillEst.text = String.format(Locale.US, "Estimated Bill: ₹%.0f", monthly.estimatedBill)
            binding.tvDailyAverageKwh.text = String.format(Locale.US, "%.2f kWh", monthly.dailyAverageKwh)
            val compSign = if (monthly.comparisonPct >= 0) "↑ +" else "↓ -"
            binding.tvMonthComparisonBadge.text = String.format(Locale.US, "%s%.1f%% vs last mo", compSign, Math.abs(monthly.comparisonPct))

            // Quick Status
            binding.tvQuickTotalDevices.text = "${telem.totalDevicesCount}"
            binding.tvQuickActiveDevices.text = "${telem.activeDevicesCount}"
            binding.tvQuickCurrentLoad.text = String.format(Locale.US, "%,.0f W", telem.totalActivePower)

            // Dynamic insight text
            if (telem.totalActivePower > 2500) {
                binding.tvEnergyInsightText.text = "High demand alert: Aggregate load is ${String.format(Locale.US, "%,.0f W", telem.totalActivePower)}. Running non-essential appliances during peak hours increases demand charges."
            } else {
                binding.tvEnergyInsightText.text = "Peak usage is expected between 18:00–22:00. Shifting your Water Heater & EV charging to off-peak hours could reduce your estimated monthly bill."
            }
        }

        repo.appliances.observe(viewLifecycleOwner) { list ->
            // Only show top 2-3 active devices on Home to avoid duplication with Devices screen!
            val activeDevices = list.filter { it.isOn }.take(3)
            val displayList = if (activeDevices.isNotEmpty()) activeDevices else list.take(2)
            circuitAdapter.submitList(displayList)
        }

        repo.alerts.observe(viewLifecycleOwner) { alerts ->
            val hasUnresolved = alerts.any { !it.resolved }
            binding.indicatorBellAlert.visibility = if (hasUnresolved) View.VISIBLE else View.GONE
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
