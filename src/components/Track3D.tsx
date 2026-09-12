import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { TrackCoordinate } from "../types";

export interface Track3DProps {
  trackCoordinates?: TrackCoordinate[];
  progressD1?: number;
  progressD2?: number;
}

export default function Track3D({
  trackCoordinates = [],
  progressD1 = 0,
  progressD2 = 0,
}: Track3DProps) {
  const carD1Ref = useRef<THREE.Mesh>(null!);
  const carD2Ref = useRef<THREE.Mesh>(null!);

  // 1. Build a smooth 3D spline curve from FastF1 telemetry points
  const curve = useMemo(() => {
    if (!trackCoordinates || !trackCoordinates.length) {
      // Fallback loop if data is still fetching
      return new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(-15, 0, -10),
          new THREE.Vector3(0, 0.5, -18),
          new THREE.Vector3(18, 0, -6),
          new THREE.Vector3(12, -0.2, 14),
          new THREE.Vector3(-10, 0, 10),
        ],
        true
      );
    }

    // Auto-scale depending on whether coordinates are raw meters (1000m+) or pre-scaled
    const maxVal = Math.max(
      ...trackCoordinates.map((pt) => Math.max(Math.abs(pt.x), Math.abs(pt.y)))
    );
    const scaleFactor = maxVal > 100 ? 0.04 : 0.25;

    const points = trackCoordinates.map(
      (pt) =>
        new THREE.Vector3(
          pt.x * scaleFactor,
          (pt.z || 0) * scaleFactor * 1.5,
          pt.y * scaleFactor
        )
    );

    return new THREE.CatmullRomCurve3(points, true, "centripetal");
  }, [trackCoordinates]);

  // 2. Extrude track geometry
  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 300, 0.35, 8, true);
  }, [curve]);

  // 3. Frame-by-frame interpolation for driver markers
  useFrame(() => {
    if (curve) {
      // Clamp progress between 0 and 1
      const p1 = Math.min(Math.max(progressD1 % 1, 0), 1);
      const p2 = Math.min(Math.max(progressD2 % 1, 0), 1);

      // Position Driver 1
      const pos1 = curve.getPointAt(p1);
      if (carD1Ref.current) carD1Ref.current.position.copy(pos1);

      // Position Driver 2
      const pos2 = curve.getPointAt(p2);
      if (carD2Ref.current) carD2Ref.current.position.copy(pos2);
    }
  });

  return (
    <group>
      {/* Extruded Track Surface */}
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial
          color="#1e242d"
          roughness={0.4}
          metalness={0.7}
          emissive="#090d14"
        />
      </mesh>

      {/* Track Centerline Glow */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial color="#ef4444" wireframe transparent opacity={0.15} />
      </mesh>

      {/* Driver 1 Marker (Red Pulsing Node) */}
      <mesh ref={carD1Ref}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ff1e1e"
          emissiveIntensity={3}
          roughness={0.1}
        />
      </mesh>

      {/* Driver 2 Marker (Cyan Node) */}
      <mesh ref={carD2Ref}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial
          color="#00f2fe"
          emissive="#00f2fe"
          emissiveIntensity={2.5}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}
export { Track3D };
