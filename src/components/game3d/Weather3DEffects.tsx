import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Weather } from '@/types/garden';

function RainParticles() {
  const count = 1500;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50 + 10;
      pos[i * 3 + 1] = Math.random() * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50 + 10;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const camPos = state.camera.position;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= 20 * delta;
      // Wind drift
      pos[i * 3] += Math.sin(i * 0.01) * 0.02;
      if (pos[i * 3 + 1] < -1) {
        pos[i * 3 + 1] = 30;
        pos[i * 3] = camPos.x + (Math.random() - 0.5) * 40;
        pos[i * 3 + 2] = camPos.z + (Math.random() - 0.5) * 40;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#8899bb" size={0.06} transparent opacity={0.5} />
    </points>
  );
}

// Lightning flash effect
function Lightning() {
  const ref = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    // Random lightning flashes
    const flash = Math.sin(t * 17.3) * Math.sin(t * 23.7);
    ref.current.intensity = flash > 0.95 ? 50 : 0;
  });

  return <pointLight ref={ref} position={[20, 40, 20]} color="#FFFFFF" distance={100} />;
}

function SunshineParticles() {
  const count = 300;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40 + 10;
      pos[i * 3 + 1] = Math.random() * 20 + 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 + 10;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= (Math.sin(t * 0.5 + i * 0.3) * 0.02 + 0.01) * 0.3;
      if (pos[i * 3 + 1] < 1) pos[i * 3 + 1] = 20 + Math.random() * 5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.3 + Math.sin(t * 0.5) * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#FFD700" size={0.12} transparent opacity={0.4} />
    </points>
  );
}

// Cloud system
function Clouds({ weather }: { weather: Weather }) {
  const groupRef = useRef<THREE.Group>(null);

  const clouds = useMemo(() => {
    const count = weather === 'rainy' ? 20 : weather === 'sunny' ? 5 : 12;
    return Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * 80 + 10,
      y: 25 + Math.random() * 10,
      z: (Math.random() - 0.5) * 80 + 10,
      scale: 2 + Math.random() * 4,
      speed: 0.3 + Math.random() * 0.5,
    }));
  }, [weather]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((cloud, i) => {
      cloud.position.x += clouds[i].speed * 0.01;
      if (cloud.position.x > 60) cloud.position.x = -40;
    });
  });

  const cloudColor = weather === 'rainy' ? '#555' : '#fff';
  const opacity = weather === 'rainy' ? 0.9 : 0.7;

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]}>
          {/* Multi-block clouds */}
          {[0, 1, -1, 0.5, -0.5].map((dx, j) => (
            <mesh key={j} position={[dx * c.scale * 0.4, Math.random() * 0.5, Math.random() * c.scale * 0.3]}>
              <boxGeometry args={[c.scale * 0.5, c.scale * 0.25, c.scale * 0.4]} />
              <meshStandardMaterial color={cloudColor} transparent opacity={opacity} roughness={1} />
            </mesh>
          ))}
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
          <Lightning />
        </>
      )}
      {weather === 'sunny' && <SunshineParticles />}
    </>
  );
}
