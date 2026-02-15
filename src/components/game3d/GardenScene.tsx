import { Canvas } from '@react-three/fiber';
import { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { VoxelTerrain, GardenPlots, VoxelTrees, VoxelWater, VoxelFence, PlacedDecorations, AmbientParticles, Stars } from './VoxelTerrain';
import type { Decoration } from './VoxelTerrain';
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
  decorations: Decoration[];
  timeOfDay: number;
  onFlyingChange?: (flying: boolean) => void;
}

function PlotInteraction({ index, position, onPlotClick }: {
  index: number;
  position: [number, number, number];
  onPlotClick: (index: number) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group>
      <mesh
        position={[position[0], position[1] + 0.6, position[2]]}
        onClick={(e) => { e.stopPropagation(); onPlotClick(index); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.95, 1.2, 0.95]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {/* Hover highlight */}
      {hovered && (
        <mesh position={[position[0], position[1] + 1.01, position[2]]}>
          <boxGeometry args={[1.05, 0.02, 1.05]} />
          <meshStandardMaterial color="#FFFFFF" transparent opacity={0.4} emissive="#FFFFFF" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
}

export function GardenScene({ plots, pickingId, wateringId, bloomingId, weather, onPlotClick, decorations, timeOfDay, onFlyingChange }: Props) {
  const plotPositions = useMemo(() => {
    const cols = 5;
    return plots.map((_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      return [col * 2 + 3, 1.5, row * 2 + 3] as [number, number, number];
    });
  }, [plots.length]);

  // Day/night lighting
  const isNight = timeOfDay > 0.75 || timeOfDay < 0.2;
  const isDusk = (timeOfDay > 0.65 && timeOfDay <= 0.75) || (timeOfDay >= 0.2 && timeOfDay < 0.3);
  const dayFactor = Math.max(0, Math.sin(timeOfDay * Math.PI * 2 - Math.PI / 2));

  const ambientIntensity = (() => {
    const base = weather === 'rainy' ? 0.2 : weather === 'sunny' ? 0.6 : 0.4;
    return base * (0.15 + dayFactor * 0.85);
  })();

  const sunIntensity = (() => {
    const base = weather === 'rainy' ? 0.2 : weather === 'sunny' ? 1.8 : 0.9;
    return base * dayFactor;
  })();

  const sunAngle = timeOfDay * Math.PI * 2 - Math.PI / 2;
  const sunPos: [number, number, number] = [
    Math.cos(sunAngle) * 30,
    Math.max(2, Math.sin(sunAngle) * 30),
    15,
  ];

  const fogColor = isNight ? '#0a0a1a' : isDusk ? '#e8a87c' : weather === 'rainy' ? '#556677' : '#87CEEB';

  return (
    <div className="w-full h-full" style={{ cursor: 'crosshair' }}>
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 250 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: isNight ? 0.5 : 1.2 }}
      >
        <color attach="background" args={[isNight ? '#050510' : '#87CEEB']} />

        <VoxelSky weather={weather} timeOfDay={timeOfDay} />

        {/* Dynamic lighting */}
        <ambientLight intensity={ambientIntensity} color={isNight ? '#1a1a3e' : isDusk ? '#ffa07a' : '#ffffff'} />
        <directionalLight
          position={sunPos}
          intensity={sunIntensity}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={60}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
          color={isDusk ? '#ff8c42' : isNight ? '#3344aa' : '#ffffff'}
        />

        {/* Night moonlight */}
        {isNight && (
          <directionalLight position={[-20, 20, 10]} intensity={0.15} color="#8888cc" />
        )}

        {/* Sunny warm light */}
        {weather === 'sunny' && !isNight && (
          <pointLight position={[10, 20, 10]} intensity={1} color="#FFD700" distance={50} />
        )}

        <fog attach="fog" args={[fogColor, isNight ? 15 : 25, isNight ? 50 : 80]} />

        <FirstPersonControls onStateChange={(s) => onFlyingChange?.(s.flying)} />

        {/* World */}
        <VoxelTerrain />
        <GardenPlots plotCount={plots.length} />
        <VoxelTrees />
        <VoxelWater timeOfDay={timeOfDay} />
        <VoxelFence />
        <PlacedDecorations decorations={decorations} />
        <AmbientParticles timeOfDay={timeOfDay} />
        <Stars timeOfDay={timeOfDay} />

        {/* Roses */}
        {plots.map((plot, i) => {
          if (!plot) return (
            <PlotInteraction key={i} index={i} position={plotPositions[i]} onPlotClick={onPlotClick} />
          );
          const isActive = plot.id === pickingId || plot.id === wateringId || plot.id === bloomingId;
          return (
            <group key={i}>
              <VoxelRose plot={plot} position={plotPositions[i]} isPickingOrWatering={isActive} />
              <PlotInteraction index={i} position={plotPositions[i]} onPlotClick={onPlotClick} />
            </group>
          );
        })}

        <Weather3DEffects weather={weather} />
      </Canvas>
    </div>
  );
}
