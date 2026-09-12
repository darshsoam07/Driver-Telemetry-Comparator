import React, { useState } from 'react';
import { Sliders, Activity, Disc, Download, Share2, Layers, ZoomIn } from 'lucide-react';
import { CircuitInfo, DriverProfile, TelemetryDataPoint } from '../types';
import { generateLapTelemetry, DRIVERS } from '../data/racingData';

interface TelemetryViewProps {
  circuit: CircuitInfo;
  onSelectCircuit?: (c: CircuitInfo) => void;
}

export const TelemetryView: React.FC<TelemetryViewProps> = ({ circuit }) => {
  const telemetryData = generateLapTelemetry();
  const [selectedDriver, setSelectedDriver] = useState<DriverProfile>(DRIVERS[0]);
  const [compareDriver, setCompareDriver] = useState<DriverProfile>(DRIVERS[1]);
  const [scrubIndex, setScrubIndex] = useState<number>(35);
  const [activeTab, setActiveTab] = useState<'traces' | 'tires' | 'corners'>('traces');

  const currentPoint = telemetryData[scrubIndex] || telemetryData[0];

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full bg-[#08090b] text-white p-6 lg:p-10">
      {/* Top Header Bar */}
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#e10600] uppercase tracking-widest">
            <Activity className="h-4 w-4" />
            <span>Telemetry Workbench // {circuit.name}</span>
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white mt-1">
            Lap Session Telemetry & Delta Analysis
          </h2>
        </div>

        {/* Driver Selector & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5">
            <span className="text-xs text-neutral-400">Primary:</span>
            <select
              value={selectedDriver.id}
              onChange={(e) => {
                const found = DRIVERS.find((d) => d.id === e.target.value);
                if (found) setSelectedDriver(found);
              }}
              className="bg-transparent text-xs font-bold text-white focus:outline-none"
            >
              {DRIVERS.map((d) => (
                <option key={d.id} value={d.id} className="bg-neutral-900 text-white">
                  #{d.number} {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5">
            <span className="text-xs text-neutral-400">Compare vs:</span>
            <select
              value={compareDriver.id}
              onChange={(e) => {
                const found = DRIVERS.find((d) => d.id === e.target.value);
                if (found) setCompareDriver(found);
              }}
              className="bg-transparent text-xs font-bold text-white focus:outline-none"
            >
              {DRIVERS.map((d) => (
                <option key={d.id} value={d.id} className="bg-neutral-900 text-white">
                  #{d.number} {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => alert('Exporting MoTeC / CSV telemetry package...')}
            className="flex items-center space-x-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/10 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Scrubbing Inspector & Primary Metrics */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Cursor Inspector Card */}
          <div className="rounded-xl border border-white/15 bg-neutral-950/70 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-mono text-xs text-neutral-400">TRACK POSITION</span>
              <span className="font-telemetry text-lg font-bold text-[#e10600]">
                {currentPoint.distance} m / {circuit.lengthKm * 1000} m
              </span>
            </div>

            {/* Scrubber slider */}
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-neutral-400 font-mono mb-1">
                <span>Start / Line</span>
                <span>Portier</span>
                <span>Finish</span>
              </div>
              <input
                type="range"
                min="0"
                max={telemetryData.length - 1}
                value={scrubIndex}
                onChange={(e) => setScrubIndex(Number(e.target.value))}
                className="w-full accent-[#e10600] cursor-pointer"
              />
            </div>

            {/* Instantaneous Vehicle Telemetry Readouts */}
            <div className="mt-5 grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                <span className="text-neutral-400 text-[10px]">SPEED</span>
                <div className="text-xl font-telemetry font-bold text-white mt-0.5">
                  {currentPoint.speed} <span className="text-xs text-neutral-400 font-normal">km/h</span>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                <span className="text-neutral-400 text-[10px]">CURRENT GEAR</span>
                <div className="text-xl font-telemetry font-bold text-white mt-0.5">
                  G{currentPoint.gear}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                <span className="text-neutral-400 text-[10px]">ENGINE RPM</span>
                <div className="text-xl font-telemetry font-bold text-neutral-200 mt-0.5">
                  {currentPoint.rpm.toLocaleString()}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                <span className="text-neutral-400 text-[10px]">LATERAL G</span>
                <div className="text-xl font-telemetry font-bold text-[#e10600] mt-0.5">
                  {currentPoint.gForceLat} G
                </div>
              </div>
            </div>

            {/* Throttle & Brake Bars */}
            <div className="mt-4 space-y-2">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-neutral-300 mb-1">
                  <span>THROTTLE</span>
                  <span className="font-bold text-white">{currentPoint.throttle}%</span>
                </div>
                <div className="h-2 w-full rounded bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-75"
                    style={{ width: `${currentPoint.throttle}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-neutral-300 mb-1">
                  <span>BRAKE PRESSURE</span>
                  <span className="font-bold text-red-500">{currentPoint.brake}%</span>
                </div>
                <div className="h-2 w-full rounded bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#e10600] transition-all duration-75"
                    style={{ width: `${currentPoint.brake}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4-Wheel Tire Health & Temperatures */}
          <div className="rounded-xl border border-white/15 bg-neutral-950/70 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="font-mono text-xs text-neutral-400">TIRE THERMAL MATRIX</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                P-ZERO SOFT C5
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded border border-white/10 bg-white/5 p-2 text-center">
                <div className="text-[10px] text-neutral-400 font-mono">FRONT LEFT</div>
                <div className="font-telemetry text-lg font-bold text-emerald-400">102.4 °C</div>
                <div className="text-[10px] text-neutral-500 font-mono">Wear: 18% | 22.8 PSI</div>
              </div>
              <div className="rounded border border-white/10 bg-white/5 p-2 text-center">
                <div className="text-[10px] text-neutral-400 font-mono">FRONT RIGHT</div>
                <div className="font-telemetry text-lg font-bold text-amber-400">106.8 °C</div>
                <div className="text-[10px] text-neutral-500 font-mono">Wear: 22% | 23.2 PSI</div>
              </div>
              <div className="rounded border border-white/10 bg-white/5 p-2 text-center">
                <div className="text-[10px] text-neutral-400 font-mono">REAR LEFT</div>
                <div className="font-telemetry text-lg font-bold text-emerald-400">99.1 °C</div>
                <div className="text-[10px] text-neutral-500 font-mono">Wear: 15% | 21.4 PSI</div>
              </div>
              <div className="rounded border border-white/10 bg-white/5 p-2 text-center">
                <div className="text-[10px] text-neutral-400 font-mono">REAR RIGHT</div>
                <div className="font-telemetry text-lg font-bold text-emerald-400">101.5 °C</div>
                <div className="text-[10px] text-neutral-500 font-mono">Wear: 19% | 21.6 PSI</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: High-Resolution Telemetry Waveform Stack */}
        <div className="lg:col-span-8 space-y-4">
          {/* Telemetry Trace Navigation */}
          <div className="flex items-center justify-between rounded-xl border border-white/15 bg-neutral-950/70 p-3">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-[#e10600]" />
              <span className="text-xs font-semibold text-white">Multi-Channel Telemetry Stream</span>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-4 bg-[#e10600] rounded-sm" />
                <span className="text-neutral-300">#{selectedDriver.number} {selectedDriver.code}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-4 bg-sky-400 rounded-sm" />
                <span className="text-neutral-300">#{compareDriver.number} {compareDriver.code}</span>
              </div>
            </div>
          </div>

          {/* 1. SPEED TRACE OVERLAY */}
          <div className="rounded-xl border border-white/15 bg-neutral-950/80 p-4">
            <div className="flex justify-between text-xs font-mono text-neutral-400 mb-2">
              <span className="font-bold text-white">SPEED OVER DISTANCE (0 - 3337 m)</span>
              <span>Top Speed: 298 km/h</span>
            </div>
            <div className="relative h-44 w-full bg-black/60 rounded border border-white/5 overflow-hidden">
              <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 3337 140">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="35" x2="3337" y2="35" stroke="rgba(255,255,255,0.08)" strokeDasharray="5 5" />
                <line x1="0" y1="70" x2="3337" y2="70" stroke="rgba(255,255,255,0.08)" strokeDasharray="5 5" />
                <line x1="0" y1="105" x2="3337" y2="105" stroke="rgba(255,255,255,0.08)" strokeDasharray="5 5" />

                {/* Primary Driver Line (Red) */}
                <path
                  d={`M ${telemetryData.map((p) => `${p.distance},${130 - (p.speed / 320) * 120}`).join(' L ')}`}
                  fill="none"
                  stroke="#e10600"
                  strokeWidth="2.5"
                />

                {/* Compare Driver Line (Sky Blue with subtle delta offset) */}
                <path
                  d={`M ${telemetryData.map((p, idx) => `${p.distance},${130 - ((p.speed + (idx % 7 - 3) * 3) / 320) * 120}`).join(' L ')}`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  opacity="0.75"
                />

                {/* Scrubber vertical needle indicator */}
                <line
                  x1={currentPoint.distance}
                  y1="0"
                  x2={currentPoint.distance}
                  y2="140"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>

          {/* 2. THROTTLE & BRAKE OVERLAY */}
          <div className="rounded-xl border border-white/15 bg-neutral-950/80 p-4">
            <div className="flex justify-between text-xs font-mono text-neutral-400 mb-2">
              <span className="font-bold text-white">PEDAL TELEMETRY (THROTTLE / BRAKE)</span>
              <span>Full Throttle: 62% of lap</span>
            </div>
            <div className="relative h-36 w-full bg-black/60 rounded border border-white/5 overflow-hidden">
              <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 3337 100">
                {/* Throttle (Green) */}
                <path
                  d={`M ${telemetryData.map((p) => `${p.distance},${90 - (p.throttle / 100) * 80}`).join(' L ')}`}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                />
                {/* Brake (Red) */}
                <path
                  d={`M ${telemetryData.map((p) => `${p.distance},${90 - (p.brake / 100) * 80}`).join(' L ')}`}
                  fill="none"
                  stroke="#e10600"
                  strokeWidth="2"
                />
                <line
                  x1={currentPoint.distance}
                  y1="0"
                  x2={currentPoint.distance}
                  y2="100"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>

          {/* 3. TIME DELTA (+/- SECONDS) */}
          <div className="rounded-xl border border-white/15 bg-neutral-950/80 p-4">
            <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1">
              <span className="font-bold text-white">DELTA vs COMPARISON LAP</span>
              <span className="text-emerald-400 font-bold">-0.132s Ahead</span>
            </div>
            <div className="relative h-16 w-full bg-black/60 rounded border border-white/5 overflow-hidden">
              <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 3337 60">
                <line x1="0" y1="30" x2="3337" y2="30" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <path
                  d="M 0 30 C 500 25, 1200 18, 1800 22 C 2400 35, 2900 20, 3337 15"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
                <line
                  x1={currentPoint.distance}
                  y1="0"
                  x2={currentPoint.distance}
                  y2="60"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
