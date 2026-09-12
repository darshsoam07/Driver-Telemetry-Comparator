import React, { useState } from 'react';
import { Users, Trophy, Download, Share2, Filter, ExternalLink, Flag } from 'lucide-react';
import { CircuitInfo } from '../types';

interface CommunityViewProps {
  circuit: CircuitInfo;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ circuit }) => {
  const [filterClass, setFilterClass] = useState('all');

  const leaderboard = [
    { rank: 1, driver: 'Charles Leclerc', car: 'Ferrari SF-24', time: '1:10.270', delta: '+0.000', telemetry: true, setup: 'High-Downforce Monaco V3' },
    { rank: 2, driver: 'Max Verstappen', car: 'Red Bull RB20', time: '1:10.424', delta: '+0.154', telemetry: true, setup: 'Aggressive Rake Setup' },
    { rank: 3, driver: 'Lando Norris', car: 'McLaren MCL38', time: '1:10.512', delta: '+0.242', telemetry: true, setup: 'Balanced Wing 38/42' },
    { rank: 4, driver: 'Oscar Piastri', car: 'McLaren MCL38', time: '1:10.689', delta: '+0.419', telemetry: true, setup: 'Balanced Wing 38/42' },
    { rank: 5, driver: 'Carlos Sainz', car: 'Ferrari SF-24', time: '1:10.742', delta: '+0.472', telemetry: true, setup: 'High-Downforce Monaco V3' },
    { rank: 6, driver: 'Lewis Hamilton', car: 'Mercedes W15', time: '1:10.890', delta: '+0.620', telemetry: true, setup: 'Stiff Roll-Bar Monaco' },
    { rank: 7, driver: 'George Russell', car: 'Mercedes W15', time: '1:10.955', delta: '+0.685', telemetry: true, setup: 'Stiff Roll-Bar Monaco' },
  ];

  const communitySetups = [
    {
      name: 'Monaco Qualifying Pure Downforce',
      author: 'ApexEngineer_F1',
      downloads: 1420,
      rating: '4.9 ★',
      wings: 'Front 38° / Rear 44°',
      diff: '52% On-Throttle',
      bb: '54.5% Front',
    },
    {
      name: 'Monaco Wet Weather Transition',
      author: 'RainMaster_BE',
      downloads: 890,
      rating: '4.8 ★',
      wings: 'Front 41° / Rear 46°',
      diff: '48% Soft Lock',
      bb: '56.0% Front',
    },
    {
      name: 'Tyre Whisperer 1-Stop Race Setup',
      author: 'TelemetricsUK',
      downloads: 2150,
      rating: '5.0 ★',
      wings: 'Front 36° / Rear 42°',
      diff: '55% Stable',
      bb: '55.0% Front',
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full bg-[#08090b] text-white p-6 lg:p-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#e10600] uppercase tracking-widest">
              <Users className="h-4 w-4" />
              <span>COMMUNITY PITWALL // GLOBAL BENCHMARKS</span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white mt-1">
              {circuit.name} Leaderboard & Setups
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => alert('Telemetry upload wizard opened')}
              className="rounded-md bg-[#e10600] px-4 py-2 text-xs font-bold text-white hover:bg-[#c20500] transition"
            >
              Share My Telemetry
            </button>
          </div>
        </div>

        {/* 2 Column Layout: Leaderboard & Community Setups */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Leaderboard Table */}
          <div className="lg:col-span-8 rounded-xl border border-white/15 bg-neutral-950/80 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                <h3 className="font-heading text-base font-bold text-white">
                  Verified Hotlap Leaderboard
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-400">Circuit Record: 1:12.909</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 text-[10px]">
                    <th className="pb-3 font-semibold">POS</th>
                    <th className="pb-3 font-semibold">DRIVER</th>
                    <th className="pb-3 font-semibold">CAR</th>
                    <th className="pb-3 font-semibold">LAP TIME</th>
                    <th className="pb-3 font-semibold">GAP</th>
                    <th className="pb-3 font-semibold text-right">TELEMETRY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboard.map((row) => (
                    <tr key={row.rank} className="hover:bg-white/5 transition">
                      <td className="py-3 font-bold text-neutral-300">
                        {row.rank === 1 ? (
                          <span className="text-amber-400 font-extrabold">#1</span>
                        ) : (
                          `#${row.rank}`
                        )}
                      </td>
                      <td className="py-3 font-sans font-medium text-white">{row.driver}</td>
                      <td className="py-3 text-neutral-400 text-[11px]">{row.car}</td>
                      <td className="py-3 font-bold text-white font-telemetry text-sm">{row.time}</td>
                      <td className={`py-3 ${row.rank === 1 ? 'text-emerald-400' : 'text-neutral-400'}`}>
                        {row.delta}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => alert(`Comparing telemetry against ${row.driver}...`)}
                          className="inline-flex items-center space-x-1 rounded bg-white/5 px-2.5 py-1 text-[11px] text-[#e10600] hover:bg-white/10 transition"
                        >
                          <Download className="h-3 w-3" />
                          <span>Compare</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Setup Sharing Hub */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-xl border border-white/15 bg-neutral-950/80 p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <h3 className="font-heading text-sm font-bold text-white">Community Setups</h3>
                <span className="text-[10px] font-mono text-neutral-400">F1 24 / Sim Compatible</span>
              </div>

              <div className="space-y-3">
                {communitySetups.map((s, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-white/10 bg-white/5 p-3 hover:border-[#e10600]/40 transition"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-xs text-white leading-snug">{s.name}</h4>
                      <span className="text-[10px] font-mono text-amber-400">{s.rating}</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      by {s.author} • {s.downloads} downloads
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-1 text-[10px] font-mono bg-black/40 p-2 rounded border border-white/5">
                      <div className="text-neutral-300">Aero: {s.wings}</div>
                      <div className="text-neutral-300">Diff: {s.diff}</div>
                      <div className="text-neutral-300 col-span-2">Brake Bias: {s.bb}</div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <button
                        onClick={() => alert(`Setup "${s.name}" loaded!`)}
                        className="w-full rounded bg-[#e10600]/20 text-[#e10600] border border-[#e10600]/40 py-1.5 text-xs font-semibold hover:bg-[#e10600] hover:text-white transition"
                      >
                        Load to Telemetry
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
