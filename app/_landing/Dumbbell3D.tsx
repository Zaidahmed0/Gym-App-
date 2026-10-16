"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Environment, Lightformer, ContactShadows } from "@react-three/drei";
import type { Group } from "three";

function Plate({ x, radius, width }: { x: number; radius: number; width: number }) {
  return (
    <mesh position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[radius, radius, width, 64]} />
      <meshStandardMaterial color="#121212" metalness={0.7} roughness={0.3} />
    </mesh>
  );
}

function Dumbbell({ accent }: { accent: string }) {
  const ref = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.25;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
  });

  return (
    <group ref={ref} rotation={[0.3, 0.6, 0.2]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 3.4, 32]} />
        <meshStandardMaterial color="#d4d4d8" metalness={1} roughness={0.15} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 1.2, 32]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.8} roughness={0.6} />
      </mesh>

      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[0.72 * s, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.14, 32]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} metalness={0.4} roughness={0.3} />
          </mesh>
          <Plate x={0.95 * s} radius={0.78} width={0.2} />
          <Plate x={1.18 * s} radius={0.62} width={0.18} />
          <Plate x={1.38 * s} radius={0.46} width={0.14} />
          <mesh position={[0.85 * s, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.79, 0.022, 16, 120]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function Dumbbell3D({ accent = "#D4F75C" }: { accent?: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 5.2], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <pointLight position={[-3, -2, 2]} intensity={25} color={accent} />
      <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
        <Dumbbell accent={accent} />
      </Float>
      <ContactShadows position={[0, -1.7, 0]} opacity={0.55} scale={8} blur={2.5} far={3} color="#000000" />
      <Environment resolution={256}>
        <Lightformer intensity={3} position={[0, 4, -6]} scale={[10, 2, 1]} />
        <Lightformer intensity={2} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer intensity={2} color={accent} position={[5, -1, -1]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
      </Environment>
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}