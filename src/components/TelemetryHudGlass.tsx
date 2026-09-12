import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Play, Pause, Disc } from "lucide-react";
import { CircuitInfo, SectorData } from "../types";

export interface TelemetryHudGlassProps {
  lapTime?: string;
  delta?: string | number;
  lap?: string;
  speed?: number;
  throttle?: number;
  brake?: number;
  rpm?: number;
  latG?: number;
  longG?: number;
  vertG?: number;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  progress?: number;
  onScrub?: (value: number) => void;
  circuits?: CircuitInfo[];
  selectedCircuit?: CircuitInfo;
  onSelectCircuit?: (c: CircuitInfo) => void;
  sectors?: SectorData[];
  driver1Code?: string;
  driver2Code?: string;
}

export default function TelemetryHudGlass({
  lapTime = "1:19.617",
  delta = "-0.421",
  lap = "12 / 58",
  speed = 312,
  throttle = 100,
  brake = 0,
  rpm = 11842,
  latG = 2.3,
  longG = 1.1,
  vertG = 0.4,
  isPlaying = true,
  onTogglePlay = () => {},
  progress = 0.25,
  onScrub = () => {},
  circuits = [],
  selectedCircuit,
  onSelectCircuit,
  sectors = [
    { sector: 1, time: "24.523", delta: -0.421 },
    { sector: 2, time: "28.114", delta: 0.132 },
    { sector: 3, time: "26.980", delta: -0.276 },
  ],
  driver1Code = "LEC #16",
  driver2Code = "VER #1",
}: TelemetryHudGlassProps) {
  const [circuitMenuOpen, setCircuitMenuOpen] = useState(false);

  // G-Force coordinate conversion (-3G to +3G scale mapped to 5-95%)
  const gX = Math.min(Math.max((latG / 3) * 45 + 50, 5), 95);
  const gY = Math.min(Math.max((-longG / 3) * 45 + 50, 5), 95);

  const deltaStr = typeof delta === "number" ? (delta > 0 ? `+${delta}` : `${delta}`) : delta;

  return (
    <div className="flex flex-col items-center justify-end w-full pb-8 px-4 sm:px-6 font-sans select-none pointer-events-auto">
      {/* Glass Container */}
      <div className="w-full max-w-5xl rounded-3xl bg-[#0c0e14]/80 backdrop-blur-2xl border border-white/10 p-5 sm:p-6 shadow-2xl shadow-black/90 grid grid-cols-1 md:grid-cols-12 gap-6 text-white">
        
        {/* Left: Track Overview & Lap Times */}
        <div className="md:col-span-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 pr-0 md:pr-6 pb-4 md:pb-0">
          <div>
            <div className="relative flex items-center justify-between">
              <button
                onClick={() => setCircuitMenuOpen(!circuitMenuOpen)}
                className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition"
              >
                <span>{selectedCircuit ? selectedCircuit.name : "Monaco Grand Prix"}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${circuitMenuOpen ? "rotate-180" : ""}`} />
              </button>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ef4444] animate-ping" />
                <span className="text-xs font-bold tracking-widest text-[#ef4444]">LIVE</span>
              </div>

              {/* Circuit Dropdown Menu */}
              {circuitMenuOpen && circuits.length > 0 && (
                <div className="absolute top-10 left-0 z-50 w-56 rounded-xl border border-white/15 bg-neutral-950 p-2 shadow-2xl backdrop-blur-xl">
                  {circuits.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        if (onSelectCircuit) onSelectCircuit(c);
                        setCircuitMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between ${
                        selectedCircuit?.id === c.id
                          ? "bg-[#e10600]/20 text-white font-bold"
                          : "text-neutral-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] font-mono text-neutral-500">{c.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sector Times */}
            <div className="mt-4 space-y-1.5 text-xs font-mono">
              {sectors.map((sec) => (
                <div
                  key={sec.sector}
                  className="flex justify-between items-center bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/5"
                >
                  <span className="text-neutral-400">S{sec.sector}</span>
                  <span className="font-semibold text-neutral-200">{sec.time}</span>
                  <span
                    className={`font-bold ${
                      sec.delta <= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {sec.delta <= 0 ? `${sec.delta.toFixed(3)}` : `+${sec.delta.toFixed(3)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/5">
            <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white font-telemetry">
              {lapTime}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ▼ {deltaStr}
              </span>
              <span className="text-xs font-mono text-neutral-400">Lap {lap}</span>
            </div>
          </div>
        </div>

        {/* Center: Sparkline Telemetry Channels */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-3">
          {/* Speed */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-neutral-400">SPEED</span>
              <span className="text-neutral-100 font-bold">{speed} km/h</span>
            </div>
            <div className="h-9 w-full bg-white/[0.02] border border-white/5 rounded-md relative overflow-hidden flex items-end">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 25">
                <path d="M0,20 Q25,5 50,15 T100,5" fill="none" stroke="#ef4444" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Throttle */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-neutral-400">THROTTLE</span>
              <span className="text-neutral-100 font-bold">{throttle} %</span>
            </div>
            <div className="h-8 w-full bg-white/[0.02] border border-white/5 rounded-md relative overflow-hidden flex items-end">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 25">
                <path d="M0,25 L20,5 L40,25 L60,5 L80,25 L100,5" fill="none" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Brake & RPM */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-neutral-400">BRAKE</span>
                <span className="text-neutral-100 font-bold">{brake} %</span>
              </div>
              <div className="h-6 w-full bg-white/[0.02] border border-white/5 rounded-md relative overflow-hidden">
                <div
                  className="h-full bg-red-600/70 transition-all duration-75"
                  style={{ width: `${brake}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-neutral-400">RPM</span>
                <span className="text-neutral-100 font-bold">{rpm.toLocaleString()}</span>
              </div>
              <div className="h-6 w-full bg-white/[0.02] border border-white/5 rounded-md relative overflow-hidden">
                <div
                  className="h-full bg-white/40 transition-all duration-75"
                  style={{ width: `${Math.min(100, (rpm / 13000) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Driver Nodes Legend */}
          <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-neutral-400 border-t border-white/5">
            <div className="flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
              <span className="text-neutral-300 font-semibold">{driver1Code} (P1 Lead)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#00f2fe] shadow-[0_0_8px_#00f2fe]" />
              <span className="text-neutral-300 font-semibold">{driver2Code} (Chaser)</span>
            </div>
          </div>
        </div>

        {/* Right: G-Force Friction Circle */}
        <div className="md:col-span-3 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 pl-0 md:pl-6 pt-4 md:pt-0">
          <div className="flex justify-between text-xs font-mono mb-2">
            <span className="text-neutral-400">G-FORCE</span>
            <span className="text-white font-bold">{Math.max(latG, longG).toFixed(1)} G</span>
          </div>

          {/* Friction circle radar */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-full border border-white/15 flex items-center justify-center bg-black/40">
            <div className="absolute w-24 h-24 rounded-full border border-white/10" />
            <div className="absolute w-12 h-12 rounded-full border border-white/10" />
            <div className="absolute h-full w-[1px] bg-white/10" />
            <div className="absolute w-full h-[1px] bg-white/10" />

            {/* Moving Dynamic G-Point */}
            <motion.div
              className="absolute w-3.5 h-3.5 rounded-full bg-[#ef4444] shadow-lg shadow-red-500/80 -translate-x-1/2 -translate-y-1/2"
              animate={{ left: `${gX}%`, top: `${gY}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          </div>

          {/* G-Readouts */}
          <div className="grid grid-cols-3 text-center text-xs font-mono mt-3 text-neutral-400">
            <div>Lat<br/><span className="text-white font-semibold">{latG}G</span></div>
            <div>Long<br/><span className="text-white font-semibold">{longG}G</span></div>
            <div>Vert<br/><span className="text-white font-semibold">{vertG}G</span></div>
          </div>
        </div>
      </div>

      {/* Scrubbing & Replay Controls */}
      <div className="w-full max-w-5xl mt-3 flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-xl">
        <button
          onClick={onTogglePlay}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition active:scale-95"
          title={isPlaying ? "Pause Simulation" : "Play Simulation"}
        >
          {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-[#ef4444] fill-[#ef4444]" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={(e) => onScrub(parseFloat(e.target.value))}
          className="w-full accent-[#ef4444] cursor-pointer"
        />
        <span className="text-xs font-mono text-neutral-300 min-w-[40px] text-right font-bold">
          {(progress * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
export { TelemetryHudGlass };
