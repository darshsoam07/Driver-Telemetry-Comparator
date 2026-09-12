import React, { useState, useEffect, useRef } from 'react';
import { NavigationTab, CircuitInfo, SectorData } from './types';
import { CIRCUITS } from './data/racingData';
import { BACKDROP_OPTIONS } from './components/CarVisualizer';
import { Navbar } from './components/Navbar';
import { HeroView } from './components/HeroView';
import { TelemetryView } from './components/TelemetryView';
import { AnalyticsView } from './components/AnalyticsView';
import { PricingView } from './components/PricingView';
import { CommunityView } from './components/CommunityView';
import { Track3DView } from './components/Track3DView';
import { DemoModal } from './components/DemoModal';
import { SignInModal } from './components/SignInModal';
import { engineAudio } from './utils/engineAudio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('product');
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitInfo>(CIRCUITS[0]); // Monaco
  const [isLive, setIsLive] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [selectedBackdrop, setSelectedBackdrop] = useState<string>(
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=2400&q=85'
  );

  // Modals
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Live Telemetry Simulation State
  const [lapProgress, setLapProgress] = useState(0.18);
  const [speed, setSpeed] = useState(312);
  const [throttle, setThrottle] = useState(100);
  const [brake, setBrake] = useState(0);
  const [rpm, setRpm] = useState(11842);
  const [drsActive, setDrsActive] = useState(false);
  const [lapDelta, setLapDelta] = useState(-0.421);

  const [gForce, setGForce] = useState({
    total: 2.4,
    lateral: 2.3,
    longitudinal: 1.1,
    vertical: 0.4,
  });

  const [sectors, setSectors] = useState<SectorData[]>([
    { sector: 1, time: '24.523', delta: -0.421 },
    { sector: 2, time: '28.114', delta: 0.132 },
    { sector: 3, time: '26.980', delta: -0.276 },
  ]);

  // Rolling history for waveform SVG rendering
  const [waveformHistory, setWaveformHistory] = useState({
    speed: [210, 240, 280, 310, 312, 290, 220, 190, 250, 305, 312],
    throttle: [100, 100, 100, 100, 100, 50, 0, 0, 80, 100, 100],
    brake: [0, 0, 0, 0, 0, 40, 95, 80, 0, 0, 0],
    rpm: [9200, 10400, 11200, 11842, 11700, 9500, 7800, 8400, 10500, 11600, 11842],
  });

  // Sound toggle handler
  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    if (newState) {
      engineAudio.start();
      engineAudio.setMuted(false);
      engineAudio.updateRPM(rpm, throttle);
    } else {
      engineAudio.setMuted(true);
    }
  };

  // Real-time telemetry simulation loop
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setLapProgress((prev) => {
        const next = prev >= 1 ? 0 : prev + 0.005;

        // Realistic Monaco profile dynamics
        let curSpeed = 280;
        let curThrottle = 100;
        let curBrake = 0;
        let curLatG = 1.2;
        let curLongG = 0.8;

        if (next < 0.15) {
          // Pit straight & Ste Devote approach
          curSpeed = Math.round(280 + next * 240);
          curThrottle = 100;
          curBrake = 0;
          curLongG = 1.1;
        } else if (next < 0.22) {
          // Ste Devote braking
          curSpeed = Math.round(95 + (0.22 - next) * 1200);
          curThrottle = 0;
          curBrake = 95;
          curLongG = -3.2;
          curLatG = 2.4;
        } else if (next < 0.45) {
          // Beau Rivage climb & Casino
          curSpeed = Math.round(180 + Math.sin(next * 20) * 60);
          curThrottle = 85;
          curBrake = next % 0.04 < 0.01 ? 40 : 0;
          curLatG = 3.1;
        } else if (next < 0.55) {
          // Hairpin
          curSpeed = 54;
          curThrottle = 25;
          curBrake = 20;
          curLatG = 1.8;
        } else if (next < 0.72) {
          // Tunnel exit top speed
          curSpeed = Math.round(290 + Math.sin(next * 15) * 25);
          curThrottle = 100;
          curBrake = 0;
          curLongG = 1.3;
          curLatG = 1.1;
        } else {
          // Swimming pool & Rascasse
          curSpeed = Math.round(160 + Math.sin(next * 30) * 40);
          curThrottle = 70;
          curBrake = next % 0.05 < 0.015 ? 50 : 0;
          curLatG = 3.6;
        }

        const curRpm = Math.round(7500 + (curSpeed / 320) * 5800 + Math.random() * 90);
        const curTotalG = Number(Math.sqrt(curLatG * curLatG + curLongG * curLongG).toFixed(1));

        setSpeed(curSpeed);
        setThrottle(curThrottle);
        setBrake(curBrake);
        setRpm(curRpm);
        setDrsActive(curSpeed > 270);
        setGForce({
          total: curTotalG,
          lateral: Number(curLatG.toFixed(1)),
          longitudinal: Number(curLongG.toFixed(1)),
          vertical: 0.4,
        });

        // Push to waveform buffers
        setWaveformHistory((hist) => ({
          speed: [...hist.speed.slice(1), curSpeed],
          throttle: [...hist.throttle.slice(1), curThrottle],
          brake: [...hist.brake.slice(1), curBrake],
          rpm: [...hist.rpm.slice(1), curRpm],
        }));

        // Audio update
        if (soundEnabled) {
          engineAudio.updateRPM(curRpm, curThrottle);
        }

        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isLive, soundEnabled]);

  return (
    <div className="relative min-h-screen w-full bg-[#08090b] text-white flex flex-col justify-between selection:bg-[#e10600] selection:text-white overflow-x-hidden">
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSignIn={() => {
          setAuthMode('signin');
          setAuthModalOpen(true);
        }}
        onOpenGetStarted={() => {
          setAuthMode('signup');
          setAuthModalOpen(true);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* 2. Main Viewport Router */}
      <main className="flex-1 w-full relative">
        {currentTab === 'product' && (
          <HeroView
            circuits={CIRCUITS}
            selectedCircuit={selectedCircuit}
            onSelectCircuit={setSelectedCircuit}
            sectors={sectors}
            lapTime="1:19.617"
            lapDelta={lapDelta}
            currentLap={12}
            totalLaps={58}
            lapProgress={lapProgress}
            isLive={isLive}
            onToggleLive={() => setIsLive(!isLive)}
            speed={speed}
            throttle={throttle}
            brake={brake}
            rpm={rpm}
            history={waveformHistory}
            gForce={gForce}
            drsActive={drsActive}
            onStartAnalyzing={() => setCurrentTab('telemetry')}
            onWatchDemo={() => setDemoModalOpen(true)}
            selectedBackdrop={selectedBackdrop}
            onSelectBackdrop={setSelectedBackdrop}
            onOpen3DTrack={() => setCurrentTab('3d-track')}
          />
        )}

        {currentTab === '3d-track' && (
          <Track3DView
            selectedCircuit={selectedCircuit}
            onSelectCircuit={setSelectedCircuit}
            isLive={isLive}
            onToggleLive={() => setIsLive(!isLive)}
            speed={speed}
            throttle={throttle}
            brake={brake}
            rpm={rpm}
            sectors={sectors}
            lapTime="1:19.617"
            lapDelta={lapDelta}
            currentLap={12}
            totalLaps={58}
          />
        )}

        {currentTab === 'telemetry' && (
          <TelemetryView
            circuit={selectedCircuit}
            onSelectCircuit={setSelectedCircuit}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView circuit={selectedCircuit} />
        )}

        {currentTab === 'pricing' && (
          <PricingView
            onSelectPlan={(plan) => {
              setAuthMode('signup');
              setAuthModalOpen(true);
            }}
          />
        )}

        {currentTab === 'community' && (
          <CommunityView circuit={selectedCircuit} />
        )}
      </main>

      {/* 3. Global Modals */}
      <DemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        circuit={selectedCircuit}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      <SignInModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </div>
  );
}
