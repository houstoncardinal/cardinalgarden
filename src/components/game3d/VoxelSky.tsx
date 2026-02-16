import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sky } from '@react-three/drei';
import type { Weather } from '@/types/garden';

interface Props {
  weather: Weather;
  timeOfDay: number;
}

export function VoxelSky({ weather, timeOfDay }: Props) {
  const sunAngle = timeOfDay * Math.PI * 2 - Math.PI / 2;
  const sunHeight = Math.sin(sunAngle) * 80;
  const sunX = Math.cos(sunAngle) * 60;

  const sunPosition: [number, number, number] = [sunX, Math.max(-20, sunHeight), 30];

  const isNight = timeOfDay > 0.75 || timeOfDay < 0.2;
  const isDusk = (timeOfDay > 0.65 && timeOfDay <= 0.75) || (timeOfDay >= 0.2 && timeOfDay < 0.3);

  const turbidity = weather === 'rainy' ? 20 : isDusk ? 12 : isNight ? 1 : weather === 'sunny' ? 2.5 : 5;
  const rayleigh = weather === 'rainy' ? 0.1 : isNight ? 0 : isDusk ? 5 : weather === 'sunny' ? 3.5 : 1.5;
  const mieCoefficient = isDusk ? 0.025 : weather === 'sunny' ? 0.008 : 0.005;

  return (
    <>
      <Sky
        sunPosition={sunPosition}
        turbidity={turbidity}
        rayleigh={rayleigh}
        mieCoefficient={mieCoefficient}
        mieDirectionalG={0.85}
      />
      {/* Moon */}
      {isNight && (
        <group position={[-sunX, Math.abs(sunHeight) * 0.6 + 30, -20]}>
          <mesh>
            <sphereGeometry args={[2.5, 16, 16]} />
            <meshStandardMaterial color="#e8e8d0" emissive="#e8e8d0" emissiveIntensity={0.9} />
          </mesh>
          {/* Moon glow */}
          <mesh>
            <sphereGeometry args={[4, 16, 16]} />
            <meshBasicMaterial color="#aaaacc" transparent opacity={0.08} />
          </mesh>
        </group>
      )}
      {/* Sun glow during golden hour */}
      {isDusk && !isNight && (
        <mesh position={sunPosition}>
          <sphereGeometry args={[6, 16, 16]} />
          <meshBasicMaterial color="#ff6633" transparent opacity={0.06} />
        </mesh>
      )}
    </>
  );
}
