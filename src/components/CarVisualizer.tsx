import React, { useState } from 'react';
import { Camera, Layers, Flame, Gauge, Sliders } from 'lucide-react';

interface CarVisualizerProps {
  speed: number;
  throttle: number;
  drsActive: boolean;
  selectedBackdrop: string;
  onSelectBackdrop: (url: string) => void;
}

export const BACKDROP_OPTIONS = [
  {
    id: 'monaco-dusk',
    name: 'Monaco Pit Dusk',
    url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=2000&q=80',
  },
  {
    id: 'silverstone-garage',
    name: 'High-Tech Garage',
    url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=2000&q=80',
  },
  {
    id: 'night-circuit',
    name: 'Night Harbor Lights',
    url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=2000&q=80',
  },
];

export const CarVisualizer: React.FC<CarVisualizerProps> = ({
  speed,
  throttle,
  drsActive,
  selectedBackdrop,
  onSelectBackdrop,
}) => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  // Hotspots for technical telemetry analysis on the car
  const hotspots = [
    {
      id: 'wing',
      label: 'Aero Front Wing',
      cx: 480,
      cy: 420,
      metric: 'Downforce: 840 kg @ 300 km/h',
      desc: 'Ground effect front wing vortex generators & carbon fiber flap angle set to 34°',
    },
    {
      id: 'nose',
      label: 'Car #01 Chassis',
      cx: 560,
      cy: 330,
      metric: 'Weight: 798 kg min',
      desc: 'Monocoque carbon composite survival cell with dual pitot speed sensor probes',
    },
    {
      id: 'halo',
      label: 'Titanium Halo',
      cx: 660,
      cy: 280,
      metric: 'Load Rating: 125 kN',
      desc: 'Grade-5 titanium structural hoop with aerodynamic fairing deflection ridges',
    },
    {
      id: 'tire-fl',
      label: 'Pirelli Soft P-Zero (C5)',
      cx: 410,
      cy: 380,
      metric: 'Carcass Temp: 104°C | 22.5 PSI',
      desc: 'Ultra-soft red compound optimized for maximum mechanical grip around Monaco',
    },
    {
      id: 'tire-fr',
      label: 'Pirelli Soft P-Zero (FR)',
      cx: 790,
      cy: 370,
      metric: 'Carcass Temp: 108°C | 23.0 PSI',
      desc: 'Higher wear load from Portier & Swimming pool right-hand apex transfers',
    },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Background Ambience: Monaco Harbor Skyline at Twilight */}
      <div className="absolute inset-0 z-0">
        <img
          src={selectedBackdrop}
          alt="Monaco Harbor at dusk"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35 filter blur-[2px] scale-105 transition-all duration-700"
        />
        {/* High-contrast dark garage vignette and wet reflections overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090b] via-[#08090b]/80 to-[#08090b]/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090b] via-transparent to-[#08090b]" />
        {/* Architectural pit garage frame pillars */}
        <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-black via-black/80 to-transparent opacity-80" />
        <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-black via-black/80 to-transparent opacity-80" />
      </div>

      {/* SVG Formula 1 Car Silhouette & Detailed Perspective Geometry */}
      <div className="absolute inset-x-0 bottom-0 h-[65%] max-w-6xl mx-auto flex items-end justify-center pointer-events-auto z-10">
        <svg
          viewBox="200 180 800 350"
          className="w-full h-full max-h-[500px] overflow-visible filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)]"
        >
          <defs>
            {/* Metallic Carbon Gradients */}
            <linearGradient id="carbonBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#252a33" />
              <stop offset="40%" stopColor="#14171d" />
              <stop offset="85%" stopColor="#0a0c0f" />
              <stop offset="100%" stopColor="#050608" />
            </linearGradient>

            <linearGradient id="carbonGloss" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#4a5568" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#1a202c" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="redAeroGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff1e1e" />
              <stop offset="50%" stopColor="#e10600" />
              <stop offset="100%" stopColor="#990000" />
            </linearGradient>

            <filter id="neonPulse" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <radialGradient id="wetPuddleReflect" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e10600" stopOpacity="0.45" />
              <stop offset="40%" stopColor="#e10600" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#08090b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Wet Floor Ground Reflection under the car */}
          <ellipse cx="600" cy="485" rx="360" ry="38" fill="url(#wetPuddleReflect)" />
          <ellipse cx="440" cy="465" rx="80" ry="12" fill="url(#wetPuddleReflect)" opacity="0.6" />
          <ellipse cx="760" cy="465" rx="80" ry="12" fill="url(#wetPuddleReflect)" opacity="0.6" />

          {/* Floor Reflection lines mirroring the nose & wings */}
          <g opacity="0.18" transform="scale(1, -0.45) translate(0, -960)" filter="url(#neonPulse)">
            <path d="M 520 400 L 600 440 L 680 400 L 600 370 Z" fill="#e10600" />
            <path d="M 400 430 L 800 430" stroke="#e10600" strokeWidth="4" />
          </g>

          {/* === REAR WING & DRS ACTUATOR (High behind cockpit) === */}
          <g id="rear-wing">
            <rect x="520" y="225" width="160" height="14" rx="3" fill="#181c24" stroke="#e10600" strokeWidth="1" />
            <path d="M 500 215 L 530 250 L 530 290 L 500 260 Z" fill="#101318" />
            <path d="M 700 215 L 670 250 L 670 290 L 700 260 Z" fill="#101318" />
            {/* DRS Flap Open / Closed */}
            <line
              x1="535"
              y1={drsActive ? 222 : 227}
              x2="665"
              y2={drsActive ? 222 : 227}
              stroke={drsActive ? '#22c55e' : '#e10600'}
              strokeWidth="3.5"
              filter="url(#neonPulse)"
            />
          </g>

          {/* === FRONT LEFT TIRE (Pirelli P-Zero Soft Red) === */}
          <g id="front-left-wheel">
            {/* Tire Tread Silhouette */}
            <path
              d="M 370 340 C 370 310 400 300 425 315 L 430 430 C 400 445 370 425 370 395 Z"
              fill="#121418"
              stroke="#2d3748"
              strokeWidth="2"
            />
            {/* Red Pirelli Compound Stripe */}
            <path
              d="M 378 345 C 378 322 398 312 418 324 L 422 420 C 400 432 378 418 378 390 Z"
              fill="none"
              stroke="#e10600"
              strokeWidth="4"
              filter="url(#neonPulse)"
            />
            {/* Wheel hub / Rim deflector */}
            <ellipse cx="400" cy="370" rx="20" ry="34" fill="#080a0d" stroke="#4a5568" strokeWidth="2" />
            <circle cx="400" cy="370" r="6" fill="#e10600" />
            {/* Wheel wake aero deflector fin */}
            <path d="M 425 305 L 445 320 L 440 375 L 420 370 Z" fill="#1a202c" stroke="#334155" />
          </g>

          {/* === FRONT RIGHT TIRE (Pirelli P-Zero Soft Red) === */}
          <g id="front-right-wheel">
            <path
              d="M 830 340 C 830 310 800 300 775 315 L 770 430 C 800 445 830 425 830 395 Z"
              fill="#121418"
              stroke="#2d3748"
              strokeWidth="2"
            />
            <path
              d="M 822 345 C 822 322 802 312 782 324 L 778 420 C 800 432 822 418 822 390 Z"
              fill="none"
              stroke="#e10600"
              strokeWidth="4"
              filter="url(#neonPulse)"
            />
            <ellipse cx="800" cy="370" rx="20" ry="34" fill="#080a0d" stroke="#4a5568" strokeWidth="2" />
            <circle cx="800" cy="370" r="6" fill="#e10600" />
            <path d="M 775 305 L 755 320 L 760 375 L 780 370 Z" fill="#1a202c" stroke="#334155" />
          </g>

          {/* === MAIN CHASSIS / MONOCOQUE / COCKPIT === */}
          {/* Sidepods & Undercut Air Intakes */}
          <path
            d="M 470 330 C 470 300 520 280 550 280 L 650 280 C 680 280 730 300 730 330 L 710 390 C 680 390 640 380 600 380 C 560 380 520 390 490 390 Z"
            fill="url(#carbonBody)"
            stroke="#2d3748"
            strokeWidth="1.5"
          />

          {/* Sidepod Undercut Red Accent Lines */}
          <path
            d="M 480 345 C 510 330 550 325 600 325 C 650 325 690 330 720 345"
            fill="none"
            stroke="#e10600"
            strokeWidth="2.5"
            filter="url(#neonPulse)"
          />

          {/* Cockpit & Driver Helmet */}
          <ellipse cx="600" cy="275" rx="30" ry="14" fill="#07090c" />
          {/* Helmet */}
          <circle cx="600" cy="265" r="16" fill="#1e2430" stroke="#e10600" strokeWidth="2" />
          {/* Visor */}
          <path d="M 590 262 Q 600 258 610 262" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

          {/* Titanium HALO Structural Frame */}
          <path
            d="M 555 285 C 560 250 580 235 600 235 C 620 235 640 250 645 285"
            fill="none"
            stroke="#1a202c"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M 555 285 C 560 250 580 235 600 235 C 620 235 640 250 645 285"
            fill="none"
            stroke="#e10600"
            strokeWidth="2.5"
            filter="url(#neonPulse)"
          />
          {/* Center Halo Pillar */}
          <line x1="600" y1="235" x2="600" y2="295" stroke="#11151c" strokeWidth="8" />
          <line x1="600" y1="235" x2="600" y2="295" stroke="#ffffff" strokeWidth="1" opacity="0.6" />

          {/* === NOSE CONE (Pointing forward toward camera) === */}
          <path
            d="M 570 290 L 630 290 L 620 405 C 615 425 605 435 600 435 C 595 435 585 425 580 405 Z"
            fill="url(#carbonBody)"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Nose Center Specular Light Reflection */}
          <path
            d="M 595 292 L 605 292 L 603 425 L 597 425 Z"
            fill="url(#carbonGloss)"
          />

          {/* Bold Driver Number "01" on Nose */}
          <text
            x="600"
            y="350"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="32"
            fontFamily="'Rajdhani', sans-serif"
            fontWeight="bold"
            letterSpacing="2"
            className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            01
          </text>

          {/* Slanted Twin Nose Badges */}
          <line x1="592" y1="365" x2="598" y2="365" stroke="#e10600" strokeWidth="3" />
          <line x1="602" y1="365" x2="608" y2="365" stroke="#ffffff" strokeWidth="3" />

          {/* Nose Tip Aerodynamic Sensor / Pitot */}
          <ellipse cx="600" cy="433" rx="14" ry="6" fill="#0c0e12" stroke="#e10600" strokeWidth="1.5" />
          <line x1="600" y1="433" x2="600" y2="445" stroke="#94a3b8" strokeWidth="2" />

          {/* === MASSIVE 3D FRONT WING & GROUND EFFECT ENDPLATES === */}
          {/* Main Front Wing Aerofoil Plane */}
          <path
            d="M 360 410 C 440 430 520 440 600 440 C 680 440 760 430 840 410 L 850 445 C 770 465 680 475 600 475 C 520 475 430 465 350 445 Z"
            fill="url(#carbonBody)"
            stroke="#2d3748"
            strokeWidth="2"
          />

          {/* Front Wing Cascade Flaps with Red Glowing Leading Edge */}
          <path
            d="M 370 422 C 450 438 530 445 600 445 C 670 445 750 438 830 422"
            fill="none"
            stroke="#e10600"
            strokeWidth="3.5"
            filter="url(#neonPulse)"
          />

          {/* Upper Flap Lip with White Edge */}
          <path
            d="M 390 412 C 460 424 530 430 600 430 C 670 430 740 424 810 412"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            opacity="0.8"
          />

          {/* Front Wing Left Endplate & Footplate */}
          <path
            d="M 345 375 L 365 375 L 360 455 L 335 450 Z"
            fill="#0f1318"
            stroke="#e10600"
            strokeWidth="2"
          />
          {/* Front Wing Right Endplate & Footplate */}
          <path
            d="M 855 375 L 835 375 L 840 455 L 865 450 Z"
            fill="#0f1318"
            stroke="#e10600"
            strokeWidth="2"
          />

          {/* TrackPulse Sponsor Branding on Front Wing Flaps */}
          <text
            x="455"
            y="450"
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize="10"
            fontFamily="'Chakra Petch', sans-serif"
            fontWeight="bold"
            letterSpacing="1"
            opacity="0.85"
          >
            TrackPulse
          </text>
          <text
            x="745"
            y="450"
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize="10"
            fontFamily="'Chakra Petch', sans-serif"
            fontWeight="bold"
            letterSpacing="1"
            opacity="0.85"
          >
            TrackPulse
          </text>

          {/* Front Wing Lower Diffuser Strakes / Ground Effect Tunnel Inlets */}
          <line x1="500" y1="445" x2="495" y2="465" stroke="#e10600" strokeWidth="2" />
          <line x1="535" y1="448" x2="532" y2="470" stroke="#e10600" strokeWidth="2" />
          <line x1="665" y1="448" x2="668" y2="470" stroke="#e10600" strokeWidth="2" />
          <line x1="700" y1="445" x2="705" y2="465" stroke="#e10600" strokeWidth="2" />

          {/* Dynamic Aerodynamic Flow Trails when moving fast */}
          {speed > 180 && (
            <g opacity={(speed - 150) / 180} filter="url(#neonPulse)">
              <line x1="360" y1="410" x2="310" y2="425" stroke="#e10600" strokeWidth="2" strokeDasharray="10 20" />
              <line x1="840" y1="410" x2="890" y2="425" stroke="#e10600" strokeWidth="2" strokeDasharray="10 20" />
              <line x1="600" y1="235" x2="600" y2="190" stroke="#e10600" strokeWidth="2.5" strokeDasharray="15 25" />
            </g>
          )}

          {/* === INTERACTIVE TELEMETRY SENSOR HOTSPOTS === */}
          {hotspots.map((hs) => (
            <g
              key={hs.id}
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={() => setActiveHotspot(activeHotspot === hs.id ? null : hs.id)}
            >
              <circle cx={hs.cx} cy={hs.cy} r="14" fill="#e10600" opacity="0.25" className="animate-ping" />
              <circle cx={hs.cx} cy={hs.cy} r="7" fill="#08090b" stroke="#e10600" strokeWidth="2" />
              <circle cx={hs.cx} cy={hs.cy} r="3" fill="#ffffff" />
            </g>
          ))}
        </svg>

        {/* Active Hotspot Tooltip */}
        {activeHotspot && (
          <div className="absolute top-4 bg-[#0d1117]/95 border border-[#e10600]/60 p-3 rounded-lg shadow-2xl backdrop-blur-xl max-w-xs z-30 pointer-events-auto animate-in fade-in">
            {(() => {
              const hs = hotspots.find((h) => h.id === activeHotspot);
              if (!hs) return null;
              return (
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1.5">
                    <span className="font-racing text-xs font-bold text-white">{hs.label}</span>
                    <button
                      onClick={() => setActiveHotspot(null)}
                      className="text-neutral-400 hover:text-white text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="font-telemetry text-xs font-semibold text-[#e10600] mb-1">{hs.metric}</div>
                  <p className="text-[11px] text-neutral-300 leading-snug">{hs.desc}</p>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Floating Backdrop Selector & Custom Image Hotlink Control */}
      <div className="absolute top-24 right-6 pointer-events-auto z-20 flex flex-col items-end space-y-2">
        <div className="flex items-center space-x-1.5 rounded-full border border-white/10 bg-black/60 p-1 backdrop-blur-md">
          {BACKDROP_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelectBackdrop(opt.url)}
              title={opt.name}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
                selectedBackdrop === opt.url
                  ? 'bg-[#e10600] text-white shadow-[0_0_10px_#e10600]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {opt.name}
            </button>
          ))}
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            title="Hotlink custom image URL"
            className="flex items-center space-x-1 rounded-full px-2 py-1 text-[10px] text-neutral-400 hover:text-white transition"
          >
            <Camera className="h-3 w-3" />
            <span>Hotlink</span>
          </button>
        </div>

        {/* Custom Image URL input modal */}
        {showCustomInput && (
          <div className="flex items-center rounded-lg border border-white/20 bg-black/90 p-2 shadow-2xl backdrop-blur-xl">
            <input
              type="text"
              placeholder="Paste image URL (Unsplash, CDN)..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-56 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
            <button
              onClick={() => {
                if (customUrl.trim()) {
                  onSelectBackdrop(customUrl.trim());
                  setShowCustomInput(false);
                }
              }}
              className="ml-2 rounded bg-[#e10600] px-2.5 py-1 text-[10px] font-bold text-white hover:bg-red-700"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
