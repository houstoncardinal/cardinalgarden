import { Canvas } from '@react-three/fiber';
import { useMemo, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { VoxelTerrain, GardenPlots, VoxelTrees, VoxelWater, VoxelFence } from './VoxelTerrain';
import { VoxelRose } from './VoxelRose';
import { VoxelSky } from './VoxelSky';
import { Weather3DEffects } from './Weather3DEffects';
import { FirstPersonControls } from './FirstPersonControls';
import type { RosePlot, Weather } from '@/types/garden';

interface Props {
  plots: (RosePlot | null)[];
  pickingId: string | null;
  wateringId: string | null;
  bloomingId: string | null;
  weather: Weather;
  onPlotClick: (index: number) => void;
}

function PlotInteraction({ index, position, onPlotClick }: {
  index: number;
  position: [number, number, number];
  onPlotClick: (index: number) => void;
}) {
  return (
    <mesh
      position={[position[0], position[1] + 0.6, position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onPlotClick(index);
      }}
    >
      <boxGeometry args={[0.9, 1.2, 0.9]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

export function GardenScene({ plots, pickingId, wateringId, bloomingId, weather, onPlotClick }: Props) {
  const plotPositions = useMemo(() => {
    const cols = 5;
    return plots.map((_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      return [col * 2 + 3, 1.5, row * 2 + 3] as [number, number, number];
    });
  }, [plots.length]);

  return (
    <div className="w-full h-full" style={{ cursor: 'crosshair' }}>
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
      >
        <VoxelSky weather={weather} />

        {/* Lighting */}
        <ambientLight intensity={weather === 'rainy' ? 0.3 : weather === 'sunny' ? 0.8 : 0.5} />
        <directionalLight
          position={[15, 20, 10]}
          intensity={weather === 'rainy' ? 0.3 : weather === 'sunny' ? 1.5 : 0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        {weather === 'sunny' && (
          <pointLight position={[10, 15, 10]} intensity={0.5} color="#FFD700" />
        )}

        <fog attach="fog" args={[weather === 'rainy' ? '#8899aa' : '#87CEEB', 20, 60]} />

        <FirstPersonControls />

        {/* World */}
        <VoxelTerrain />
        <GardenPlots plotCount={plots.length} />
        <VoxelTrees />
        <VoxelWater />
        <VoxelFence />

        {/* Roses */}
        {plots.map((plot, i) => {
          if (!plot) return (
            <PlotInteraction key={i} index={i} position={plotPositions[i]} onPlotClick={onPlotClick} />
          );
          const isActive = plot.id === pickingId || plot.id === wateringId || plot.id === bloomingId;
          return (
            <group key={i}>
              <VoxelRose
                plot={plot}
                position={plotPositions[i]}
                isPickingOrWatering={isActive}
              />
              <PlotInteraction index={i} position={plotPositions[i]} onPlotClick={onPlotClick} />
            </group>
          );
        })}

        <Weather3DEffects weather={weather} />
      </Canvas>
    </div>
  );
}
