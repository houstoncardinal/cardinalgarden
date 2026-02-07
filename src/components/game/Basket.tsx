import type { RoseColor } from '@/types/garden';

const ROSE_DISPLAY: Record<RoseColor, { emoji: string; label: string }> = {
  red: { emoji: '🌹', label: 'Red' },
  pink: { emoji: '🌸', label: 'Pink' },
  white: { emoji: '🤍', label: 'White' },
  yellow: { emoji: '🌻', label: 'Yellow' },
};

interface Props {
  basket: Record<RoseColor, number>;
  score: number;
}

export function Basket({ basket, score }: Props) {
  const total = Object.values(basket).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-card rounded-2xl p-5 shadow-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-foreground">🧺 Basket</h2>
        <div className="flex items-center gap-2 bg-accent/30 rounded-full px-3 py-1">
          <span className="text-lg">⭐</span>
          <span className="font-body font-bold text-accent-foreground">{score}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(ROSE_DISPLAY) as RoseColor[]).map(color => (
          <div
            key={color}
            className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2"
          >
            <span className="text-xl">{ROSE_DISPLAY[color].emoji}</span>
            <span className="font-body font-semibold text-foreground">{basket[color]}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border text-center">
        <span className="font-body text-muted-foreground text-sm">Total: </span>
        <span className="font-body font-bold text-foreground">{total} roses</span>
      </div>
    </div>
  );
}
