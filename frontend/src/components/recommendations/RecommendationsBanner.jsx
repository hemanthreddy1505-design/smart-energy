import React from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { 
  Lightbulb, 
  ArrowRight, 
  IndianRupee, 
  Leaf, 
  TrendingDown,
  Sparkles
} from 'lucide-react';

export function RecommendationsBanner() {
  const { recommendations, toggleAppliance } = useEnergy();

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Intelligent Energy Conservation Recommendations
          </h3>
        </div>
        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
          Autonomous Heuristics Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recommendations.slice(0, 2).map((rec) => (
          <div
            key={rec.id}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-emerald-300">
                  {rec.title}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {rec.category}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {rec.message}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-3">
                {rec.estimatedSavingsRupees > 0 && (
                  <span className="text-emerald-400 font-mono font-semibold flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3" />
                    Save ~₹{rec.estimatedSavingsRupees}
                  </span>
                )}
                {rec.carbonReductionKg > 0 && (
                  <span className="text-teal-400 font-mono font-semibold flex items-center gap-0.5">
                    <Leaf className="w-3 h-3" />
                    -{rec.carbonReductionKg} kg CO₂
                  </span>
                )}
              </div>

              {rec.applianceId && (
                <button
                  onClick={() => toggleAppliance(rec.applianceId, false)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  <span>Switch Off Now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
