import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Weather } from '@/types/garden';

function RainParticles() {
  const count = 2500;
  const ref = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60 + 10;
      pos[i * 3 + 1] = Math.random() * 35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60 + 10;
      vel[i] = 18 + Math.random() * 8;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const camPos = state.camera.position;
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= velocities[i] * delta;
      pos[i * 3] += Math.sin(t * 0.5 + i * 0.003) * 0.04; // wind
      pos[i * 3 + 2] += Math.cos(t * 0.3 + i * 0.005) * 0.02;
      if (pos[i * 3 + 1] < -1) {
        pos[i * 3 + 1] = 35;
        pos[i * 3] = camPos.x + (Math.random() - 0.5) * 50;
        pos[i * 3 + 2] = camPos.z + (Math.random() - 0.5) * 50;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#8899bb" size={0.08} transparent opacity={0.55} />
    </points>
  );
}

// Rain splash particles on ground
function RainSplash() {
  const count = 200;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40 + 10;
      pos[i * 3 + 1] = 0.5 + Math.random() * 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 + 10;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      const phase = (t * 5 + i * 0.37) % 1;
      pos[i * 3 + 1] = 0.3 + phase * 0.8;
      if (phase > 0.9) {
        pos[i * 3] = (Math.random() - 0.5) * 40 + 10;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 40 + 10;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.2 + Math.sin(t * 3) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#aabbdd" size={0.15} transparent opacity={0.3} />
    </points>
  );
}

function Lightning() {
  const ref = useRef<THREE.PointLight>(null);
  const ambRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const flash = Math.sin(t * 17.3) * Math.sin(t * 23.7) * Math.sin(t * 31.1);
    const intensity = flash > 0.92 ? 80 : 0;
    ref.current.intensity = intensity;
    if (ambRef.current) ambRef.current.intensity = intensity * 0.3;
  });

  return (
    <>
      <pointLight ref={ref} position={[20, 45, 20]} color="#EEEEFF" distance={120} />
      <pointLight ref={ambRef} position={[10, 40, 15]} color="#CCCCFF" distance={80} />
    </>
  );
}

function SunshineParticles() {
  const count = 500;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50 + 10;
      pos[i * 3 + 1] = Math.random() * 25 + 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50 + 10;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += Math.sin(t * 0.1 + i * 0.2) * 0.005;
      pos[i * 3 + 1] -= (Math.sin(t * 0.4 + i * 0.3) * 0.015 + 0.005) * 0.5;
      pos[i * 3 + 2] += Math.cos(t * 0.08 + i * 0.15) * 0.005;
      if (pos[i * 3 + 1] < 1) pos[i * 3 + 1] = 25 + Math.random() * 5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.25 + Math.sin(t * 0.3) * 0.12;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#FFD700" size={0.1} transparent opacity={0.35} />
    </points>
  );
}

// God rays for sunny weather
function GodRays() {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.02;
    ref.current.children.forEach((child, i) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = 0.03 + Math.sin(t * 0.5 + i * 0.8) * 0.02;
    });
  });

  return (
    <group ref={ref} position={[10, 25, 10]}>
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 5, -12, Math.sin(angle) * 5]} rotation={[0.1, angle, 0]}>
            <planeGeometry args={[3, 25]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

// Volumetric clouds
function Clouds({ weather }: { weather: Weather }) {
  const groupRef = useRef<THREE.Group>(null);

  const clouds = useMemo(() => {
    const count = weather === 'rainy' ? 25 : weather === 'sunny' ? 8 : 15;
    return Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * 100 + 10,
      y: 28 + Math.random() * 12,
      z: (Math.random() - 0.5) * 100 + 10,
      scale: 3 + Math.random() * 5,
      speed: 0.2 + Math.random() * 0.4,
      blocks: 4 + Math.floor(Math.random() * 6),
    }));
  }, [weather]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((cloud, i) => {
      if (i < clouds.length) {
        cloud.position.x += clouds[i].speed * 0.012;
        if (cloud.position.x > 70) cloud.position.x = -50;
      }
    });
  });

  const cloudColor = weather === 'rainy' ? '#444455' : '#eeeeff';
  const opacity = weather === 'rainy' ? 0.92 : 0.75;

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]}>
          {Array.from({ length: c.blocks }).map((_, j) => {
            const dx = (j - c.blocks / 2) * c.scale * 0.35;
            const dy = Math.sin(j * 1.3) * c.scale * 0.12;
            const dz = Math.cos(j * 0.9) * c.scale * 0.25;
            const w = c.scale * (0.3 + Math.random() * 0.3);
            const h = c.scale * (0.15 + Math.random() * 0.15);
            const d = c.scale * (0.25 + Math.random() * 0.2);
            return (
              <mesh key={j} position={[dx, dy, dz]}>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color={cloudColor} transparent opacity={opacity} roughness={1} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

export function Weather3DEffects({ weather }: { weather: Weather }) {
  return (
    <>
      <Clouds weather={weather} />
      {weather === 'rainy' && (
        <>
          <RainParticles />
          <RainSplash />
          <Lightning />
        </>
      )}
      {weather === 'sunny' && (
        <>
          <SunshineParticles />
          <GodRays />
        </>
      )}
    </>
  );
}
