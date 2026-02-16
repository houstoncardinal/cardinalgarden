import { Canvas } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { VoxelTerrain, GardenPlots, VoxelTrees, VoxelWater, VoxelFence, PlacedDecorations, AmbientParticles, Stars, Wildflowers, GrassTufts, ScatteredRocks } from './VoxelTerrain';
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
      {hovered && (
        <>
          <mesh position={[position[0], position[1] + 1.01, position[2]]}>
            <boxGeometry args={[1.05, 0.03, 1.05]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.5} emissive="#FFFFFF" emissiveIntensity={0.8} />
          </mesh>
          {/* Corner markers */}
          {[[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]].map(([dx, dz], i) => (
            <mesh key={i} position={[position[0] + dx, position[1] + 1.02, position[2] + dz]}>
              <boxGeometry args={[0.12, 0.04, 0.12]} />
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1} />
            </mesh>
          ))}
        </>
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

  const isNight = timeOfDay > 0.75 || timeOfDay < 0.2;
  const isDusk = (timeOfDay > 0.65 && timeOfDay <= 0.75) || (timeOfDay >= 0.2 && timeOfDay < 0.3);
  const dayFactor = Math.max(0, Math.sin(timeOfDay * Math.PI * 2 - Math.PI / 2));

  const ambientIntensity = (() => {
    const base = weather === 'rainy' ? 0.25 : weather === 'sunny' ? 0.7 : 0.45;
    return base * (0.12 + dayFactor * 0.88);
  })();

  const sunIntensity = (() => {
    const base = weather === 'rainy' ? 0.3 : weather === 'sunny' ? 2.2 : 1.1;
    return base * dayFactor;
  })();

  const sunAngle = timeOfDay * Math.PI * 2 - Math.PI / 2;
  const sunPos: [number, number, number] = [
    Math.cos(sunAngle) * 35,
    Math.max(2, Math.sin(sunAngle) * 35),
    15,
  ];

  const fogColor = isNight ? '#080818' : isDusk ? '#e8a87c' : weather === 'rainy' ? '#445566' : '#7EC8E3';

  return (
    <div className="w-full h-full" style={{ cursor: 'crosshair' }}>
      <Canvas
        shadows
        camera={{ fov: 72, near: 0.1, far: 300 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isNight ? 0.4 : isDusk ? 0.9 : 1.3,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={[isNight ? '#040410' : isDusk ? '#2a1a3a' : '#7EC8E3']} />

        <VoxelSky weather={weather} timeOfDay={timeOfDay} />

        {/* Multi-source lighting for richness */}
        <ambientLight intensity={ambientIntensity} color={isNight ? '#121230' : isDusk ? '#ffa07a' : '#e8e8ff'} />
        
        {/* Main sun/moon directional */}
        <directionalLight
          position={sunPos}
          intensity={sunIntensity}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-far={80}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.0005}
          color={isDusk ? '#ff8c42' : isNight ? '#2244aa' : '#fff8e7'}
        />

        {/* Fill light from opposite side */}
        <directionalLight
          position={[-sunPos[0] * 0.5, 10, -sunPos[2] * 0.5]}
          intensity={sunIntensity * 0.15}
          color={isDusk ? '#ffa07a' : '#aabbcc'}
        />

        {/* Moonlight */}
        {isNight && (
          <>
            <directionalLight position={[-20, 25, 10]} intensity={0.2} color="#6666aa" />
            <hemisphereLight args={['#111133', '#080810', 0.15]} />
          </>
        )}

        {/* Sunny warm bounce */}
        {weather === 'sunny' && !isNight && (
          <>
            <pointLight position={[10, 25, 10]} intensity={1.5} color="#FFD700" distance={60} />
            <hemisphereLight args={['#87CEEB', '#4a7c3f', 0.3]} />
          </>
        )}

        {/* Hemisphere for ambient ground bounce */}
        {!isNight && weather !== 'sunny' && (
          <hemisphereLight args={['#aabbcc', '#3a5a2a', 0.2]} />
        )}

        <fog attach="fog" args={[fogColor, isNight ? 12 : 20, isNight ? 55 : 90]} />

        <FirstPersonControls onStateChange={(s) => onFlyingChange?.(s.flying)} />

        {/* Enhanced World */}
        <VoxelTerrain />
        <GardenPlots plotCount={plots.length} />
        <VoxelTrees />
        <VoxelWater timeOfDay={timeOfDay} />
        <VoxelFence />
        <Wildflowers />
        <GrassTufts />
        <ScatteredRocks />
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
