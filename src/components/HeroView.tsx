import React, { useState } from 'react';
import { ArrowRight, Play, ChevronLeft, ChevronRight, Box } from 'lucide-react';
import { CircuitInfo, SectorData } from '../types';
import { HeroHUD } from './HeroHUD';
import { CarVisualizer } from './CarVisualizer';

interface HeroViewProps {
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
  drsActive: boolean;
  onStartAnalyzing: () => void;
  onWatchDemo: () => void;
  selectedBackdrop: string;
  onSelectBackdrop: (url: string) => void;
  onOpen3DTrack?: () => void;
}

export const HeroView: React.FC<HeroViewProps> = ({
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
  drsActive,
  onStartAnalyzing,
  onWatchDemo,
  selectedBackdrop,
  onSelectBackdrop,
  onOpen3DTrack,
}) => {
  const [activeSlide, setActiveSlide] = useState(1);
  const totalSlides = 4;

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev % totalSlides) + 1);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 1 ? totalSlides : prev - 1));
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden bg-[#08090b] flex flex-col justify-between">
      {/* 1. Cinematic Background with Formula 1 Car & Pit Garage */}
      <CarVisualizer
        speed={speed}
        throttle={throttle}
        drsActive={drsActive}
        selectedBackdrop={selectedBackdrop}
        onSelectBackdrop={onSelectBackdrop}
      />

      {/* 2. Left Edge Decorative Text Annotation */}
      <div className="hidden xl:flex absolute left-8 top-1/3 -translate-y-1/2 flex-col items-center space-y-4 pointer-events-none z-20">
        <div className="h-14 w-[1px] bg-gradient-to-b from-transparent via-[#e10600] to-transparent" />
        <span className="font-mono text-[10px] tracking-[0.3em] text-neutral-400 rotate-180 [writing-mode:vertical-lr]">
          MONACO DRIVES LEGENDS.
        </span>
      </div>

      {/* 3. Left Bottom Decorative Text Annotation */}
      <div className="hidden xl:flex absolute left-8 bottom-12 items-center space-x-3 pointer-events-none z-20">
        <div className="h-8 w-[2px] bg-[#e10600]" />
        <div className="flex flex-col text-[9px] font-mono tracking-widest text-neutral-400 leading-tight">
          <span>DATA</span>
          <span>BUILDS</span>
          <span>CHAMPIONS.</span>
        </div>
      </div>

      {/* 4. Right Edge Upper Decorative Annotation */}
      <div className="hidden xl:flex absolute right-8 top-1/3 flex-col items-end space-y-2 pointer-events-none z-20 text-right">
        <div className="flex flex-col font-mono text-[10px] tracking-[0.25em] text-neutral-400 leading-snug">
          <span>CLEAN</span>
          <span>DATA.</span>
          <span>FASTER</span>
          <span>DRIVERS.</span>
        </div>
        <div className="h-[2px] w-8 bg-[#e10600]" />
      </div>

      {/* 5. Right Edge Middle Decorative Annotation */}
      <div className="hidden xl:flex absolute right-8 top-2/3 flex-col font-mono text-[9px] tracking-[0.2em] text-neutral-500 pointer-events-none z-20 text-right">
        <span>PEOPLE</span>
        <span>DATA</span>
        <span>PERFORMANCE</span>
      </div>

      {/* 6. Main Hero Content & HUD Grid Layout */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 lg:px-10 pt-6 md:pt-10 pb-16 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Hero Typography, Subtitle, CTAs & Metrics */}
          <div className="lg:col-span-5 flex flex-col justify-center pt-2 md:pt-6">
            
            {/* Small Monospace Eyebrow */}
            <div className="mb-4 flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e10600]" />
              <span className="font-mono text-xs tracking-[0.3em] text-neutral-400 font-medium">
                REAL DATA. REAL PROGRESS.
              </span>
            </div>

            {/* Massive Bold Headline matching screenshot */}
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
              DRIVE<br />
              SMARTER<br />
              GO <span className="text-[#e10600] drop-shadow-[0_0_20px_rgba(225,6,0,0.6)]">FURTHER.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-sm sm:text-base text-neutral-300 max-w-md leading-relaxed">
              Real-time telemetry, advanced analytics, and AI-powered insights for drivers, teams, and engineers.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                id="hero-start-analyzing-btn"
                onClick={onStartAnalyzing}
                className="group flex items-center space-x-2 rounded-md bg-[#e10600] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-red-950/50 transition-all duration-200 hover:bg-[#c20500] hover:shadow-[0_0_25px_rgba(225,6,0,0.4)] active:scale-95"
              >
                <span>Start Analyzing</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              {onOpen3DTrack && (
                <button
                  id="hero-open-3d-track-btn"
                  onClick={onOpen3DTrack}
                  className="group flex items-center space-x-2 rounded-md border border-[#e10600]/50 bg-[#e10600]/15 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-[#e10600]/30 hover:border-[#e10600] active:scale-95 shadow-lg shadow-red-950/30"
                >
                  <Box className="h-4 w-4 text-[#ef4444] transition-transform group-hover:rotate-12" />
                  <span>3D Track Rig</span>
                </button>
              )}

              <button
                id="hero-watch-demo-btn"
                onClick={onWatchDemo}
                className="group flex items-center space-x-2 rounded-md border border-white/20 bg-black/40 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/10 active:scale-95"
              >
                <Play className="h-4 w-4 fill-white text-white transition-transform group-hover:scale-110" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Metric Statistics Strip */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 max-w-lg">
              <div>
                <div className="font-telemetry text-xl sm:text-2xl font-bold text-white">0.01s</div>
                <div className="font-mono text-[9px] tracking-wider text-neutral-400 mt-0.5">PRECISION</div>
              </div>
              <div>
                <div className="font-telemetry text-xl sm:text-2xl font-bold text-white">100+</div>
                <div className="font-mono text-[9px] tracking-wider text-neutral-400 mt-0.5">METRICS</div>
              </div>
              <div>
                <div className="font-telemetry text-xl sm:text-2xl font-bold text-white">REAL-TIME</div>
                <div className="font-mono text-[9px] tracking-wider text-neutral-400 mt-0.5">ANALYTICS</div>
              </div>
              <div>
                <div className="font-telemetry text-xl sm:text-2xl font-bold text-white">PRO</div>
                <div className="font-mono text-[9px] tracking-wider text-neutral-400 mt-0.5">DRIVER TOOLS</div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Holographic Floating HUD Dashboard */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end mt-4 lg:mt-0">
            <HeroHUD
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
              speed={speed}
              throttle={throttle}
              brake={brake}
              rpm={rpm}
              history={history}
              gForce={gForce}
            />
          </div>

        </div>

        {/* 7. Bottom Right Carousel Pagination Bar */}
        <div className="mt-8 flex items-end justify-end">
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrevSlide}
                className="text-neutral-500 hover:text-white transition p-1"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>

              <div className="flex items-baseline space-x-1 font-mono text-sm">
                <span className="font-bold text-white">0{activeSlide}</span>
                <span className="text-neutral-500">/ 0{totalSlides}</span>
              </div>

              <button
                onClick={handleNextSlide}
                className="text-neutral-500 hover:text-white transition p-1"
                aria-label="Next slide"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {/* Red Accent Slider Track Line */}
            <div className="h-[2px] w-24 bg-neutral-800 relative overflow-hidden">
              <div
                className="h-full bg-[#e10600] transition-all duration-300"
                style={{ width: `${(activeSlide / totalSlides) * 100}%` }}
              />
            </div>

            <div className="flex flex-col text-right font-mono text-[8px] tracking-[0.25em] text-neutral-500">
              <span>ANALYZE</span>
              <span>IMPROVE</span>
              <span>BELONG</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
