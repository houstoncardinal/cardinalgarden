import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CHUNK_SIZE = 24;

// Instanced terrain for performance
export function VoxelTerrain() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { count, matrices, colors } = useMemo(() => {
    const blocks: { pos: THREE.Vector3; color: THREE.Color }[] = [];

    const GRASS_COLORS = [
      new THREE.Color('#4a7c3f'), new THREE.Color('#5a9c4f'), new THREE.Color('#3d6b34'),
      new THREE.Color('#4e8843'), new THREE.Color('#568f4a'),
    ];
    const DIRT = new THREE.Color('#7a5c2e');
    const STONE = new THREE.Color('#6b6b6b');
    const SAND = new THREE.Color('#c2a86b');

    for (let x = -5; x < CHUNK_SIZE + 5; x++) {
      for (let z = -5; z < CHUNK_SIZE + 5; z++) {
        const nx = x * 0.08; const nz = z * 0.08;
        const height = Math.floor(
          Math.sin(nx * 3.7 + nz * 1.3) * 0.8 +
          Math.cos(nz * 2.9 + nx * 0.7) * 0.6 +
          Math.sin((nx + nz) * 2.1) * 0.4
        );

        // Near water? Use sand
        const nearWater = (x >= 13 && x <= 18 && z >= 13 && z <= 18);
        const grassColor = nearWater ? SAND : GRASS_COLORS[Math.abs((x * 7 + z * 13) % GRASS_COLORS.length)];

        blocks.push({ pos: new THREE.Vector3(x, height, z), color: grassColor });
        blocks.push({ pos: new THREE.Vector3(x, height - 1, z), color: DIRT });
        blocks.push({ pos: new THREE.Vector3(x, height - 2, z), color: DIRT });
        blocks.push({ pos: new THREE.Vector3(x, height - 3, z), color: STONE });
      }
    }

    const count = blocks.length;
    const matrices = new Float32Array(count * 16);
    const colors = new Float32Array(count * 3);
    const mat = new THREE.Matrix4();

    blocks.forEach((b, i) => {
      mat.makeTranslation(b.pos.x, b.pos.y, b.pos.z);
      mat.toArray(matrices, i * 16);
      colors[i * 3] = b.color.r;
      colors[i * 3 + 1] = b.color.g;
      colors[i * 3 + 2] = b.color.b;
    });

    return { count, matrices, colors };
  }, []);

  useMemo(() => {
    if (!meshRef.current) return;
    const mat = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      mat.fromArray(matrices, i * 16);
      meshRef.current.setMatrixAt(i, mat);
      meshRef.current.setColorAt(i, new THREE.Color(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]));
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [count, matrices, colors]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.9} metalness={0.0} />
    </instancedMesh>
  );
}

export function GardenPlots({ plotCount }: { plotCount: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const positions = useMemo(() => {
    const cols = 5;
    return Array.from({ length: plotCount }, (_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      return new THREE.Vector3(col * 2 + 3, 1, row * 2 + 3);
    });
  }, [plotCount]);

  useMemo(() => {
    if (!meshRef.current) return;
    const mat = new THREE.Matrix4();
    const soilColors = [new THREE.Color('#5a3a1a'), new THREE.Color('#6B4226'), new THREE.Color('#7a4e30')];
    positions.forEach((pos, i) => {
      mat.makeTranslation(pos.x, pos.y, pos.z);
      meshRef.current!.setMatrixAt(i, mat);
      meshRef.current!.setColorAt(i, soilColors[i % soilColors.length]);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [positions]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, plotCount]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={1} metalness={0} />
    </instancedMesh>
  );
}

// Trees with randomized height and canopy
export function VoxelTrees() {
  const trees = useMemo(() => {
    const positions: { pos: [number, number, number]; height: number; canopySize: number }[] = [
      { pos: [0, 1, 0], height: 5, canopySize: 2 },
      { pos: [-3, 1, 5], height: 6, canopySize: 2 },
      { pos: [-4, 1, 12], height: 4, canopySize: 2 },
      { pos: [20, 1, 2], height: 7, canopySize: 3 },
      { pos: [22, 1, 10], height: 5, canopySize: 2 },
      { pos: [-2, 1, 19], height: 6, canopySize: 2 },
      { pos: [21, 1, 18], height: 5, canopySize: 2 },
      { pos: [23, 1, 5], height: 4, canopySize: 2 },
      { pos: [-3, 1, -2], height: 6, canopySize: 3 },
      { pos: [10, 1, -3], height: 5, canopySize: 2 },
      { pos: [22, 1, -2], height: 7, canopySize: 3 },
      { pos: [-4, 1, 22], height: 5, canopySize: 2 },
    ];
    return positions;
  }, []);

  return (
    <group>
      {trees.map((tree, i) => (
        <VoxelTree key={i} position={tree.pos} height={tree.height} canopySize={tree.canopySize} seed={i} />
      ))}
    </group>
  );
}

function VoxelTree({ position, height, canopySize, seed }: {
  position: [number, number, number]; height: number; canopySize: number; seed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Gentle sway
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.3 + seed) * 0.02;
    }
  });

  const TRUNK = '#5C3317';
  const leafColors = ['#1a5c1a', '#2D5A1E', '#3D7A2E', '#2a6e2a', '#1e4d1e'];

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: height }).map((_, y) => (
        <mesh key={`t${y}`} position={[0, y, 0]} castShadow>
          <boxGeometry args={[0.6, 1, 0.6]} />
          <meshStandardMaterial color={TRUNK} roughness={0.95} />
        </mesh>
      ))}
      {/* Canopy */}
      {Array.from({ length: canopySize * 2 + 1 }).flatMap((_, dx) =>
        Array.from({ length: canopySize * 2 + 1 }).flatMap((_, dz) =>
          [0, 1].map(dy => {
            const x = dx - canopySize;
            const z = dz - canopySize;
            const dist = Math.abs(x) + Math.abs(z);
            if (dist > canopySize + 1) return null;
            if (dist === canopySize + 1 && Math.random() > 0.4) return null;
            const colorIdx = (Math.abs(x * 3 + z * 7 + dy * 5 + seed) % leafColors.length);
            return (
              <mesh key={`l${x}${z}${dy}`} position={[x, height + dy, z]} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={leafColors[colorIdx]} roughness={0.8} />
              </mesh>
            );
          })
        )
      )}
      {/* Top */}
      <mesh position={[0, height + 2, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#2D5A1E" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Animated water with reflections
export function VoxelWater({ timeOfDay }: { timeOfDay: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = -0.2 + Math.sin(clock.getElapsedTime() * 0.7) * 0.08;
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      const nightFactor = Math.max(0, Math.sin(timeOfDay * Math.PI * 2));
      mat.color.setHSL(0.58, 0.5, 0.3 + nightFactor * 0.25);
    }
  });

  return (
    <group>
      <mesh ref={ref} position={[15.5, -0.2, 15.5]} receiveShadow>
        <boxGeometry args={[5, 0.4, 5]} />
        <meshStandardMaterial color="#2980b9" transparent opacity={0.75} roughness={0.1} metalness={0.3} />
      </mesh>
      {/* Water edge blocks */}
      {[[-1, 0], [5, 0], [0, -1], [0, 5], [5, 5], [-1, 5], [5, -1], [-1, -1]].map(([dx, dz], i) => (
        <mesh key={i} position={[13 + dx, 0, 13 + dz]} castShadow>
          <boxGeometry args={[1, 0.5, 1]} />
          <meshStandardMaterial color="#c2a86b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export function VoxelFence() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const count = useMemo(() => {
    let c = 0;
    for (let i = 1; i <= 13; i++) { c += 4; } // sides * 2 height
    for (let i = 2; i <= 12; i++) { c += 4; }
    return c;
  }, []);

  useMemo(() => {
    if (!meshRef.current) return;
    const mat = new THREE.Matrix4();
    const color = new THREE.Color('#8B7355');
    let idx = 0;
    const addPost = (x: number, y: number, z: number) => {
      mat.makeTranslation(x, y, z);
      meshRef.current!.setMatrixAt(idx, mat);
      meshRef.current!.setColorAt(idx, color);
      idx++;
    };
    for (let i = 1; i <= 13; i++) {
      addPost(1, 1, i); addPost(1, 2, i);
      addPost(13, 1, i); addPost(13, 2, i);
    }
    for (let i = 2; i <= 12; i++) {
      addPost(i, 1, 1); addPost(i, 2, 1);
      addPost(i, 1, 13); addPost(i, 2, 13);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [count]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <boxGeometry args={[0.3, 1, 0.3]} />
      <meshStandardMaterial roughness={0.85} />
    </instancedMesh>
  );
}

// Decorations that players can place
export interface Decoration {
  id: string;
  type: string;
  position: [number, number, number];
}

const DECO_MODELS: Record<string, { emoji: string; build: () => JSX.Element }> = {
  lantern: {
    emoji: '🏮',
    build: () => (
      <group>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.3, 0.6, 0.3]} />
          <meshStandardMaterial color="#4a3728" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[0.5, 0.4, 0.5]} />
          <meshStandardMaterial color="#FFD700" emissive="#FF8C00" emissiveIntensity={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[0.35, 0.15, 0.35]} />
          <meshStandardMaterial color="#4a3728" roughness={0.8} />
        </mesh>
        <pointLight position={[0, 0.8, 0]} intensity={2} distance={6} color="#FF8C00" />
      </group>
    ),
  },
  gnome: {
    emoji: '🧙',
    build: () => (
      <group>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.4, 0.5, 0.3]} />
          <meshStandardMaterial color="#c0392b" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.35, 0.3, 0.3]} />
          <meshStandardMaterial color="#fad7a0" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.9, 0]} castShadow>
          <coneGeometry args={[0.2, 0.4, 4]} />
          <meshStandardMaterial color="#e74c3c" roughness={0.5} />
        </mesh>
      </group>
    ),
  },
  fountain: {
    emoji: '⛲',
    build: () => (
      <group>
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.8, 0.9, 0.3, 8]} />
          <meshStandardMaterial color="#7f8c8d" roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.7, 6]} />
          <meshStandardMaterial color="#95a5a6" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.2, 8]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.6} roughness={0.1} />
        </mesh>
        <pointLight position={[0, 0.6, 0]} intensity={0.5} distance={4} color="#87CEEB" />
      </group>
    ),
  },
  mushroom: {
    emoji: '🍄',
    build: () => (
      <group>
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.15, 0.4, 0.15]} />
          <meshStandardMaterial color="#f5f5dc" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.5, 0.25, 0.5]} />
          <meshStandardMaterial color="#e74c3c" roughness={0.6} />
        </mesh>
        <mesh position={[0.12, 0.55, 0.12]} castShadow>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="#FFFAF0" roughness={0.5} />
        </mesh>
        <mesh position={[-0.1, 0.55, -0.08]} castShadow>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial color="#FFFAF0" roughness={0.5} />
        </mesh>
      </group>
    ),
  },
  bench: {
    emoji: '🪑',
    build: () => (
      <group>
        {/* Legs */}
        {[[-0.3, 0], [0.3, 0]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.2, z]} castShadow>
            <boxGeometry args={[0.1, 0.4, 0.5]} />
            <meshStandardMaterial color="#5C3317" roughness={0.85} />
          </mesh>
        ))}
        {/* Seat */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.8, 0.08, 0.5]} />
          <meshStandardMaterial color="#8B6914" roughness={0.8} />
        </mesh>
        {/* Back */}
        <mesh position={[0, 0.7, -0.2]} castShadow>
          <boxGeometry args={[0.8, 0.5, 0.08]} />
          <meshStandardMaterial color="#8B6914" roughness={0.8} />
        </mesh>
      </group>
    ),
  },
};

export function PlacedDecorations({ decorations }: { decorations: Decoration[] }) {
  return (
    <group>
      {decorations.map(deco => {
        const model = DECO_MODELS[deco.type];
        if (!model) return null;
        return (
          <group key={deco.id} position={deco.position}>
            {model.build()}
          </group>
        );
      })}
    </group>
  );
}

export const DECORATION_TYPES = Object.entries(DECO_MODELS).map(([key, val]) => ({
  type: key,
  emoji: val.emoji,
  name: key.charAt(0).toUpperCase() + key.slice(1),
}));

// Floating particles (ambient)
export function AmbientParticles({ timeOfDay }: { timeOfDay: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40 + 10;
      pos[i * 3 + 1] = Math.random() * 15 + 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 + 10;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      pos[i * 3] += Math.sin(t * 0.1 + i) * 0.003;
      pos[i * 3 + 1] += Math.sin(t * 0.3 + i * 0.7) * 0.005;
      pos[i * 3 + 2] += Math.cos(t * 0.15 + i * 0.5) * 0.003;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  const isNight = timeOfDay > 0.7 || timeOfDay < 0.25;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color={isNight ? '#FFFACD' : '#FFFAF0'}
        size={isNight ? 0.12 : 0.06}
        transparent
        opacity={isNight ? 0.8 : 0.3}
      />
    </points>
  );
}

// Stars for nighttime
export function Stars({ timeOfDay }: { timeOfDay: number }) {
  const count = 500;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      const r = 80;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) + 10;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.PointsMaterial;
    const nightAmount = timeOfDay > 0.7 ? (timeOfDay - 0.7) / 0.3 : timeOfDay < 0.25 ? 1 - timeOfDay / 0.25 : 0;
    mat.opacity = nightAmount * 0.9;
    mat.size = 0.2 + Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#FFFFFF" size={0.2} transparent opacity={0} />
    </points>
  );
}
