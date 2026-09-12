import { CircuitInfo, DriverProfile, TelemetryDataPoint } from '../types';

export const CIRCUITS: CircuitInfo[] = [
  {
    id: 'monaco',
    name: 'Monaco Grand Prix',
    location: 'Circuit de Monaco, Monte Carlo',
    country: 'Monaco',
    lengthKm: 3.337,
    corners: 19,
    drsZones: 1,
    lapRecord: {
      time: '1:12.909',
      driver: 'Lewis Hamilton',
      year: 2021,
    },
    // Realistic Monaco Circuit SVG path outline
    svgPath: 'M 145 285 C 130 260 120 220 125 180 C 130 145 150 115 185 85 C 205 68 235 55 260 55 C 280 55 295 65 300 80 C 305 95 295 110 280 120 C 265 130 250 145 255 165 C 260 185 285 200 310 190 C 330 180 345 150 360 140 C 375 130 400 135 410 155 C 420 175 415 200 395 220 C 375 240 345 255 315 265 C 285 275 255 285 220 290 C 185 295 160 300 145 285 Z',
    viewBox: '100 40 330 280',
    sectorSplitPoints: [0.33, 0.66, 1.0],
  },
  {
    id: 'silverstone',
    name: 'Silverstone GP',
    location: 'Silverstone, Northamptonshire',
    country: 'United Kingdom',
    lengthKm: 5.891,
    corners: 18,
    drsZones: 2,
    lapRecord: {
      time: '1:27.097',
      driver: 'Max Verstappen',
      year: 2020,
    },
    svgPath: 'M 140 180 C 140 120 180 80 250 70 C 320 60 380 90 410 140 C 430 180 400 230 350 250 C 310 265 260 255 220 270 C 180 285 140 260 135 220 Z',
    viewBox: '100 50 350 250',
    sectorSplitPoints: [0.32, 0.68, 1.0],
  },
  {
    id: 'spa',
    name: 'Spa-Francorchamps',
    location: 'Circuit de Spa-Francorchamps, Stavelot',
    country: 'Belgium',
    lengthKm: 7.004,
    corners: 19,
    drsZones: 2,
    lapRecord: {
      time: '1:46.286',
      driver: 'Valtteri Bottas',
      year: 2018,
    },
    svgPath: 'M 150 120 C 190 70 270 50 350 80 C 400 100 430 160 410 220 C 390 270 330 300 270 290 C 220 280 180 240 140 200 Z',
    viewBox: '110 40 340 280',
    sectorSplitPoints: [0.35, 0.70, 1.0],
  },
  {
    id: 'monza',
    name: 'Monza Temple of Speed',
    location: 'Autodromo Nazionale Monza',
    country: 'Italy',
    lengthKm: 5.793,
    corners: 11,
    drsZones: 2,
    lapRecord: {
      time: '1:21.046',
      driver: 'Rubens Barrichello',
      year: 2004,
    },
    svgPath: 'M 130 160 C 130 90 200 60 300 60 C 380 60 430 100 440 160 C 450 220 400 260 310 260 C 210 260 140 230 130 160 Z',
    viewBox: '100 40 360 240',
    sectorSplitPoints: [0.3, 0.65, 1.0],
  },
];

export const DRIVERS: DriverProfile[] = [
  {
    id: 'lec',
    name: 'Charles Leclerc',
    number: 16,
    team: 'Scuderia Ferrari HP',
    code: 'LEC',
    helmetColor: '#e10600',
    bestLap: '1:19.617',
  },
  {
    id: 'ver',
    name: 'Max Verstappen',
    number: 1,
    team: 'Red Bull Racing',
    code: 'VER',
    helmetColor: '#1e40af',
    bestLap: '1:19.749',
  },
  {
    id: 'nor',
    name: 'Lando Norris',
    number: 4,
    team: 'McLaren F1 Team',
    code: 'NOR',
    helmetColor: '#f97316',
    bestLap: '1:19.822',
  },
  {
    id: 'ham',
    name: 'Lewis Hamilton',
    number: 44,
    team: 'Mercedes-AMG PETRONAS',
    code: 'HAM',
    helmetColor: '#14b8a6',
    bestLap: '1:20.004',
  },
];

// Generate synthetic continuous telemetry data for Monaco lap (approx 3300m)
export function generateLapTelemetry(): TelemetryDataPoint[] {
  const points: TelemetryDataPoint[] = [];
  const totalPoints = 120;
  
  for (let i = 0; i <= totalPoints; i++) {
    const progress = i / totalPoints;
    const distance = Math.round(progress * 3337);
    
    // Create authentic Monaco speed profile with straights, chicane, hairpin, swimming pool
    let speed = 280;
    let throttle = 100;
    let brake = 0;
    let gear = 7;
    let gForceLat = 0.4;
    let gForceLong = 0.2;

    if (progress < 0.12) {
      // Main straight heading to Ste Devote
      speed = 180 + progress * 1000;
      throttle = 100;
      brake = 0;
      gear = Math.min(8, Math.floor(speed / 40) + 1);
      gForceLong = 0.8;
    } else if (progress < 0.16) {
      // Ste Devote heavy braking
      speed = Math.max(92, 300 - (progress - 0.12) * 5000);
      throttle = 0;
      brake = 95;
      gear = 2;
      gForceLat = 2.8;
      gForceLong = -3.8;
    } else if (progress < 0.32) {
      // Beau Rivage climb to Massenet
      speed = 110 + (progress - 0.16) * 1100;
      throttle = 95;
      brake = 0;
      gear = Math.min(7, Math.floor(speed / 40) + 1);
      gForceLat = 2.4;
      gForceLong = 0.7;
    } else if (progress < 0.45) {
      // Casino Square & Mirabeau descent
      speed = 160 - Math.sin((progress - 0.32) * 20) * 50;
      throttle = 40 + Math.sin(progress * 30) * 30;
      brake = progress % 0.05 < 0.02 ? 60 : 0;
      gear = 3;
      gForceLat = 3.2;
    } else if (progress < 0.52) {
      // Grand Hotel Hairpin (slowest corner on calendar ~48 km/h)
      speed = 52 + Math.random() * 4;
      throttle = 25;
      brake = 30;
      gear = 1;
      gForceLat = 1.9;
    } else if (progress < 0.68) {
      // Portier & Tunnel exit (fastest section ~290 km/h)
      speed = 110 + (progress - 0.52) * 1150;
      throttle = 100;
      brake = 0;
      gear = 7;
      gForceLong = 0.9;
      gForceLat = 1.2;
    } else if (progress < 0.75) {
      // Nouvelle Chicane heavy brake
      speed = Math.max(78, 290 - (progress - 0.68) * 3100);
      throttle = 5;
      brake = 100;
      gear = 2;
      gForceLat = 3.6;
      gForceLong = -4.2;
    } else if (progress < 0.88) {
      // Tabac & Swimming Pool high speed chicane
      speed = 195 + Math.sin(progress * 40) * 45;
      throttle = 85;
      brake = progress % 0.04 < 0.015 ? 40 : 0;
      gear = 5;
      gForceLat = 4.1;
    } else {
      // Rascasse & Antony Noghes onto main straight
      speed = 90 + (progress - 0.88) * 800;
      throttle = 75;
      brake = 0;
      gear = 3;
      gForceLat = 2.1;
    }

    const rpm = Math.round(7500 + (speed % 45) * 150 + Math.random() * 80);

    points.push({
      distance,
      speed: Math.round(speed),
      throttle: Math.min(100, Math.max(0, Math.round(throttle))),
      brake: Math.min(100, Math.max(0, Math.round(brake))),
      rpm: Math.min(15000, Math.max(7000, rpm)),
      gear,
      gForceLat: Number(gForceLat.toFixed(1)),
      gForceLong: Number(gForceLong.toFixed(1)),
    });
  }

  return points;
}
