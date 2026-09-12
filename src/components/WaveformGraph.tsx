import React from 'react';

interface WaveformGraphProps {
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
}

export const WaveformGraph: React.FC<WaveformGraphProps> = ({
  speed,
  throttle,
  brake,
  rpm,
  history,
}) => {
  // Convert array of values to SVG polyline/path points
  const generatePath = (data: number[], maxVal: number, height: number = 32, width: number = 220): string => {
    if (!data || data.length === 0) return `M 0 ${height} L ${width} ${height}`;
    const step = width / (data.length - 1 || 1);
    const points = data.map((val, idx) => {
      const x = idx * step;
      const normalized = Math.min(1, Math.max(0, val / maxVal));
      const y = height - normalized * (height - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="flex flex-col justify-between h-full p-4 md:p-5 border-b md:border-b-0 md:border-r border-white/10 space-y-3">
      {/* 1. SPEED Trace */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] font-bold tracking-wider text-neutral-400">
            SPEED
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="font-telemetry text-base font-bold text-white">
              {speed}
            </span>
            <span className="font-mono text-[9px] text-neutral-400">km/h</span>
          </div>
        </div>

        <div className="relative h-9 w-full rounded bg-black/40 px-1 py-0.5 border border-white/5 overflow-hidden">
          {/* Axis Markings */}
          <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-between text-[7px] font-mono text-neutral-500 pointer-events-none z-10">
            <span>400</span>
            <span>200</span>
            <span>0</span>
          </div>

          <svg className="h-full w-full overflow-visible pl-5" preserveAspectRatio="none" viewBox="0 0 220 32">
            {/* Grid line */}
            <line x1="0" y1="16" x2="220" y2="16" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            
            {/* Speed waveform (Glowing Red) */}
            <path
              d={generatePath(history.speed, 350, 30, 220)}
              fill="none"
              stroke="#e10600"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="filter drop-shadow-[0_0_4px_rgba(225,6,0,0.8)]"
            />
          </svg>
        </div>
      </div>

      {/* 2. THROTTLE Trace */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] font-bold tracking-wider text-neutral-400">
            THROTTLE
          </span>
          <span className="font-telemetry text-base font-bold text-white">
            {throttle}%
          </span>
        </div>

        <div className="relative h-9 w-full rounded bg-black/40 px-1 py-0.5 border border-white/5 overflow-hidden">
          <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-between text-[7px] font-mono text-neutral-500 pointer-events-none z-10">
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>

          <svg className="h-full w-full overflow-visible pl-5" preserveAspectRatio="none" viewBox="0 0 220 32">
            <line x1="0" y1="16" x2="220" y2="16" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <path
              d={generatePath(history.throttle, 100, 30, 220)}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="filter drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]"
            />
          </svg>
        </div>
      </div>

      {/* 3. BRAKE Trace */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] font-bold tracking-wider text-neutral-400">
            BRAKE
          </span>
          <span className={`font-telemetry text-base font-bold ${brake > 10 ? 'text-[#e10600]' : 'text-neutral-400'}`}>
            {brake}%
          </span>
        </div>

        <div className="relative h-9 w-full rounded bg-black/40 px-1 py-0.5 border border-white/5 overflow-hidden">
          <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-between text-[7px] font-mono text-neutral-500 pointer-events-none z-10">
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>

          <svg className="h-full w-full overflow-visible pl-5" preserveAspectRatio="none" viewBox="0 0 220 32">
            <line x1="0" y1="16" x2="220" y2="16" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <path
              d={generatePath(history.brake, 100, 30, 220)}
              fill="none"
              stroke="#e10600"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="filter drop-shadow-[0_0_4px_rgba(225,6,0,0.8)]"
            />
          </svg>
        </div>
      </div>

      {/* 4. RPM Trace */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] font-bold tracking-wider text-neutral-400">
            RPM
          </span>
          <span className="font-telemetry text-base font-bold text-neutral-200">
            {rpm.toLocaleString()}
          </span>
        </div>

        <div className="relative h-9 w-full rounded bg-black/40 px-1 py-0.5 border border-white/5 overflow-hidden">
          <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-between text-[7px] font-mono text-neutral-500 pointer-events-none z-10">
            <span>15K</span>
            <span>10K</span>
            <span>0</span>
          </div>

          <svg className="h-full w-full overflow-visible pl-5" preserveAspectRatio="none" viewBox="0 0 220 32">
            <line x1="0" y1="16" x2="220" y2="16" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <path
              d={generatePath(history.rpm, 15000, 30, 220)}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
