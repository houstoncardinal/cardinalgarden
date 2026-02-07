import type { Weather } from '@/types/garden';

interface Props {
  weather: Weather;
}

export function WeatherEffects({ weather }: Props) {
  if (weather === 'clear') return null;

  if (weather === 'rainy') {
    return (
      <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 bg-water/40 rounded-full animate-rain"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}px`,
              height: `${15 + Math.random() * 20}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-water/5" />
      </div>
    );
  }

  if (weather === 'sunny') {
    return (
      <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-accent/20 blur-3xl animate-pulse" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-accent/30 animate-sparkle text-2xl"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            ☀️
          </div>
        ))}
      </div>
    );
  }

  return null;
}
