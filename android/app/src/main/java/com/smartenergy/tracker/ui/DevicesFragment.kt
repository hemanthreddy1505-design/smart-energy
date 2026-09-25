package com.smartenergy.tracker.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.smartenergy.tracker.adapter.CircuitAdapter
import com.smartenergy.tracker.databinding.FragmentDevicesBinding
import com.smartenergy.tracker.network.EnergyRepository
import java.util.Locale

class DevicesFragment : Fragment() {
    private var _binding: FragmentDevicesBinding? = null
    private val binding get() = _binding!!

    private lateinit var circuitAdapter: CircuitAdapter
    private lateinit var repo: EnergyRepository

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDevicesBinding.inflate(inflater, container, false)
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

        binding.rvDeviceList.layoutManager = LinearLayoutManager(requireContext())
        binding.rvDeviceList.adapter = circuitAdapter
    }

    private fun setupListeners() {
        binding.swipeRefreshDevices.setOnRefreshListener {
            repo.fetchInitialData()
            binding.swipeRefreshDevices.isRefreshing = false
        }
    }

    private fun observeData() {
        repo.appliances.observe(viewLifecycleOwner) { list ->
            circuitAdapter.submitList(list)
            binding.tvStatTotalDevices.text = "${list.size}"
            val active = list.count { it.isOn }
            binding.tvStatActiveDevices.text = "$active"

            val totalW = list.filter { it.isOn }.sumOf { it.reading?.activePower ?: it.ratedPower }
            binding.tvStatTotalWatts.text = String.format(Locale.US, "%,.0f W", totalW)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
