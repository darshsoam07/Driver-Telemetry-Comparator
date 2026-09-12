import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Environment, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import Track3D from "./Track3D";
import { TrackCoordinate } from "../types";

export function CameraRig() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);

  useFrame((state) => {
    if (!cameraRef.current) return;
    // Subtle mouse parallax tilt
    const mouseX = state.mouse.x * 2.5;
    const mouseY = state.mouse.y * 1.5;

    cameraRef.current.position.x = THREE.MathUtils.lerp(
      cameraRef.current.position.x,
      mouseX,
      0.05
    );
    cameraRef.current.position.y = THREE.MathUtils.lerp(
      cameraRef.current.position.y,
      4 + mouseY,
      0.05
    );
    cameraRef.current.lookAt(0, 0, -4);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 4, 18]}
      fov={45}
    />
  );
}

export interface SceneCanvasProps {
  telemetryData?: TrackCoordinate[];
  progressD1?: number;
  progressD2?: number;
  className?: string;
}

export default function SceneCanvas({
  telemetryData = [],
  progressD1 = 0,
  progressD2 = 0,
  className = "",
}: SceneCanvasProps) {
  return (
    <div
      className={`absolute inset-0 w-full h-full pointer-events-none -z-10 bg-[#07090e] ${className}`}
    >
      <Canvas gl={{ antialias: true, alpha: true }}>
        <CameraRig />

        {/* Ambient & Spotlight Mood */}
        <ambientLight intensity={0.4} />
        <spotLight
          position={[10, 15, 10]}
          angle={0.4}
          penumbra={1}
          intensity={2.5}
          color="#ffffff"
        />
        <pointLight position={[-10, 5, -5]} color="#ef4444" intensity={2} />

        {/* 3D Track Spline */}
        <Track3D
          trackCoordinates={telemetryData}
          progressD1={progressD1}
          progressD2={progressD2}
        />

        {/* Wet Garage Floor / Reflection Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
          <planeGeometry args={[120, 120]} />
          <MeshReflectorMaterial
            blur={[400, 100]}
            resolution={1024}
            mirror={0.6}
            mixBlur={0.8}
            mixStrength={1.5}
            roughness={0.3}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#090b10"
            metalness={0.8}
          />
        </mesh>

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
export { SceneCanvas };
