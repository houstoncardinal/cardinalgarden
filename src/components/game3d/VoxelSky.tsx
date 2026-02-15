import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sky } from '@react-three/drei';
import type { Weather } from '@/types/garden';

interface Props {
  weather: Weather;
  timeOfDay: number; // 0-1, 0=midnight, 0.5=noon
}

export function VoxelSky({ weather, timeOfDay }: Props) {
  // Sun position orbits based on time of day
  const sunAngle = timeOfDay * Math.PI * 2 - Math.PI / 2;
  const sunHeight = Math.sin(sunAngle) * 80;
  const sunX = Math.cos(sunAngle) * 60;

  const sunPosition: [number, number, number] = [sunX, Math.max(-20, sunHeight), 30];

  const isNight = timeOfDay > 0.75 || timeOfDay < 0.2;
  const isDusk = (timeOfDay > 0.65 && timeOfDay <= 0.75) || (timeOfDay >= 0.2 && timeOfDay < 0.3);

  const turbidity = weather === 'rainy' ? 20 : isDusk ? 10 : isNight ? 1 : weather === 'sunny' ? 2 : 5;
  const rayleigh = weather === 'rainy' ? 0.1 : isNight ? 0 : isDusk ? 4 : weather === 'sunny' ? 3 : 1.5;
  const mieCoefficient = isDusk ? 0.02 : 0.005;

  return (
    <>
      <Sky
        sunPosition={sunPosition}
        turbidity={turbidity}
        rayleigh={rayleigh}
        mieCoefficient={mieCoefficient}
        mieDirectionalG={0.8}
      />
      {/* Moon at night */}
      {isNight && (
        <mesh position={[-sunX, Math.abs(sunHeight) * 0.6 + 30, -20]}>
          <sphereGeometry args={[2, 16, 16]} />
          <meshStandardMaterial color="#f5f5dc" emissive="#f5f5dc" emissiveIntensity={0.8} />
        </mesh>
      )}
    </>
  );
}
