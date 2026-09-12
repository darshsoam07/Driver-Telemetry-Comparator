import React from 'react';

interface GForceRadarProps {
  total: number;
  lateral: number;
  longitudinal: number;
  vertical: number;
}

export const GForceRadar: React.FC<GForceRadarProps> = ({
  total,
  lateral,
  longitudinal,
  vertical,
}) => {
  // Max G is approx 5.0 G in F1
  const maxG = 5.0;
  const radius = 55;
  const centerX = 75;
  const centerY = 75;

  // Calculate indicator coordinates (normalized from -maxG to +maxG)
  const normalizedLat = Math.min(1, Math.max(-1, lateral / maxG));
  const normalizedLong = Math.min(1, Math.max(-1, longitudinal / maxG));

  const dotX = centerX + normalizedLat * radius;
  const dotY = centerY - normalizedLong * radius;

  return (
    <div className="flex flex-col justify-between h-full p-4 md:p-5">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-mono text-[11px] font-bold tracking-wider text-neutral-400">
          G-FORCE
        </span>
        <div className="flex items-baseline space-x-1">
          <span className="font-telemetry text-xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
            {total.toFixed(1)}
          </span>
          <span className="font-mono text-[10px] text-neutral-400">G</span>
        </div>
      </div>

      {/* Center: Polar Radar Scope */}
      <div className="flex items-center justify-center my-auto py-1">
        <svg viewBox="0 0 150 150" className="w-36 h-36 overflow-visible">
          <defs>
            <radialGradient id="radarGridGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e10600" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#e10600" stopOpacity="0.0" />
            </radialGradient>
            <filter id="gDotGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background fill */}
          <circle cx={centerX} cy={centerY} r={radius} fill="url(#radarGridGlow)" />

          {/* Concentric rings: 1G, 2.5G, 5G */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.66}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.33}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />

          {/* Crosshairs */}
          <line
            x1={centerX - radius}
            y1={centerY}
            x2={centerX + radius}
            y2={centerY}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />
          <line
            x1={centerX}
            y1={centerY - radius}
            x2={centerX}
            y2={centerY + radius}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />

          {/* Cardinal markers */}
          <text x={centerX} y={centerY - radius + 8} textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="monospace">
            ▲
          </text>
          <text x={centerX + radius - 6} y={centerY + 2.5} textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="monospace">
            ▶
          </text>

          {/* Center reference point */}
          <circle cx={centerX} cy={centerY} r="2" fill="rgba(255,255,255,0.4)" />

          {/* G-Force active ball */}
          <circle
            cx={dotX}
            cy={dotY}
            r="8"
            fill="#e10600"
            opacity="0.3"
            filter="url(#gDotGlow)"
          />
          <circle
            cx={dotX}
            cy={dotY}
            r="4.5"
            fill="#e10600"
            filter="url(#gDotGlow)"
          />
          <circle
            cx={dotX}
            cy={dotY}
            r="2"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* Breakdown Values */}
      <div className="space-y-1 pt-2 border-t border-white/10 font-mono text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-neutral-400">Lateral</span>
          <span className="font-semibold text-white">{lateral.toFixed(1)} G</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-400">Longitudinal</span>
          <span className="font-semibold text-white">{longitudinal.toFixed(1)} G</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-400">Vertical</span>
          <span className="font-semibold text-white">{vertical.toFixed(1)} G</span>
        </div>
      </div>
    </div>
  );
};
