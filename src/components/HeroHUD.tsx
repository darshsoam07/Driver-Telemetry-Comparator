import React from 'react';
import { CircuitInfo, SectorData } from '../types';
import { TrackMapSvg } from './TrackMapSvg';
import { WaveformGraph } from './WaveformGraph';
import { GForceRadar } from './GForceRadar';

interface HeroHUDProps {
  circuits: CircuitInfo[];
  selectedCircuit: CircuitInfo;
  onSelectCircuit: (c: CircuitInfo) => void;
  sectors: SectorData[];
  lapTime: string;
  lapDelta: number;
  currentLap: number;
  totalLaps: number;
  lapProgress: number;
  isLive: boolean;
  onToggleLive: () => void;
  speed: number;
  throttle: number;
  brake: number;
  rpm: number;
  history: {
    speed: number[];
    throttle: number[];
    brake: number[];
    rpm: number[];
  };
  gForce: {
    total: number;
    lateral: number;
    longitudinal: number;
    vertical: number;
  };
}

export const HeroHUD: React.FC<HeroHUDProps> = ({
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
  speed,
  throttle,
  brake,
  rpm,
  history,
  gForce,
}) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Outer Curved Glass HUD Container */}
      <div className="relative rounded-2xl border border-white/20 bg-gradient-to-b from-[#0e1219]/90 to-[#07090d]/95 shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl transition-all duration-300 hover:border-white/30">
        
        {/* Subtle Glowing Corner Brackets / F1 Telemetry Framing */}
        <div className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-[#e10600]" />
        <div className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-[#e10600]" />
        <div className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-[#e10600]" />
        <div className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-[#e10600]" />

        {/* 3-Section Grid: Track Map | Waveforms | G-Force Polar */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[300px]">
          {/* Section 1: Track Map & Sectors (5 cols) */}
          <div className="md:col-span-5">
            <TrackMapSvg
              circuits={circuits}
              selectedCircuit={selectedCircuit}
              onSelectCircuit={onSelectCircuit}
              sectors={sectors}
              lapTime={lapTime}
              lapDelta={lapDelta}
              currentLap={currentLap}
              totalLaps={totalLaps}
              lapProgress={lapProgress}
              isLive={isLive}
              onToggleLive={onToggleLive}
            />
          </div>

          {/* Section 2: Waveforms (4 cols) */}
          <div className="md:col-span-4">
            <WaveformGraph
              speed={speed}
              throttle={throttle}
              brake={brake}
              rpm={rpm}
              history={history}
            />
          </div>

          {/* Section 3: G-Force Radar (3 cols) */}
          <div className="md:col-span-3">
            <GForceRadar
              total={gForce.total}
              lateral={gForce.lateral}
              longitudinal={gForce.longitudinal}
              vertical={gForce.vertical}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
