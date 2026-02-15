import { Sky } from '@react-three/drei';
import type { Weather } from '@/types/garden';

export function VoxelSky({ weather }: { weather: Weather }) {
  const sunPosition: [number, number, number] =
    weather === 'sunny' ? [50, 80, 30] :
    weather === 'rainy' ? [10, 20, 30] :
    [30, 50, 30];

  const turbidity = weather === 'rainy' ? 20 : weather === 'sunny' ? 2 : 6;
  const rayleigh = weather === 'rainy' ? 0.1 : weather === 'sunny' ? 2.5 : 1;

  return (
    <Sky
      sunPosition={sunPosition}
      turbidity={turbidity}
      rayleigh={rayleigh}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
    />
  );
}
