import type { RosePlot as RosePlotType, RoseColor } from '@/types/garden';

const ROSE_EMOJI: Record<string, string> = {
  seed: '🌱',
  sprout: '🌿',
  bud: '🌷',
};

const BLOOM_EMOJI: Record<RoseColor, string> = {
  red: '🌹',
  pink: '🌸',
  white: '🤍',
  yellow: '🌻',
};

interface Props {
  plot: RosePlotType | null;
  isPicking: boolean;
  isWatering: boolean;
  isBlooming: boolean;
  onClick: () => void;
}

export function RosePlotCell({ plot, isPicking, isWatering, isBlooming, onClick }: Props) {
  if (!plot) {
    return (
      <button
        onClick={onClick}
        className="w-full aspect-square rounded-xl bg-soil/30 border-2 border-dashed border-garden-light/50 hover:border-primary hover:bg-soil/50 transition-all duration-200 flex items-center justify-center text-2xl opacity-50 hover:opacity-100"
        title="Empty plot — select Plant tool to plant here"
      >
        +
      </button>
    );
  }

  const emoji = plot.stage === 'bloom' ? BLOOM_EMOJI[plot.color] : ROSE_EMOJI[plot.stage];
  const size = plot.stage === 'bloom' ? 'text-4xl' : plot.stage === 'bud' ? 'text-3xl' : 'text-2xl';

  return (
    <button
      onClick={onClick}
      className={`
        w-full aspect-square rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden
        ${plot.watered ? 'bg-water/10 border-water/40' : 'bg-garden-light/30 border-garden-light/60'}
        ${plot.stage === 'bloom' ? 'hover:scale-110 cursor-grab animate-sway' : 'hover:scale-105 cursor-pointer'}
        ${isPicking ? 'animate-pick pointer-events-none' : ''}
        ${isBlooming ? 'animate-bloom' : ''}
      `}
    >
      <span className={`${size} select-none drop-shadow-md`}>{emoji}</span>
      {isWatering && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-xl animate-water">💧</span>
      )}
      {plot.watered && !isWatering && (
        <span className="absolute top-1 right-1 text-xs animate-sparkle">✨</span>
      )}
    </button>
  );
}
