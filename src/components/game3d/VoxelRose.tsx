import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RosePlot, RoseColor } from '@/types/garden';

const ROSE_COLORS: Record<RoseColor, string> = {
  red: '#DC143C',
  pink: '#FF69B4',
  white: '#FFFAF0',
  yellow: '#FFD700',
  purple: '#8B008B',
  black: '#1a1a2e',
  rainbow: '#FF6B6B',
};

const STEM_COLOR = '#2E8B38';
const LEAF_COLOR = '#228B22';

function VoxelSeed() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = 0.15 + Math.sin(clock.getElapsedTime() * 2) * 0.02;
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshStandardMaterial color="#8B6914" roughness={0.8} />
      </mesh>
      {/* Tiny sprout hint */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[0.08, 0.1, 0.08]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.7} />
      </mesh>
    </group>
  );
}

function VoxelSprout({ color }: { color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.5) * 0.05;
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color={STEM_COLOR} roughness={0.7} />
      </mesh>
      <mesh position={[0.18, 0.4, 0]} castShadow rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.22, 0.12, 0.08]} />
        <meshStandardMaterial color={LEAF_COLOR} roughness={0.6} />
      </mesh>
      <mesh position={[-0.15, 0.5, 0.05]} castShadow rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.18, 0.1, 0.07]} />
        <meshStandardMaterial color="#1e7e1e" roughness={0.6} />
      </mesh>
    </group>
  );
}

function VoxelBud({ color }: { color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 1.2) * 0.03;
      // Subtle "breathing" scale on the bud
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.03;
      ref.current.scale.set(scale, scale, scale);
    }
  });
  return (
    <group ref={ref}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.12, 0.8, 0.12]} />
        <meshStandardMaterial color={STEM_COLOR} roughness={0.7} />
      </mesh>
      {/* Leaves */}
      <mesh position={[0.22, 0.45, 0]} castShadow rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.28, 0.15, 0.1]} />
        <meshStandardMaterial color={LEAF_COLOR} roughness={0.6} />
      </mesh>
      <mesh position={[-0.2, 0.6, 0.05]} castShadow rotation={[0.1, 0, -0.3]}>
        <boxGeometry args={[0.25, 0.13, 0.09]} />
        <meshStandardMaterial color="#1a6b1a" roughness={0.6} />
      </mesh>
      {/* Bud with glow */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.4} emissive={color} emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color={color} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function VoxelBloom({ color, isRainbow }: { color: string; isRainbow: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.15;
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.02;
    }
    if (glowRef.current && isRainbow) {
      const hue = (clock.getElapsedTime() * 0.1) % 1;
      glowRef.current.color.setHSL(hue, 0.8, 0.6);
    }
  });

  const petalColor = useMemo(() => {
    return new THREE.Color(color);
  }, [color]);

  return (
    <group ref={groupRef}>
      {/* Stem with thorns */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.12, 1.1, 0.12]} />
        <meshStandardMaterial color={STEM_COLOR} roughness={0.7} />
      </mesh>
      {/* Thorns */}
      {[0.3, 0.5, 0.7].map((y, i) => (
        <mesh key={i} position={[0.1 * (i % 2 === 0 ? 1 : -1), y, 0]} castShadow>
          <boxGeometry args={[0.06, 0.06, 0.06]} />
          <meshStandardMaterial color="#1a5c1a" roughness={0.6} />
        </mesh>
      ))}
      {/* Leaves */}
      <mesh position={[0.25, 0.5, 0]} castShadow rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.3, 0.18, 0.1]} />
        <meshStandardMaterial color={LEAF_COLOR} roughness={0.6} />
      </mesh>
      <mesh position={[-0.25, 0.7, 0.05]} castShadow rotation={[0.1, 0, -0.25]}>
        <boxGeometry args={[0.28, 0.16, 0.09]} />
        <meshStandardMaterial color="#1e6e1e" roughness={0.6} />
      </mesh>
      {/* Flower head - multi-layer petals */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.45, 0.35, 0.45]} />
        <meshStandardMaterial color={petalColor} roughness={0.3} emissive={petalColor} emissiveIntensity={0.2} />
      </mesh>
      {/* Outer petals */}
      {[
        [-0.35, 0, 0], [0.35, 0, 0], [0, 0, -0.35], [0, 0, 0.35],
        [-0.25, 0, -0.25], [0.25, 0, -0.25], [-0.25, 0, 0.25], [0.25, 0, 0.25],
      ].map(([dx, _, dz], i) => (
        <mesh key={i} position={[dx, 1.1, dz]} castShadow>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <meshStandardMaterial
            color={petalColor}
            roughness={0.35}
            emissive={petalColor}
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
      {/* Center stamen */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[0.18, 0.12, 0.18]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.4} roughness={0.3} />
      </mesh>
      {/* Glow light */}
      <pointLight ref={glowRef} position={[0, 1.2, 0]} intensity={0.5} distance={3} color={color} />
    </group>
  );
}

function WaterIndicator() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.children.forEach((child, i) => {
        child.position.y = 1.5 + Math.sin(t * 3 + i * 1.5) * 0.2;
        child.position.x = Math.sin(t * 2 + i * 2) * 0.15;
        child.position.z = Math.cos(t * 2 + i * 2) * 0.15;
      });
    }
  });
  return (
    <group ref={ref}>
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[0, 1.5, 0]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.7} emissive="#3498db" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

interface Props {
  plot: RosePlot;
  position: [number, number, number];
  isPickingOrWatering: boolean;
}

export function VoxelRose({ plot, position, isPickingOrWatering }: Props) {
  const color = ROSE_COLORS[plot.color];
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current && isPickingOrWatering) {
      const t = clock.getElapsedTime();
      groupRef.current.scale.y = 1 + Math.sin(t * 12) * 0.15;
      groupRef.current.scale.x = 1 + Math.sin(t * 10) * 0.05;
    } else if (groupRef.current) {
      groupRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {plot.stage === 'seed' && <VoxelSeed />}
      {plot.stage === 'sprout' && <VoxelSprout color={color} />}
      {plot.stage === 'bud' && <VoxelBud color={color} />}
      {plot.stage === 'bloom' && <VoxelBloom color={color} isRainbow={plot.color === 'rainbow'} />}
      {plot.watered && <WaterIndicator />}
    </group>
  );
}
