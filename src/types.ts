export type NavigationTab = 'product' | '3d-track' | 'telemetry' | 'analytics' | 'pricing' | 'community';

export interface TrackCoordinate {
  x: number;
  y: number;
  z?: number;
}

export interface CircuitInfo {
  id: string;
  name: string;
  location: string;
  country: string;
  lengthKm: number;
  corners: number;
  drsZones: number;
  lapRecord: {
    time: string;
    driver: string;
    year: number;
  };
  svgPath: string;
  viewBox: string;
  sectorSplitPoints: [number, number, number]; // percentages along track
}

export interface SectorData {
  sector: number;
  time: string;
  delta: number; // positive = slower, negative = faster
}

export interface TelemetrySnapshot {
  speed: number; // km/h
  throttle: number; // % (0-100)
  brake: number; // % (0-100)
  rpm: number; // 0-15000
  gear: number; // 1-8
  drsActive: boolean;
  gForce: {
    total: number;
    lateral: number;
    longitudinal: number;
    vertical: number;
  };
  lapTime: string;
  lapDelta: number;
  currentLap: number;
  totalLaps: number;
  sectors: SectorData[];
  tireTemps: {
    fl: number;
    fr: number;
    rl: number;
    rr: number;
  };
  tireWear: {
    fl: number;
    fr: number;
    rl: number;
    rr: number;
  };
  batteryErs: number; // % (0-100)
  fuelKg: number;
}

export interface DriverProfile {
  id: string;
  name: string;
  number: number;
  team: string;
  code: string;
  helmetColor: string;
  bestLap: string;
}

export interface TelemetryDataPoint {
  distance: number; // meters from start line
  speed: number;
  throttle: number;
  brake: number;
  rpm: number;
  gear: number;
  gForceLat: number;
  gForceLong: number;
}
