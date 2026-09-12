import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, FastForward } from 'lucide-react';
import { CircuitInfo } from '../types';
import { engineAudio } from '../utils/engineAudio';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  circuit: CircuitInfo;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  circuit,
  soundEnabled,
  onToggleSound,
}) => {
  if (!isOpen) return null;

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0.15); // 0 to 1
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);

  // Derive dynamic telemetry values from progress
  const speed = Math.round(140 + Math.sin(progress * Math.PI * 6) * 120 + 30);
  const rpm = Math.round(8000 + (speed / 300) * 6500);
  const gear = Math.min(8, Math.max(2, Math.floor(speed / 42) + 1));
  const throttle = speed > 180 ? 100 : Math.round(Math.max(20, (speed / 200) * 100));
  const brake = speed < 120 ? 85 : 0;
  const drs = speed > 260;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 1 ? 0 : prev + 0.004 * playbackSpeed));
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Update engine audio
  useEffect(() => {
    if (soundEnabled && isPlaying) {
      engineAudio.start();
      engineAudio.updateRPM(rpm, throttle);
    }
  }, [rpm, throttle, soundEnabled, isPlaying]);

  // Shift lights calculation (15 LEDs total: 5 Green, 5 Red, 5 Blue)
  const shiftPercent = Math.min(1, Math.max(0, (rpm - 8000) / 6500));
  const activeLeds = Math.round(shiftPercent * 15);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl border border-white/20 bg-[#0c0f15] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-3 w-3 rounded-full bg-[#e10600] animate-pulse" />
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Live Replay Simulation // {circuit.name}
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                Cockpit Telemetry Feed • Onboard Camera
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg border transition ${
                soundEnabled
                  ? 'border-[#e10600] bg-[#e10600]/20 text-[#e10600]'
                  : 'border-white/10 text-neutral-400 hover:text-white'
              }`}
              title="Toggle F1 V6 turbo audio"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Cockpit Simulation Screen */}
        <div className="relative my-6 h-80 rounded-xl border border-white/10 bg-gradient-to-b from-[#111622] to-[#06080b] overflow-hidden flex flex-col items-center justify-between p-6">
          {/* Track Horizon & Apex Guidelines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute bottom-1/2 left-0 right-0 h-[1px] bg-white/20" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          {/* Top HUD: DRS & Lap Time */}
          <div className="relative z-10 w-full flex items-center justify-between font-mono text-xs">
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  drs ? 'bg-emerald-500 text-black shadow-[0_0_10px_#10b981]' : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                DRS {drs ? 'ACTIVE' : 'OFF'}
              </span>
              <span className="text-neutral-400">Sector {progress < 0.33 ? 1 : progress < 0.66 ? 2 : 3}</span>
            </div>

            <div className="text-right">
              <div className="font-telemetry text-xl font-bold text-white">1:19.617</div>
              <div className="text-emerald-400 text-[10px]">-0.421 Delta</div>
            </div>
          </div>

          {/* Center: Formula 1 Racing Steering Wheel Display */}
          <div className="relative z-10 w-80 rounded-xl border border-white/20 bg-black/90 p-4 shadow-2xl">
            {/* Shift Light Strip (15 LEDs) */}
            <div className="flex items-center justify-center space-x-1 mb-3">
              {Array.from({ length: 15 }).map((_, i) => {
                const isActive = i < activeLeds;
                let colorClass = 'bg-neutral-800';
                if (isActive) {
                  if (i < 5) colorClass = 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
                  else if (i < 10) colorClass = 'bg-[#e10600] shadow-[0_0_8px_#e10600]';
                  else colorClass = 'bg-blue-500 shadow-[0_0_8px_#3b82f6]';
                }
                return <div key={i} className={`h-2.5 w-3.5 rounded-sm transition-all duration-75 ${colorClass}`} />;
              })}
            </div>

            {/* Gear & Speed Cluster */}
            <div className="flex items-center justify-between border-y border-white/10 py-3">
              <div className="text-center w-20">
                <span className="text-[10px] text-neutral-400 font-mono">SPEED</span>
                <div className="font-telemetry text-2xl font-bold text-white">{speed}</div>
                <span className="text-[9px] text-neutral-500 font-mono">KM/H</span>
              </div>

              <div className="text-center">
                <span className="text-[10px] text-neutral-400 font-mono">GEAR</span>
                <div className="font-telemetry text-4xl font-extrabold text-[#e10600]">{gear}</div>
              </div>

              <div className="text-center w-20">
                <span className="text-[10px] text-neutral-400 font-mono">RPM</span>
                <div className="font-telemetry text-2xl font-bold text-neutral-200">
                  {Math.round(rpm / 100) * 100}
                </div>
                <span className="text-[9px] text-neutral-500 font-mono">MAX 15K</span>
              </div>
            </div>

            {/* Bottom pedal bars */}
            <div className="mt-2.5 flex space-x-2">
              <div className="flex-1">
                <div className="h-2 rounded bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${throttle}%` }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="h-2 rounded bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#e10600]" style={{ width: `${brake}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Lap Progress Indicator */}
          <div className="relative z-10 w-full flex items-center space-x-3 font-mono text-xs text-neutral-400">
            <span>0%</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-[#e10600] transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
            <span>100%</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-2 rounded-md bg-[#e10600] px-5 py-2 text-xs font-bold text-white hover:bg-[#c20500] transition"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={() => setProgress(0)}
              className="flex items-center space-x-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-300 hover:bg-white/10 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restart</span>
            </button>

            <button
              onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 2 : 1)}
              className={`flex items-center space-x-1.5 rounded-md border px-3 py-2 text-xs transition ${
                playbackSpeed === 2 ? 'border-[#e10600] text-[#e10600]' : 'border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              <FastForward className="h-3.5 w-3.5" />
              <span>{playbackSpeed}x Speed</span>
            </button>
          </div>

          <div className="font-mono text-xs text-neutral-400">
            Turn {Math.round(progress * circuit.corners) + 1} of {circuit.corners}
          </div>
        </div>
      </div>
    </div>
  );
};
