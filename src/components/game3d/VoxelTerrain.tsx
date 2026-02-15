import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

const CHUNK_SIZE = 20;

// Voxel terrain colors
const GRASS_COLOR = new THREE.Color('#4a7c3f');
const GRASS_TOP = new THREE.Color('#5a9c4f');
const DIRT_COLOR = new THREE.Color('#8B6914');
const STONE_COLOR = new THREE.Color('#808080');

function VoxelBlock({ position, color, topColor }: { position: [number, number, number]; color: THREE.Color; topColor?: THREE.Color }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    if (topColor) {
      // Color the top face differently
      const colors = [];
      const faceColors = [
        color, color, // right, left
        topColor, color, // top, bottom
        color, color, // front, back
      ];
      for (let i = 0; i < 6; i++) {
        const c = faceColors[i];
        for (let j = 0; j < 4; j++) {
          colors.push(c.r, c.g, c.b);
        }
      }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
    return geo;
  }, [color, topColor]);

  return (
    <mesh position={position} geometry={geometry} castShadow receiveShadow>
      {topColor ? (
        <meshLambertMaterial vertexColors />
      ) : (
        <meshLambertMaterial color={color} />
      )}
    </mesh>
  );
}

export function VoxelTerrain() {
  const blocks = useMemo(() => {
    const result: { pos: [number, number, number]; color: THREE.Color; topColor?: THREE.Color }[] = [];

    for (let x = -3; x < CHUNK_SIZE + 3; x++) {
      for (let z = -3; z < CHUNK_SIZE + 3; z++) {
        // Height variation using simple noise
        const height = Math.floor(
          Math.sin(x * 0.3) * 0.5 +
          Math.cos(z * 0.4) * 0.5 +
          Math.sin((x + z) * 0.2) * 0.3
        );

        // Top grass layer
        result.push({ pos: [x, height, z], color: GRASS_COLOR, topColor: GRASS_TOP });

        // Dirt layers below
        for (let y = height - 1; y >= height - 2; y--) {
          result.push({ pos: [x, y, z], color: DIRT_COLOR });
        }

        // Stone foundation
        if (height - 3 >= -3) {
          result.push({ pos: [x, height - 3, z], color: STONE_COLOR });
        }
      }
    }

    return result;
  }, []);

  return (
    <group>
      {blocks.map((block, i) => (
        <VoxelBlock key={i} position={block.pos} color={block.color} topColor={block.topColor} />
      ))}
    </group>
  );
}

// Garden plot markers - flat soil patches where roses can be planted
export function GardenPlots({ plotCount }: { plotCount: number }) {
  const SOIL_COLOR = new THREE.Color('#6B4226');
  const SOIL_TOP = new THREE.Color('#8B5E3C');

  const plots = useMemo(() => {
    const result: [number, number, number][] = [];
    const cols = 5;
    for (let i = 0; i < plotCount; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      result.push([col * 2 + 3, 1, row * 2 + 3]);
    }
    return result;
  }, [plotCount]);

  return (
    <group>
      {plots.map((pos, i) => (
        <VoxelBlock key={i} position={pos} color={SOIL_COLOR} topColor={SOIL_TOP} />
      ))}
    </group>
  );
}

// Decorative trees scattered around the garden
export function VoxelTrees() {
  const trees = useMemo(() => [
    [0, 1, 0], [-2, 1, 5], [18, 1, 2], [19, 1, 10], [-1, 1, 15], [17, 1, 17],
    [20, 1, 5], [-2, 1, 18], [20, 1, 14],
  ] as [number, number, number][], []);

  const TRUNK = new THREE.Color('#5C3317');
  const LEAVES = new THREE.Color('#2D5A1E');
  const LEAVES_LIGHT = new THREE.Color('#3D7A2E');

  return (
    <group>
      {trees.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Trunk */}
          {[0, 1, 2, 3].map(y => (
            <VoxelBlock key={`t${y}`} position={[0, y, 0]} color={TRUNK} />
          ))}
          {/* Canopy - cross pattern */}
          {[-1, 0, 1].map(dx =>
            [-1, 0, 1].map(dz =>
              [4, 5].map(dy => (
                <VoxelBlock
                  key={`l${dx}${dz}${dy}`}
                  position={[dx, dy, dz]}
                  color={Math.random() > 0.5 ? LEAVES : LEAVES_LIGHT}
                />
              ))
            )
          )}
          <VoxelBlock position={[0, 6, 0]} color={LEAVES} />
        </group>
      ))}
    </group>
  );
}

// Water pond
export function VoxelWater() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = -0.3 + Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
    }
  });

  return (
    <mesh ref={ref} position={[15, -0.3, 15]} receiveShadow>
      <boxGeometry args={[4, 0.3, 4]} />
      <meshLambertMaterial color="#3498db" transparent opacity={0.7} />
    </mesh>
  );
}

// Fence around garden
export function VoxelFence() {
  const FENCE_COLOR = new THREE.Color('#8B7355');
  const posts = useMemo(() => {
    const result: [number, number, number][] = [];
    for (let i = 1; i <= 13; i += 2) {
      result.push([1, 1, i]);
      result.push([13, 1, i]);
    }
    for (let i = 1; i <= 13; i += 2) {
      result.push([i, 1, 1]);
      result.push([i, 1, 13]);
    }
    return result;
  }, []);

  return (
    <group>
      {posts.map((pos, i) => (
        <group key={i}>
          <VoxelBlock position={pos} color={FENCE_COLOR} />
          <VoxelBlock position={[pos[0], pos[1] + 1, pos[2]]} color={FENCE_COLOR} />
        </group>
      ))}
    </group>
  );
}
