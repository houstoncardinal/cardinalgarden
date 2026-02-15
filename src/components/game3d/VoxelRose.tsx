import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RosePlot, RoseColor, GrowthStage } from '@/types/garden';

const ROSE_COLORS: Record<RoseColor, string> = {
  red: '#DC143C',
  pink: '#FF69B4',
  white: '#FFFAF0',
  yellow: '#FFD700',
  purple: '#8B008B',
  black: '#1a1a2e',
  rainbow: '#FF6B6B',
};

const STEM_COLOR = new THREE.Color('#2E8B38');
const LEAF_COLOR = new THREE.Color('#228B22');

function VoxelSeed({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshLambertMaterial color="#8B6914" />
      </mesh>
    </group>
  );
}

function VoxelSprout({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshLambertMaterial color={STEM_COLOR} />
      </mesh>
      <mesh position={[0.15, 0.4, 0]} castShadow>
        <boxGeometry args={[0.2, 0.15, 0.1]} />
        <meshLambertMaterial color={LEAF_COLOR} />
      </mesh>
    </group>
  );
}

function VoxelBud({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.15, 0.7, 0.15]} />
        <meshLambertMaterial color={STEM_COLOR} />
      </mesh>
      <mesh position={[0.2, 0.45, 0]} castShadow>
        <boxGeometry args={[0.25, 0.2, 0.12]} />
        <meshLambertMaterial color={LEAF_COLOR} />
      </mesh>
      <mesh position={[-0.2, 0.55, 0]} castShadow>
        <boxGeometry args={[0.25, 0.2, 0.12]} />
        <meshLambertMaterial color={LEAF_COLOR} />
      </mesh>
      {/* Closed bud */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.3, 0.25, 0.3]} />
        <meshLambertMaterial color={color} />
      </mesh>
    </group>
  );
}

function VoxelBloom({ color, isRainbow }: { color: string; isRainbow: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  const petalColor = useMemo(() => {
    if (isRainbow) return new THREE.Color().setHSL(Math.random(), 0.8, 0.6);
    return new THREE.Color(color);
  }, [color, isRainbow]);

  return (
    <group ref={groupRef}>
      {/* Stem */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.15, 1, 0.15]} />
        <meshLambertMaterial color={STEM_COLOR} />
      </mesh>
      {/* Leaves */}
      <mesh position={[0.25, 0.5, 0]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.12]} />
        <meshLambertMaterial color={LEAF_COLOR} />
      </mesh>
      <mesh position={[-0.25, 0.65, 0]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.12]} />
        <meshLambertMaterial color={LEAF_COLOR} />
      </mesh>
      {/* Flower - voxel cross pattern */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.4, 0.35, 0.4]} />
        <meshLambertMaterial color={petalColor} />
      </mesh>
      {[[-0.35, 0], [0.35, 0], [0, -0.35], [0, 0.35]].map(([dx, dz], i) => (
        <mesh key={i} position={[dx, 1.05, dz]} castShadow>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshLambertMaterial color={petalColor} />
        </mesh>
      ))}
      {/* Center */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.2, 0.15, 0.2]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}

// Water particles floating above watered plants
function WaterIndicator() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = 1.6 + Math.sin(clock.getElapsedTime() * 3) * 0.1;
      const mat = ref.current.material as THREE.MeshLambertMaterial;
      mat.opacity = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.3;
    }
  });
  return (
    <mesh ref={ref} position={[0, 1.6, 0]}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshLambertMaterial color="#3498db" transparent opacity={0.6} />
    </mesh>
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
      groupRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 10) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {plot.stage === 'seed' && <VoxelSeed color={color} />}
      {plot.stage === 'sprout' && <VoxelSprout color={color} />}
      {plot.stage === 'bud' && <VoxelBud color={color} />}
      {plot.stage === 'bloom' && <VoxelBloom color={color} isRainbow={plot.color === 'rainbow'} />}
      {plot.watered && <WaterIndicator />}
    </group>
  );
}
