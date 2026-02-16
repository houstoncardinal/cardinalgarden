import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CHUNK_SIZE = 32;

// Noise-like function for terrain variation
function noise2D(x: number, z: number, seed = 0): number {
  const s = Math.sin(x * 12.9898 + z * 78.233 + seed) * 43758.5453;
  return s - Math.floor(s);
}

function fractalHeight(x: number, z: number): number {
  const nx = x * 0.06;
  const nz = z * 0.06;
  return Math.floor(
    Math.sin(nx * 3.7 + nz * 1.3) * 1.2 +
    Math.cos(nz * 2.9 + nx * 0.7) * 0.8 +
    Math.sin((nx + nz) * 2.1) * 0.5 +
    Math.sin(nx * 5.3 - nz * 3.1) * 0.3
  );
}

// Enhanced instanced terrain with biomes
export function VoxelTerrain() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { count, matrices, colors } = useMemo(() => {
    const blocks: { pos: THREE.Vector3; color: THREE.Color }[] = [];

    const GRASS_LUSH = [
      new THREE.Color('#3a6b2f'), new THREE.Color('#4a8c3f'), new THREE.Color('#2d5a24'),
      new THREE.Color('#3e7835'), new THREE.Color('#468f3a'), new THREE.Color('#559945'),
    ];
    const GRASS_DRY = [
      new THREE.Color('#6b8c3f'), new THREE.Color('#7a9c4a'), new THREE.Color('#5a7835'),
    ];
    const DIRT = [
      new THREE.Color('#6a4c1e'), new THREE.Color('#7a5c2e'), new THREE.Color('#5a3c14'),
    ];
    const STONE = [
      new THREE.Color('#5b5b5b'), new THREE.Color('#6b6b6b'), new THREE.Color('#505050'),
      new THREE.Color('#4a4a4a'),
    ];
    const SAND = [
      new THREE.Color('#c2a86b'), new THREE.Color('#d4b87a'), new THREE.Color('#b89858'),
    ];
    const DARK_STONE = new THREE.Color('#3a3a3a');
    const GRAVEL = [
      new THREE.Color('#8a8a7a'), new THREE.Color('#7a7a6a'), new THREE.Color('#6a6a5a'),
    ];

    for (let x = -8; x < CHUNK_SIZE + 8; x++) {
      for (let z = -8; z < CHUNK_SIZE + 8; z++) {
        const height = fractalHeight(x, z);

        // Biome determination
        const nearWater = (x >= 13 && x <= 20 && z >= 15 && z <= 22);
        const nearPath = (Math.abs(z - 8) < 1 && x > 0 && x < CHUNK_SIZE) ||
                         (Math.abs(x - 8) < 1 && z > 0 && z < CHUNK_SIZE);
        const isEdge = x < -3 || x > CHUNK_SIZE + 3 || z < -3 || z > CHUNK_SIZE + 3;
        const rnd = noise2D(x, z);
        const rnd2 = noise2D(x, z, 42);

        let topColor: THREE.Color;
        if (nearWater) {
          topColor = SAND[Math.abs((x * 3 + z * 7) % SAND.length)];
        } else if (nearPath) {
          topColor = GRAVEL[Math.abs((x * 5 + z * 3) % GRAVEL.length)];
        } else if (isEdge && rnd > 0.6) {
          topColor = GRASS_DRY[Math.abs((x * 7 + z * 13) % GRASS_DRY.length)];
        } else {
          topColor = GRASS_LUSH[Math.abs((x * 7 + z * 13) % GRASS_LUSH.length)];
        }

        // Surface
        blocks.push({ pos: new THREE.Vector3(x, height, z), color: topColor });
        // Sub-layers
        blocks.push({ pos: new THREE.Vector3(x, height - 1, z), color: DIRT[Math.abs((x + z) % DIRT.length)] });
        blocks.push({ pos: new THREE.Vector3(x, height - 2, z), color: DIRT[Math.abs((x * 2 + z) % DIRT.length)] });
        blocks.push({ pos: new THREE.Vector3(x, height - 3, z), color: STONE[Math.abs((x + z * 2) % STONE.length)] });
        blocks.push({ pos: new THREE.Vector3(x, height - 4, z), color: DARK_STONE });

        // Rocky outcrops at edges
        if (isEdge && rnd2 > 0.85) {
          const rockH = Math.floor(rnd * 3) + 1;
          for (let y = 1; y <= rockH; y++) {
            blocks.push({ pos: new THREE.Vector3(x, height + y, z), color: STONE[Math.abs((x * y + z) % STONE.length)] });
          }
        }
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

  useEffect(() => {
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
      <meshStandardMaterial roughness={0.85} metalness={0.02} />
    </instancedMesh>
  );
}

// Garden plots with richer soil texture
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

  useEffect(() => {
    if (!meshRef.current) return;
    const mat = new THREE.Matrix4();
    const soilColors = [new THREE.Color('#4a2a10'), new THREE.Color('#5B3216'), new THREE.Color('#6a3e20'), new THREE.Color('#3a1e08')];
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

// Wildflowers scattered across terrain
export function Wildflowers() {
  const flowers = useMemo(() => {
    const result: { pos: [number, number, number]; color: string; scale: number }[] = [];
    const colors = ['#e74c3c', '#f1c40f', '#9b59b6', '#3498db', '#e67e22', '#FF69B4', '#FFFAF0'];
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * 38 - 6;
      const z = Math.random() * 38 - 6;
      // Avoid garden and water areas
      if (x > 1 && x < 14 && z > 1 && z < 14) continue;
      if (x > 13 && x < 21 && z > 15 && z < 23) continue;
      const h = fractalHeight(Math.floor(x), Math.floor(z));
      result.push({
        pos: [x, h + 0.7, z],
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.5 + Math.random() * 0.5,
      });
    }
    return result;
  }, []);

  return (
    <group>
      {flowers.map((f, i) => (
        <group key={i} position={f.pos} scale={f.scale}>
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.06, 0.3, 0.06]} />
            <meshStandardMaterial color="#2E8B38" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.2, 0.15, 0.2]} />
            <meshStandardMaterial color={f.color} roughness={0.4} emissive={f.color} emissiveIntensity={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Grass tufts for visual density
export function GrassTufts() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 400;

  const data = useMemo(() => {
    const mats = new Float32Array(count * 16);
    const cols = new Float32Array(count * 3);
    const mat = new THREE.Matrix4();
    const greens = [new THREE.Color('#3a7a2a'), new THREE.Color('#4a9a3a'), new THREE.Color('#2d6a1e'), new THREE.Color('#5aaa4a')];
    let idx = 0;
    for (let i = 0; i < count * 2; i++) {
      if (idx >= count) break;
      const x = Math.random() * 44 - 10;
      const z = Math.random() * 44 - 10;
      if (x > 2 && x < 13 && z > 2 && z < 13) continue;
      if (x > 13 && x < 21 && z > 15 && z < 23) continue;
      const h = fractalHeight(Math.floor(x), Math.floor(z));
      const rot = Math.random() * Math.PI;
      const scaleY = 0.3 + Math.random() * 0.5;
      mat.makeTranslation(x, h + scaleY * 0.5 + 0.5, z);
      const rotMat = new THREE.Matrix4().makeRotationY(rot);
      const scaleMat = new THREE.Matrix4().makeScale(0.15, scaleY, 0.08);
      mat.multiply(rotMat).multiply(scaleMat);
      mat.toArray(mats, idx * 16);
      const c = greens[idx % greens.length];
      cols[idx * 3] = c.r;
      cols[idx * 3 + 1] = c.g;
      cols[idx * 3 + 2] = c.b;
      idx++;
    }
    return { matrices: mats, colors: cols, actual: idx };
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    const mat = new THREE.Matrix4();
    for (let i = 0; i < data.actual; i++) {
      mat.fromArray(data.matrices, i * 16);
      meshRef.current.setMatrixAt(i, mat);
      meshRef.current.setColorAt(i, new THREE.Color(data.colors[i * 3], data.colors[i * 3 + 1], data.colors[i * 3 + 2]));
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [data]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, data.actual]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.8} metalness={0} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// Scattered rocks
export function ScatteredRocks() {
  const rocks = useMemo(() => {
    const result: { pos: [number, number, number]; scale: [number, number, number]; color: string }[] = [];
    const stoneColors = ['#6b6b6b', '#5a5a5a', '#7a7a7a', '#4a4a4a', '#8a8a8a'];
    for (let i = 0; i < 35; i++) {
      const x = Math.random() * 40 - 6;
      const z = Math.random() * 40 - 6;
      if (x > 1 && x < 14 && z > 1 && z < 14) continue;
      const h = fractalHeight(Math.floor(x), Math.floor(z));
      const sx = 0.3 + Math.random() * 0.8;
      const sy = 0.2 + Math.random() * 0.5;
      const sz = 0.3 + Math.random() * 0.7;
      result.push({
        pos: [x, h + sy * 0.5 + 0.5, z],
        scale: [sx, sy, sz],
        color: stoneColors[Math.floor(Math.random() * stoneColors.length)],
      });
    }
    return result;
  }, []);

  return (
    <group>
      {rocks.map((r, i) => (
        <mesh key={i} position={r.pos} scale={r.scale} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={r.color} roughness={0.95} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

// Trees with richer canopy and trunk variety
export function VoxelTrees() {
  const trees = useMemo(() => {
    const positions: { pos: [number, number, number]; height: number; canopySize: number; treeType: number }[] = [
      { pos: [0, 1, 0], height: 6, canopySize: 2, treeType: 0 },
      { pos: [-3, 1, 5], height: 7, canopySize: 3, treeType: 1 },
      { pos: [-4, 1, 12], height: 5, canopySize: 2, treeType: 0 },
      { pos: [20, 1, 2], height: 8, canopySize: 3, treeType: 2 },
      { pos: [22, 1, 10], height: 6, canopySize: 2, treeType: 0 },
      { pos: [-2, 1, 19], height: 7, canopySize: 3, treeType: 1 },
      { pos: [21, 1, 18], height: 5, canopySize: 2, treeType: 0 },
      { pos: [23, 1, 5], height: 5, canopySize: 2, treeType: 2 },
      { pos: [-3, 1, -2], height: 7, canopySize: 3, treeType: 1 },
      { pos: [10, 1, -3], height: 6, canopySize: 2, treeType: 0 },
      { pos: [22, 1, -2], height: 8, canopySize: 3, treeType: 2 },
      { pos: [-4, 1, 22], height: 6, canopySize: 2, treeType: 0 },
      { pos: [-6, 1, 8], height: 5, canopySize: 2, treeType: 1 },
      { pos: [25, 1, 14], height: 7, canopySize: 3, treeType: 2 },
      { pos: [15, 1, -5], height: 6, canopySize: 2, treeType: 0 },
      { pos: [-5, 1, -5], height: 8, canopySize: 3, treeType: 1 },
      { pos: [27, 1, 22], height: 5, canopySize: 2, treeType: 0 },
      { pos: [-6, 1, 15], height: 6, canopySize: 2, treeType: 2 },
    ];
    return positions;
  }, []);

  return (
    <group>
      {trees.map((tree, i) => (
        <VoxelTree key={i} position={tree.pos} height={tree.height} canopySize={tree.canopySize} seed={i} treeType={tree.treeType} />
      ))}
    </group>
  );
}

function VoxelTree({ position, height, canopySize, seed, treeType }: {
  position: [number, number, number]; height: number; canopySize: number; seed: number; treeType: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.rotation.z = Math.sin(t * 0.3 + seed) * 0.015;
      groupRef.current.rotation.x = Math.cos(t * 0.2 + seed * 2) * 0.01;
    }
  });

  const TRUNKS = ['#5C3317', '#4a2810', '#6B3A1F'];
  const LEAF_PALETTES = [
    ['#1a5c1a', '#2D5A1E', '#3D7A2E', '#2a6e2a', '#1e4d1e', '#347a34'],
    ['#2a4a1a', '#3a5a2a', '#1a3a0a', '#4a6a3a', '#2a5a2a', '#1a4a1a'], // dark pine
    ['#5a8a3a', '#6a9a4a', '#4a7a2a', '#7aaa5a', '#5a9a3a', '#8aba5a'], // bright birch
  ];

  const trunkColor = TRUNKS[treeType % TRUNKS.length];
  const leafColors = LEAF_PALETTES[treeType % LEAF_PALETTES.length];
  const trunkWidth = treeType === 2 ? 0.4 : 0.6;

  return (
    <group ref={groupRef} position={position}>
      {/* Trunk with roots */}
      {Array.from({ length: height }).map((_, y) => (
        <mesh key={`t${y}`} position={[0, y, 0]} castShadow>
          <boxGeometry args={[trunkWidth + (y === 0 ? 0.2 : 0), 1, trunkWidth + (y === 0 ? 0.2 : 0)]} />
          <meshStandardMaterial color={trunkColor} roughness={0.95} />
        </mesh>
      ))}
      {/* Root flares */}
      {[[-0.4, 0, 0], [0.4, 0, 0], [0, 0, -0.4], [0, 0, 0.4]].map(([dx, dy, dz], i) => (
        <mesh key={`r${i}`} position={[dx, 0.2, dz]} castShadow>
          <boxGeometry args={[0.3, 0.4, 0.3]} />
          <meshStandardMaterial color={trunkColor} roughness={0.95} />
        </mesh>
      ))}
      {/* Canopy — multi-layer */}
      {Array.from({ length: canopySize * 2 + 1 }).flatMap((_, dx) =>
        Array.from({ length: canopySize * 2 + 1 }).flatMap((_, dz) =>
          [0, 1, 2].map(dy => {
            const x = dx - canopySize;
            const z = dz - canopySize;
            const dist = Math.abs(x) + Math.abs(z);
            if (dy === 2 && dist > 1) return null;
            if (dy === 0 && dist > canopySize + 1) return null;
            if (dist > canopySize + 1) return null;
            if (dist === canopySize + 1 && noise2D(x + seed, z + seed) > 0.35) return null;
            const colorIdx = Math.abs(x * 3 + z * 7 + dy * 5 + seed) % leafColors.length;
            return (
              <mesh key={`l${x}${z}${dy}`} position={[x, height + dy, z]} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={leafColors[colorIdx]} roughness={0.75} />
              </mesh>
            );
          })
        )
      )}
    </group>
  );
}

// Animated water with depth layers
export function VoxelWater({ timeOfDay }: { timeOfDay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = -0.15 + Math.sin(t * 0.7) * 0.06;
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      const nightFactor = Math.max(0, Math.sin(timeOfDay * Math.PI * 2));
      mat.color.setHSL(0.56, 0.55, 0.25 + nightFactor * 0.2);
    }
    if (ref2.current) {
      ref2.current.position.y = -0.35 + Math.sin(t * 0.5 + 1) * 0.04;
    }
  });

  return (
    <group>
      {/* Deep water layer */}
      <mesh ref={ref2} position={[17, -0.35, 18.5]} receiveShadow>
        <boxGeometry args={[7, 0.3, 7]} />
        <meshStandardMaterial color="#1a5577" transparent opacity={0.5} roughness={0.05} metalness={0.4} />
      </mesh>
      {/* Surface water */}
      <mesh ref={ref} position={[17, -0.15, 18.5]} receiveShadow>
        <boxGeometry args={[7, 0.3, 7]} />
        <meshStandardMaterial color="#2980b9" transparent opacity={0.7} roughness={0.05} metalness={0.35} />
      </mesh>
      {/* Lily pads */}
      {[[15, 0.05, 17], [18, 0.05, 20], [16.5, 0.05, 19.5]].map(([x, y, z], i) => (
        <mesh key={`lily${i}`} position={[x, y, z]}>
          <boxGeometry args={[0.6, 0.06, 0.6]} />
          <meshStandardMaterial color="#2d8a2d" roughness={0.6} />
        </mesh>
      ))}
      {/* Shore blocks — irregular edges */}
      {Array.from({ length: 30 }).map((_, i) => {
        const angle = (i / 30) * Math.PI * 2;
        const r = 4 + noise2D(i, 0) * 1.5;
        const x = 17 + Math.cos(angle) * r;
        const z = 18.5 + Math.sin(angle) * r;
        return (
          <mesh key={i} position={[x, 0, z]} castShadow>
            <boxGeometry args={[1, 0.5, 1]} />
            <meshStandardMaterial color={noise2D(i, 1) > 0.5 ? '#c2a86b' : '#b89858'} roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

export function VoxelFence() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const count = useMemo(() => {
    let c = 0;
    for (let i = 1; i <= 13; i++) { c += 4; }
    for (let i = 2; i <= 12; i++) { c += 4; }
    // Add fence caps
    c += 4 * 4; // corners
    return c;
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    const mat = new THREE.Matrix4();
    const fenceColors = [new THREE.Color('#7a6345'), new THREE.Color('#8B7355'), new THREE.Color('#6a5335')];
    let idx = 0;
    const addPost = (x: number, y: number, z: number) => {
      mat.makeTranslation(x, y, z);
      meshRef.current!.setMatrixAt(idx, mat);
      meshRef.current!.setColorAt(idx, fenceColors[idx % fenceColors.length]);
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
    // Corner caps
    [[1, 3, 1], [1, 3, 13], [13, 3, 1], [13, 3, 13]].forEach(([x, y, z]) => {
      addPost(x, y, z);
    });
    // Mid-posts higher
    [[7, 3, 1], [7, 3, 13], [1, 3, 7], [13, 3, 7]].forEach(([x, y, z]) => {
      addPost(x, y, z);
    });
    // Fill remaining
    while (idx < count) {
      mat.makeTranslation(0, -100, 0); // hidden
      meshRef.current!.setMatrixAt(idx, mat);
      meshRef.current!.setColorAt(idx, fenceColors[0]);
      idx++;
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

// Decorations
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
          <meshStandardMaterial color="#FFD700" emissive="#FF8C00" emissiveIntensity={1.2} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[0.35, 0.15, 0.35]} />
          <meshStandardMaterial color="#4a3728" roughness={0.8} />
        </mesh>
        <pointLight position={[0, 0.8, 0]} intensity={3} distance={8} color="#FF8C00" />
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
        {/* Eyes */}
        <mesh position={[-0.08, 0.65, 0.15]} castShadow>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.08, 0.65, 0.15]} castShadow>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshStandardMaterial color="#000000" />
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
          <meshStandardMaterial color="#6a6a6a" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.7, 6]} />
          <meshStandardMaterial color="#7a7a7a" roughness={0.3} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.2, 8]} />
          <meshStandardMaterial color="#3498db" transparent opacity={0.6} roughness={0.05} metalness={0.3} />
        </mesh>
        <pointLight position={[0, 0.6, 0]} intensity={1} distance={5} color="#87CEEB" />
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
          <meshStandardMaterial color="#e74c3c" roughness={0.5} emissive="#e74c3c" emissiveIntensity={0.08} />
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
        {[[-0.3, 0], [0.3, 0]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.2, z]} castShadow>
            <boxGeometry args={[0.1, 0.4, 0.5]} />
            <meshStandardMaterial color="#5C3317" roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.8, 0.08, 0.5]} />
          <meshStandardMaterial color="#8B6914" roughness={0.8} />
        </mesh>
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

// Enhanced floating particles
export function AmbientParticles({ timeOfDay }: { timeOfDay: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 350;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60 + 10;
      pos[i * 3 + 1] = Math.random() * 20 + 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60 + 10;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      pos[i * 3] += Math.sin(t * 0.08 + i) * 0.004;
      pos[i * 3 + 1] += Math.sin(t * 0.25 + i * 0.7) * 0.006;
      pos[i * 3 + 2] += Math.cos(t * 0.12 + i * 0.5) * 0.004;
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
        size={isNight ? 0.15 : 0.07}
        transparent
        opacity={isNight ? 0.85 : 0.35}
      />
    </points>
  );
}

// Stars for nighttime
export function Stars({ timeOfDay }: { timeOfDay: number }) {
  const count = 800;
  const ref = useRef<THREE.Points>(null);

  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      const r = 90;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) + 10;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      sizes[i] = 0.15 + Math.random() * 0.2;
    }
    return { positions: pos, sizes };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.PointsMaterial;
    const nightAmount = timeOfDay > 0.7 ? (timeOfDay - 0.7) / 0.3 : timeOfDay < 0.25 ? 1 - timeOfDay / 0.25 : 0;
    mat.opacity = nightAmount * 0.95;
    mat.size = 0.2 + Math.sin(clock.getElapsedTime() * 0.4) * 0.06;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#FFFFFF" size={0.22} transparent opacity={0} />
    </points>
  );
}
