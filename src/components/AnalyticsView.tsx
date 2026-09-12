import React, { useState } from 'react';
import { Cpu, Zap, Trophy, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { CircuitInfo } from '../types';

interface AnalyticsViewProps {
  circuit: CircuitInfo;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ circuit }) => {
  const [selectedCorner, setSelectedCorner] = useState('hairpin');

  const cornerInsights = [
    {
      id: 'ste-devote',
      name: 'Turn 1 - Sainte Dévote',
      speedDelta: '+3.2 km/h',
      status: 'Optimal',
      brakePoint: '105m mark',
      aiTip: 'Exceptional late braking. Trail-braking maintained car rotation through the apex.',
    },
    {
      id: 'hairpin',
      name: 'Turn 6 - Grand Hotel Hairpin',
      speedDelta: '-2.4 km/h',
      status: 'Room for Improvement',
      brakePoint: '45m mark',
      aiTip: 'Apex speed was 49 km/h (target: 52 km/h). Car understeered slightly due to excessive entry steering lock.',
    },
    {
      id: 'chicane',
      name: 'Turn 10 - Nouvelle Chicane',
      speedDelta: '+1.8 km/h',
      status: 'Optimal',
      brakePoint: 'Tunnel exit 120m',
      aiTip: 'Clean transition over the kerbs. Rapid throttle pickup gained 0.12s on the run towards Tabac.',
    },
    {
      id: 'tabac',
      name: 'Turn 12 - Tabac',
      speedDelta: '-1.1 km/h',
      status: 'Marginal',
      brakePoint: 'Flat-out entry',
      aiTip: 'Slight lift detected at entry. Telemetry shows 100% full throttle is possible with C5 soft tires.',
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full bg-[#08090b] text-white p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="border-b border-white/10 pb-6">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#e10600] uppercase tracking-widest">
            <Cpu className="h-4 w-4" />
            <span>AI Performance Intelligence // {circuit.name}</span>
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white mt-1">
            Driver Lap Efficiency & Telemetry Insights
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Machine-learning telemetry analysis contrasting driver inputs against theoretical track limits.
          </p>
        </div>

        {/* 3 Metric Cards Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Theoretical Best Lap */}
          <div className="rounded-xl border border-white/15 bg-neutral-950/70 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-1">
              <span>THEORETICAL OPTIMAL LAP</span>
              <Trophy className="h-4 w-4 text-amber-400" />
            </div>
            <div className="font-telemetry text-3xl font-bold text-white mt-2">
              1:18.892
            </div>
            <div className="text-xs text-emerald-400 font-mono mt-1">
              ▼ -0.725s potential gain across S1, S2, S3
            </div>
            <div className="mt-4 text-xs text-neutral-400 border-t border-white/10 pt-3 flex justify-between">
              <span>S1: 24.102</span>
              <span>S2: 27.980</span>
              <span>S3: 26.810</span>
            </div>
          </div>

          {/* Consistency Score */}
          <div className="rounded-xl border border-white/15 bg-neutral-950/70 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-1">
              <span>DRIVER CONSISTENCY RATING</span>
              <TrendingUp className="h-4 w-4 text-[#e10600]" />
            </div>
            <div className="font-telemetry text-3xl font-bold text-white mt-2">
              98.4 <span className="text-base text-neutral-400 font-normal">/ 100</span>
            </div>
            <div className="text-xs text-neutral-300 font-mono mt-1">
              Standard lap deviation: ±0.084s over 18 push laps
            </div>
            <div className="mt-4 text-xs text-neutral-400 border-t border-white/10 pt-3 flex justify-between">
              <span>Braking accuracy: 99%</span>
              <span>Apex hit rate: 97%</span>
            </div>
          </div>

          {/* Tire Life Forecast */}
          <div className="rounded-xl border border-white/15 bg-neutral-950/70 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-1">
              <span>PIT STRATEGY & TIRE DEG</span>
              <Zap className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="font-telemetry text-3xl font-bold text-white mt-2">
              Lap 24 - 28
            </div>
            <div className="text-xs text-neutral-300 font-mono mt-1">
              Target Soft-to-Hard Pit Window (1-Stop Strategy)
            </div>
            <div className="mt-4 text-xs text-neutral-400 border-t border-white/10 pt-3 flex justify-between">
              <span>Degradation: 0.045s / lap</span>
              <span>Undercut: +1.8s power</span>
            </div>
          </div>
        </div>

        {/* AI Corner By Corner Recommendations */}
        <div className="mt-8 rounded-xl border border-white/15 bg-neutral-950/80 p-6">
          <h3 className="font-heading text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-[#e10600]" />
            <span>AI Track Engineering Recommendations</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cornerInsights.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-white/10 bg-white/5 p-4 transition hover:border-white/20"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{c.name}</span>
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded ${
                      c.status === 'Optimal'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {c.speedDelta}
                  </span>
                </div>
                <div className="text-xs text-neutral-400 font-mono mt-1">
                  Braking Point: {c.brakePoint}
                </div>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed bg-black/40 p-2 rounded border border-white/5">
                  {c.aiTip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
