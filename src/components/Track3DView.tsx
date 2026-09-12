import React, { useState, useEffect } from 'react';
import SceneCanvas from './SceneCanvas';
import TelemetryHudGlass from './TelemetryHudGlass';
import { CircuitInfo, SectorData, TrackCoordinate } from '../types';
import { CIRCUITS, DRIVERS } from '../data/racingData';
import { getTrack3DCoordinates } from '../data/trackCoordinates';
import { Activity, Layers, RotateCcw, Upload, SlidersHorizontal, Sparkles } from 'lucide-react';

interface Track3DViewProps {
  selectedCircuit: CircuitInfo;
  onSelectCircuit: (c: CircuitInfo) => void;
  isLive?: boolean;
  onToggleLive?: () => void;
  speed?: number;
  throttle?: number;
  brake?: number;
  rpm?: number;
  sectors?: SectorData[];
  lapTime?: string;
  lapDelta?: number;
  currentLap?: number;
  totalLaps?: number;
}

export const Track3DView: React.FC<Track3DViewProps> = ({
  selectedCircuit,
  onSelectCircuit,
  isLive = true,
  onToggleLive = () => {},
  speed = 312,
  throttle = 100,
  brake = 0,
  rpm = 11842,
  sectors = [
    { sector: 1, time: '24.523', delta: -0.421 },
    { sector: 2, time: '28.114', delta: 0.132 },
    { sector: 3, time: '26.980', delta: -0.276 },
  ],
  lapTime = '1:19.617',
  lapDelta = -0.421,
  currentLap = 12,
  totalLaps = 58,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressD1, setProgressD1] = useState(0.24);
  const [progressD2, setProgressD2] = useState(0.22); // Driver 2 chasing slightly behind
  const [showCoordinateModal, setShowCoordinateModal] = useState(false);
  const [customCoordinates, setCustomCoordinates] = useState<TrackCoordinate[] | null>(null);

  // Get active 3D coordinates based on circuit
  const activeCoordinates = customCoordinates || getTrack3DCoordinates(selectedCircuit.id);

  // Animated driver nodes progression along the 3D ribbon curve
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgressD1((prev) => (prev >= 1 ? 0 : prev + 0.0035));
      setProgressD2((prev) => (prev >= 1 ? 0 : prev + 0.0034));
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleScrub = (newProgress: number) => {
    setProgressD1(newProgress);
    setProgressD2(Math.max(0, newProgress - 0.02));
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-[#07090e] flex flex-col justify-between">
      {/* 1. React Three Fiber 3D Viewport with Camera Parallax & Wet Garage Floor */}
      <SceneCanvas
        telemetryData={activeCoordinates}
        progressD1={progressD1}
        progressD2={progressD2}
        className="z-0"
      />

      {/* 2. Top Status HUD Ribbon */}
      <div className="relative z-20 w-full px-6 pt-6 flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
        <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 shadow-lg">
          <div className="h-2 w-2 rounded-full bg-[#ef4444] animate-ping" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#ef4444] tracking-widest uppercase font-bold">
              3D Spline Visualizer • Catmull-Rom Ribbon
            </span>
            <span className="text-xs font-bold text-white">
              {selectedCircuit.name} ({activeCoordinates.length} Vector Nodes)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleScrub(0)}
            className="flex items-center space-x-1.5 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-neutral-300 backdrop-blur-md hover:bg-white/10 hover:text-white transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Lap</span>
          </button>

          <button
            onClick={() => setShowCoordinateModal(true)}
            className="flex items-center space-x-1.5 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-neutral-300 backdrop-blur-md hover:bg-white/10 hover:text-white transition"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#ef4444]" />
            <span>Telemetry Input (FastF1)</span>
          </button>
        </div>
      </div>

      {/* 3. Floating HUD Glass matching requested layout */}
      <div className="relative z-20 w-full">
        <TelemetryHudGlass
          lapTime={lapTime}
          delta={lapDelta}
          lap={`${currentLap} / ${totalLaps}`}
          speed={speed}
          throttle={throttle}
          brake={brake}
          rpm={rpm}
          latG={2.3}
          longG={1.1}
          vertG={0.4}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          progress={progressD1}
          onScrub={handleScrub}
          circuits={CIRCUITS}
          selectedCircuit={selectedCircuit}
          onSelectCircuit={onSelectCircuit}
          sectors={sectors}
          driver1Code="LEC #16"
          driver2Code="VER #1"
        />
      </div>

      {/* 4. FastF1 Custom Coordinate Import Modal */}
      {showCoordinateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-[#0c0f15] p-6 text-white shadow-2xl">
            <h3 className="text-base font-bold flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-[#ef4444]" />
              <span>FastF1 / GPS Coordinates Datalink</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Load custom telemetry points $(X, Y, Z)$ into the continuous Catmull-Rom spline extruder.
            </p>

            <div className="mt-4 space-y-2">
              <label className="text-[11px] font-mono text-neutral-400">
                QUICK PRESET CIRCUITS
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CIRCUITS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCircuit(c);
                      setCustomCoordinates(null);
                      setShowCoordinateModal(false);
                    }}
                    className={`px-3 py-2 text-xs rounded-lg border text-left transition ${
                      selectedCircuit.id === c.id
                        ? 'border-[#ef4444] bg-[#ef4444]/20 text-white font-bold'
                        : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-end space-x-3">
              <button
                onClick={() => setShowCoordinateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Track3DView;
