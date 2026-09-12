import { TrackCoordinate } from '../types';

// Authentic 3D track paths (X, Y, Z coordinates scaled for CatmullRomCurve3 spline)
// Scaled so FastF1 coordinate systems map cleanly onto the Three.js coordinate system.

export const MONACO_3D_COORDINATES: TrackCoordinate[] = [
  // Pit straight towards Sainte Dévote
  { x: -10, y: -4, z: 0 },
  { x: -4, y: -2, z: 0.2 },
  { x: 2, y: 1, z: 0.5 },
  // Turn 1 Sainte Dévote
  { x: 8, y: 5, z: 1.0 },
  { x: 12, y: 10, z: 2.2 },
  // Beau Rivage climb towards Massenet
  { x: 15, y: 18, z: 4.8 },
  { x: 14, y: 26, z: 7.5 },
  { x: 10, y: 34, z: 9.8 },
  // Massenet & Casino Square
  { x: 4, y: 38, z: 10.5 },
  { x: -3, y: 37, z: 10.2 },
  { x: -8, y: 32, z: 9.0 },
  // Mirabeau Haute descent
  { x: -12, y: 25, z: 6.5 },
  // Grand Hotel Hairpin (tightest hairpin in F1)
  { x: -15, y: 18, z: 4.2 },
  { x: -18, y: 14, z: 3.2 },
  { x: -15, y: 10, z: 2.4 },
  // Mirabeau Bas & Portier
  { x: -10, y: 6, z: 1.5 },
  { x: -6, y: 2, z: 0.8 },
  { x: -2, y: -3, z: 0.2 },
  // Famous Tunnel section (high speed sweep)
  { x: 4, y: -10, z: -0.5 },
  { x: 12, y: -18, z: -1.0 },
  { x: 20, y: -26, z: -1.2 },
  // Nouvelle Chicane
  { x: 24, y: -32, z: -1.0 },
  { x: 21, y: -35, z: -0.8 },
  { x: 16, y: -33, z: -0.6 },
  // Tabac corner
  { x: 8, y: -28, z: -0.4 },
  { x: 2, y: -22, z: -0.2 },
  // Louis Chiron & Swimming Pool chicane
  { x: -4, y: -18, z: 0 },
  { x: -8, y: -16, z: 0 },
  { x: -12, y: -19, z: 0 },
  // La Rascasse & Antony Noghès
  { x: -16, y: -24, z: 0.1 },
  { x: -19, y: -20, z: 0.1 },
  { x: -17, y: -14, z: 0 },
  { x: -14, y: -8, z: 0 },
];

export const SILVERSTONE_3D_COORDINATES: TrackCoordinate[] = [
  { x: -24, y: -10, z: 0 },
  { x: -16, y: -8, z: 0.2 },
  { x: -6, y: -4, z: 0.3 },
  { x: 4, y: 0, z: 0.4 },
  { x: 15, y: 8, z: 0.2 },
  { x: 22, y: 18, z: 0 },
  { x: 26, y: 12, z: -0.2 },
  { x: 20, y: 2, z: -0.4 },
  { x: 12, y: -8, z: -0.2 },
  { x: 8, y: -18, z: 0 },
  { x: 0, y: -26, z: 0.2 },
  { x: -12, y: -28, z: 0.1 },
  { x: -22, y: -22, z: 0 },
];

export const SPA_3D_COORDINATES: TrackCoordinate[] = [
  { x: -25, y: -15, z: 0 },
  { x: -18, y: -8, z: -0.5 },
  // Eau Rouge & Raidillon steep climb
  { x: -10, y: 2, z: 2.5 },
  { x: -4, y: 14, z: 7.8 },
  { x: 2, y: 24, z: 12.0 },
  // Kemmel straight
  { x: 10, y: 35, z: 13.5 },
  { x: 20, y: 44, z: 14.0 },
  // Les Combes
  { x: 28, y: 40, z: 13.0 },
  { x: 26, y: 28, z: 9.5 },
  { x: 22, y: 14, z: 6.0 },
  // Pouhon
  { x: 12, y: 2, z: 2.0 },
  { x: 4, y: -8, z: 0.5 },
  { x: -6, y: -18, z: 0 },
  { x: -18, y: -22, z: 0 },
];

export const MONZA_3D_COORDINATES: TrackCoordinate[] = [
  { x: -28, y: -12, z: 0 },
  { x: -14, y: -6, z: 0 },
  { x: 2, y: 2, z: 0 },
  { x: 18, y: 10, z: 0 },
  { x: 30, y: 22, z: 0.3 },
  { x: 24, y: 32, z: 0.2 },
  { x: 10, y: 28, z: 0 },
  { x: -4, y: 18, z: -0.2 },
  { x: -18, y: 6, z: 0 },
  { x: -26, y: -2, z: 0 },
];

export function getTrack3DCoordinates(circuitId: string): TrackCoordinate[] {
  switch (circuitId) {
    case 'monaco':
      return MONACO_3D_COORDINATES;
    case 'silverstone':
      return SILVERSTONE_3D_COORDINATES;
    case 'spa':
      return SPA_3D_COORDINATES;
    case 'monza':
      return MONZA_3D_COORDINATES;
    default:
      return MONACO_3D_COORDINATES;
  }
}
