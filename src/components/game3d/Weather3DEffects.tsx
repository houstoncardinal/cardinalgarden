import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Weather } from '@/types/garden';

function RainParticles() {
  const count = 500;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = Math.random() * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= 15 * delta;
      if (pos[i * 3 + 1] < -1) {
        pos[i * 3 + 1] = 20;
        pos[i * 3] = (Math.random() - 0.5) * 30 + 10;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 30 + 10;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#6699CC" size={0.08} transparent opacity={0.6} />
    </points>
  );
}

function SunshineParticles() {
  const count = 100;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30 + 10;
      pos[i * 3 + 1] = Math.random() * 15 + 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 + 10;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= 0.5 * Math.sin(t + i) * 0.02;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.3 + Math.sin(t * 0.5) * 0.2;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#FFD700" size={0.15} transparent opacity={0.4} />
    </points>
  );
}

export function Weather3DEffects({ weather }: { weather: Weather }) {
  return (
    <>
      {weather === 'rainy' && <RainParticles />}
      {weather === 'sunny' && <SunshineParticles />}
    </>
  );
}
