import React, { useState } from 'react';
import { useVirtualLab } from '../../../context/VirtualLabContext';
import {
  Zap,
  Cpu,
  Server,
  Snowflake,
  Refrigerator,
  Monitor,
  Tv,
  Disc,
  Flame,
  Lightbulb,
  Wind,
  Plus,
  Layers,
  Radio,
  Sliders
} from 'lucide-react';

const PRESET_APPLIANCES = [
  { name: '1.5T Inverter AC', ratedPower: 1500, category: 'HVAC', icon: Snowflake },
  { name: 'Double Door Refrigerator', ratedPower: 180, category: 'Kitchen', icon: Refrigerator },
  { name: 'Workstation Rig', ratedPower: 220, category: 'Electronics', icon: Monitor },
  { name: '55-inch OLED TV', ratedPower: 130, category: 'Entertainment', icon: Tv },
  { name: 'Front Load Washing Machine', ratedPower: 700, category: 'Appliance', icon: Disc },
  { name: 'Storage Water Geyser', ratedPower: 2000, category: 'Heating', icon: Flame },
  { name: 'Smart BLDC Fan', ratedPower: 65, category: 'HVAC', icon: Wind },
  { name: 'LED Ceiling Array', ratedPower: 18, category: 'Lighting', icon: Lightbulb },
];

export function ComponentLibraryPanel() {
  const { addAppliance, rooms, circuits } = useVirtualLab();
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'HVAC', 'Kitchen', 'Electronics', 'Heating', 'Lighting'];

  const filteredPresets = selectedCategory === 'ALL'
    ? PRESET_APPLIANCES
    : PRESET_APPLIANCES.filter(p => p.category === selectedCategory);

  return (
    <div className="w-72 bg-white/90 backdrop-blur-md rounded-[20px] p-4 border border-white/80 shadow-card flex flex-col justify-between shrink-0 h-full overflow-hidden">
      <div className="overflow-y-auto pr-1 space-y-4">
        
        {/* Header */}
        <div>
          <h3 className="font-bold text-xs text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#00A86B]" />
            Component Library
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">Click any device to instantiate in the virtual lab</p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#00A86B] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Power Sources & Infrastructure */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
            Electrical Sources
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="truncate">
                <span className="font-bold text-neutral-900 block truncate text-[11px]">230V Grid</span>
                <span className="text-[9px] text-neutral-400">50 Hz AC</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/70 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#00A86B] shrink-0" />
              <div className="truncate">
                <span className="font-bold text-neutral-900 block truncate text-[11px]">10 kVA Xfrm</span>
                <span className="text-[9px] text-neutral-400">Step-Down</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preset Appliances List */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
            Smart Virtual Appliances
          </span>
          <div className="space-y-1.5">
            {filteredPresets.map((preset, idx) => {
              const Icon = preset.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    addAppliance({
                      name: preset.name,
                      ratedPower: preset.ratedPower,
                      category: preset.category,
                      roomId: rooms[0]?.id || 'RM_LIVING',
                      circuitId: circuits[0]?.id || 'C1'
                    });
                  }}
                  className="w-full p-2.5 rounded-xl bg-neutral-50/80 hover:bg-[#E8F8F0] border border-neutral-200/60 hover:border-[#00A86B]/30 flex items-center justify-between text-left text-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-700 group-hover:text-[#00A86B] shrink-0 shadow-xs">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-neutral-900 block truncate leading-tight text-[11px] group-hover:text-[#00A86B]">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {preset.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-1">
                    <span className="font-mono font-bold text-neutral-800 text-[10px]">
                      {preset.ratedPower}W
                    </span>
                    <Plus className="w-3.5 h-3.5 text-[#00A86B] group-hover:scale-125 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer Tip */}
      <div className="pt-3 border-t border-neutral-100 text-[10px] text-neutral-400 font-mono text-center">
        <span>⚡ Ready for 3D Drag & Topology Wiring</span>
      </div>
    </div>
  );
}
