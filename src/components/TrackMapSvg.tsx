import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CircuitInfo, SectorData } from '../types';

interface TrackMapSvgProps {
  circuits: CircuitInfo[];
  selectedCircuit: CircuitInfo;
  onSelectCircuit: (c: CircuitInfo) => void;
  sectors: SectorData[];
  lapTime: string;
  lapDelta: number;
  currentLap: number;
  totalLaps: number;
  lapProgress: number; // 0 to 1
  isLive: boolean;
  onToggleLive?: () => void;
}

export const TrackMapSvg: React.FC<TrackMapSvgProps> = ({
  circuits,
  selectedCircuit,
  onSelectCircuit,
  sectors,
  lapTime,
  lapDelta,
  currentLap,
  totalLaps,
  lapProgress,
  isLive,
  onToggleLive,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const [carPos, setCarPos] = useState({ x: 145, y: 285 });

  useEffect(() => {
    if (pathRef.current) {
      try {
        const length = pathRef.current.getTotalLength();
        const point = pathRef.current.getPointAtLength(lapProgress * length);
        setCarPos({ x: point.x, y: point.y });
      } catch {
        // fallback
      }
    }
  }, [lapProgress, selectedCircuit]);

  return (
    <div className="flex flex-col justify-between h-full p-4 md:p-5 border-b md:border-b-0 md:border-r border-white/10 relative">
      {/* Top Bar: Circuit Selector & LIVE Indicator */}
      <div className="flex items-center justify-between gap-2 mb-2 relative z-20">
        <div className="relative">
          <button
            id="circuit-selector-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-1.5 rounded border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            <span>{selectedCircuit.name}</span>
            <ChevronDown className="h-3 w-3 text-neutral-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1 w-48 rounded-md border border-white/20 bg-[#0d1117] py-1 shadow-2xl backdrop-blur-xl z-50">
              {circuits.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCircuit(c);
                    setDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-1.5 text-xs text-left transition ${
                    selectedCircuit.id === c.id
                      ? 'bg-[#e10600]/20 text-[#e10600] font-semibold'
                      : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] text-neutral-500">{c.lengthKm} km</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LIVE badge button */}
        <button
          onClick={onToggleLive}
          title="Click to toggle live telemetry feed"
          className="flex items-center space-x-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-red-400 transition hover:bg-red-500/20"
        >
          <span className={`h-2 w-2 rounded-full bg-[#e10600] ${isLive ? 'animate-ping' : ''}`} />
          <span>{isLive ? 'LIVE' : 'PAUSED'}</span>
        </button>
      </div>

      {/* Center: Track Map Graphic with Animated Racecar Position */}
      <div className="relative flex-1 flex items-center justify-center my-1 min-h-[150px]">
        <svg
          viewBox={selectedCircuit.viewBox}
          className="w-full h-full max-h-[175px] filter drop-shadow-[0_0_12px_rgba(225,6,0,0.25)]"
        >
          <defs>
            <linearGradient id="trackGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e10600" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#e10600" stopOpacity="0.7" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Track background outline shadow */}
          <path
            d={selectedCircuit.svgPath}
            fill="none"
            stroke="#1a202c"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Track base wireframe */}
          <path
            ref={pathRef}
            d={selectedCircuit.svgPath}
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Glowing Sector Segment */}
          <path
            d={selectedCircuit.svgPath}
            fill="none"
            stroke="#e10600"
            strokeWidth="3.5"
            strokeDasharray="90 320"
            strokeDashoffset={-lapProgress * 400}
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Live Racing Car Marker (Glowing Dot) */}
          <circle
            cx={carPos.x}
            cy={carPos.y}
            r="6"
            fill="#e10600"
            className="animate-pulse"
            filter="url(#glow)"
          />
          <circle
            cx={carPos.x}
            cy={carPos.y}
            r="2.5"
            fill="#ffffff"
          />

          {/* Start/Finish Line Checker */}
          <line
            x1="140"
            y1="280"
            x2="150"
            y2="290"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="2 2"
          />
        </svg>

        {/* Floating Sector Timing Overlay */}
        <div className="absolute right-0 top-1 text-right space-y-1 font-mono text-[11px]">
          {sectors.map((s) => {
            const isFaster = s.delta < 0;
            return (
              <div key={s.sector} className="flex items-center justify-end space-x-2">
                <span className="text-neutral-400 font-semibold">S{s.sector}</span>
                <span className="text-white font-medium">{s.time}</span>
                <span
                  className={`font-semibold ${
                    isFaster ? 'text-emerald-400' : 'text-[#e10600]'
                  }`}
                >
                  {isFaster ? '' : '+'}
                  {s.delta.toFixed(3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: Lap Time & Delta vs Personal Best */}
      <div className="pt-2 border-t border-white/10">
        <div className="flex items-baseline justify-between">
          <div className="font-telemetry text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
            {lapTime}
          </div>
          <div className="flex items-center space-x-1 rounded bg-emerald-950/80 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
            <span>▼</span>
            <span>{lapDelta > 0 ? `+${lapDelta.toFixed(3)}` : lapDelta.toFixed(3)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
          <span>vs. Personal Best</span>
          <span className="font-mono text-neutral-300">
            Lap {currentLap} / {totalLaps}
          </span>
        </div>
      </div>
    </div>
  );
};
