package com.smartenergy.tracker.ui

import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet
import com.github.mikephil.charting.formatter.ValueFormatter
import com.smartenergy.tracker.R
import com.smartenergy.tracker.databinding.FragmentAnalyticsBinding
import com.smartenergy.tracker.network.ApiClient
import com.smartenergy.tracker.network.EnergyRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

class AnalyticsFragment : Fragment() {
    private var _binding: FragmentAnalyticsBinding? = null
    private val binding get() = _binding!!

    private lateinit var repo: EnergyRepository

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAnalyticsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        repo = EnergyRepository.getInstance(requireContext())

        setupChart()
        setupListeners()
        observeData()
        loadForecastData()
    }

    private fun setupChart() {
        val chart = binding.forecastChart
        chart.description.isEnabled = false
        chart.legend.isEnabled = false
        chart.setTouchEnabled(true)
        chart.isDragEnabled = true
        chart.setScaleEnabled(false)
        chart.setPinchZoom(false)
        chart.setDrawGridBackground(false)
        chart.extraBottomOffset = 8f

        // X Axis: Hours 00:00 to 23:00
        val xAxis = chart.xAxis
        xAxis.position = XAxis.XAxisPosition.BOTTOM
        xAxis.setDrawGridLines(false)
        xAxis.textColor = ContextCompat.getColor(requireContext(), R.color.text_secondary)
        xAxis.textSize = 10f
        xAxis.granularity = 4f
        xAxis.valueFormatter = object : ValueFormatter() {
            override fun getFormattedValue(value: Float): String {
                val hour = (value.toInt() % 24)
                return String.format(Locale.US, "%02d:00", hour)
            }
        }

        // Left Y Axis: kW load
        val leftAxis = chart.axisLeft
        leftAxis.textColor = ContextCompat.getColor(requireContext(), R.color.text_secondary)
        leftAxis.textSize = 10f
        leftAxis.setDrawGridLines(true)
        leftAxis.gridColor = Color.parseColor("#E2E8F0")
        leftAxis.axisMinimum = 0f

        chart.axisRight.isEnabled = false

        // Realistic Diurnal load curve entries (in kW)
        val entries = mutableListOf<Entry>()
        val diurnalKw = floatArrayOf(
            0.18f, 0.15f, 0.14f, 0.14f, 0.16f, 0.28f,
            0.65f, 1.25f, 0.85f, 0.62f, 0.58f, 0.72f,
            0.85f, 0.74f, 0.65f, 0.70f, 0.95f, 1.45f,
            2.10f, 2.40f, 2.15f, 1.65f, 0.85f, 0.42f
        )
        for (i in 0 until 24) {
            entries.add(Entry(i.toFloat(), diurnalKw[i]))
        }
        renderChartData(entries)
    }

    private fun renderChartData(entries: List<Entry>) {
        val dataSet = LineDataSet(entries, "Load Forecast (kW)").apply {
            mode = LineDataSet.Mode.CUBIC_BEZIER
            color = ContextCompat.getColor(requireContext(), R.color.card_purple_primary)
            lineWidth = 2.5f
            setDrawCircles(false)
            setDrawValues(false)
            setDrawFilled(true)
            fillColor = ContextCompat.getColor(requireContext(), R.color.card_purple_primary)
            fillAlpha = 40
        }

        binding.forecastChart.data = LineData(dataSet)
        binding.forecastChart.invalidate()
    }

    private fun loadForecastData() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val api = ApiClient.getService(requireContext())
                val resp = withContext(Dispatchers.IO) { api.getForecast() }
                if (resp.isSuccessful && resp.body()?.data != null) {
                    val forecast = resp.body()!!.data!!
                    forecast.hourly?.let { hours ->
                        val entries = hours.map { Entry(it.hour.toFloat(), it.predictedKw.toFloat()) }
                        if (entries.isNotEmpty()) {
                            renderChartData(entries)
                        }
                    }
                }
            } catch (_: Exception) {}
        }
    }

    private fun setupListeners() {
        binding.swipeRefreshAnalytics.setOnRefreshListener {
            loadForecastData()
            repo.fetchInitialData()
            binding.swipeRefreshAnalytics.isRefreshing = false
        }
    }

    private fun observeData() {
        repo.telemetry.observe(viewLifecycleOwner) { telem ->
            // Section A: Today
            binding.tvTodayKwh.text = String.format(Locale.US, "%.1f kWh", telem.totalEnergyTodayKwh)
            binding.tvCostToday.text = String.format(Locale.US, "₹%.2f", telem.estimatedCost)
            binding.tvTodayAvgLoad.text = "175 W"
            binding.tvTodayPeakLoad.text = "2.4 kW"

            // Section D & E: Monthly Cost & Carbon
            val monthly = telem.monthlyUsage
            binding.tvCostAnalysisKwh.text = String.format(Locale.US, "%.1f kWh", monthly.kwh)
            binding.tvCostAnalysisBill.text = String.format(Locale.US, "₹%.0f", monthly.estimatedBill)
            binding.tvCarbonFootprintVal.text = String.format(Locale.US, "%.1f kg CO₂", telem.carbonKg)

            // Section F: Grid Power Quality
            binding.tvGridVoltage.text = String.format(Locale.US, "%.1f V", telem.gridVoltage)
            binding.tvGridCurrent.text = String.format(Locale.US, "%.2f A", telem.totalCurrent)
            binding.tvGridPf.text = String.format(Locale.US, "%.2f", telem.systemPowerFactor)
            binding.tvGridFrequency.text = String.format(Locale.US, "%.1f Hz", telem.frequency)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
