package com.smartenergy.tracker.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.smartenergy.tracker.R
import com.smartenergy.tracker.databinding.ItemCircuitCardBinding
import com.smartenergy.tracker.model.Appliance
import java.util.Locale

class CircuitAdapter(
    private val onCircuitClick: (Appliance) -> Unit,
    private val onRelayToggle: (Appliance, Boolean) -> Unit
) : ListAdapter<Appliance, CircuitAdapter.CircuitViewHolder>(ApplianceDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CircuitViewHolder {
        val binding = ItemCircuitCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return CircuitViewHolder(binding)
    }

    override fun onBindViewHolder(holder: CircuitViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class CircuitViewHolder(private val binding: ItemCircuitCardBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(appliance: Appliance) {
            val ctx = itemView.context
            binding.tvCircuitName.text = appliance.name
            binding.tvCircuitLocation.text = "${appliance.location ?: "General"}"

            val activeWatts = if (appliance.isOn) {
                appliance.reading?.activePower?.takeIf { it > 0 } ?: appliance.ratedPower
            } else 0.0

            val currentAmps = if (appliance.isOn) {
                appliance.reading?.current?.takeIf { it > 0 } ?: (activeWatts / (229.4 * appliance.powerFactor))
            } else 0.0

            val pf = if (appliance.isOn) appliance.powerFactor else 1.0

            if (appliance.isOn) {
                binding.tvCircuitStatusBadge.text = "ONLINE"
                binding.tvCircuitStatusBadge.setTextColor(ContextCompat.getColor(ctx, R.color.emerald_500))
                binding.tvCircuitMetrics.text = String.format(
                    Locale.US,
                    "%,.0f W · %.2f A · PF %.2f",
                    activeWatts,
                    currentAmps,
                    pf
                )
                binding.tvCircuitMetrics.setTextColor(ContextCompat.getColor(ctx, R.color.card_purple_primary))
            } else {
                binding.tvCircuitStatusBadge.text = "STANDBY"
                binding.tvCircuitStatusBadge.setTextColor(ContextCompat.getColor(ctx, R.color.text_secondary))
                binding.tvCircuitMetrics.text = "0 W · STANDBY"
                binding.tvCircuitMetrics.setTextColor(ContextCompat.getColor(ctx, R.color.text_secondary))
            }

            // Consistent Icon Mapping
            val nameLower = appliance.name.lowercase(Locale.US)
            val iconType = appliance.icon?.lowercase(Locale.US) ?: ""
            when {
                iconType == "pc" || nameLower.contains("pc") || nameLower.contains("workstation") || nameLower.contains("computer") ->
                    binding.ivCircuitIcon.setImageResource(R.drawable.ic_pc)
                iconType == "fridge" || nameLower.contains("fridge") || nameLower.contains("refrigerator") ->
                    binding.ivCircuitIcon.setImageResource(R.drawable.ic_fridge)
                iconType == "bulb" || nameLower.contains("light") || nameLower.contains("lamp") ->
                    binding.ivCircuitIcon.setImageResource(R.drawable.ic_bulb)
                iconType == "tv" || nameLower.contains("tv") || nameLower.contains("oled") ->
                    binding.ivCircuitIcon.setImageResource(R.drawable.ic_tv)
                iconType == "ac" || nameLower.contains("ac") || nameLower.contains("air") ->
                    binding.ivCircuitIcon.setImageResource(R.drawable.ic_ac)
                iconType == "heater" || nameLower.contains("heater") || nameLower.contains("geyser") ->
                    binding.ivCircuitIcon.setImageResource(R.drawable.ic_heater)
                iconType == "ev" || nameLower.contains("ev") || nameLower.contains("charger") ->
                    binding.ivCircuitIcon.setImageResource(R.drawable.ic_ev)
                iconType == "microwave" || nameLower.contains("microwave") || nameLower.contains("oven") ->
                    binding.ivCircuitIcon.setImageResource(R.drawable.ic_microwave)
                else ->
                    binding.ivCircuitIcon.setImageResource(R.drawable.ic_bolt)
            }

            // Anomaly indicator
            binding.indicatorAnomaly.visibility = if (appliance.isAnomaly) View.VISIBLE else View.GONE

            // Suppress callback during programmatic setChecked
            binding.switchCircuit.setOnCheckedChangeListener(null)
            binding.switchCircuit.isChecked = appliance.isOn
            binding.switchCircuit.setOnCheckedChangeListener { _, isChecked ->
                onRelayToggle(appliance, isChecked)
            }

            binding.cardCircuitRoot.setOnClickListener {
                onCircuitClick(appliance)
            }
        }
    }

    class ApplianceDiffCallback : DiffUtil.ItemCallback<Appliance>() {
        override fun areItemsTheSame(oldItem: Appliance, newItem: Appliance): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Appliance, newItem: Appliance): Boolean {
            return oldItem.isOn == newItem.isOn &&
                    oldItem.isAnomaly == newItem.isAnomaly &&
                    oldItem.reading?.activePower == newItem.reading?.activePower &&
                    oldItem.reading?.current == newItem.reading?.current
        }
    }
}
