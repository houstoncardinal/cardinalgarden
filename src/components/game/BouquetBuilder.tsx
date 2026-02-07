import { useState } from 'react';
import type { RoseColor } from '@/types/garden';

const ROSE_EMOJIS: Record<RoseColor, string> = {
  red: '🌹', pink: '🌸', white: '🤍', yellow: '🌻', purple: '🪻', black: '🖤', rainbow: '🌈',
};

interface Props {
  basket: Record<RoseColor, number>;
  onCreateBouquet: (roses: RoseColor[], name: string) => void;
  onClose: () => void;
}

export function BouquetBuilder({ basket, onCreateBouquet, onClose }: Props) {
  const [selected, setSelected] = useState<RoseColor[]>([]);
  const [name, setName] = useState('My Bouquet');

  const availableColors = (Object.keys(basket) as RoseColor[]).filter(c => basket[c] > 0);

  const addRose = (color: RoseColor) => {
    const usedCount = selected.filter(c => c === color).length;
    if (usedCount < basket[color] && selected.length < 8) {
      setSelected(prev => [...prev, color]);
    }
  };

  const removeRose = (index: number) => {
    setSelected(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md animate-bounce-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display text-xl font-bold text-foreground">💐 Bouquet Builder</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="font-body text-sm font-semibold text-foreground block mb-1">Bouquet Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-muted border border-border font-body text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={30}
            />
          </div>

          <div>
            <p className="font-body text-sm font-semibold text-foreground mb-2">Add Roses (max 8)</p>
            <div className="flex flex-wrap gap-2">
              {availableColors.map(color => (
                <button
                  key={color}
                  onClick={() => addRose(color)}
                  className="flex items-center gap-1 bg-muted rounded-lg px-3 py-1.5 hover:bg-muted/80 transition-colors"
                >
                  <span className="text-xl">{ROSE_EMOJIS[color]}</span>
                  <span className="font-body text-xs text-muted-foreground">
                    {basket[color] - selected.filter(c => c === color).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 min-h-[80px] flex flex-wrap items-center justify-center gap-2">
            {selected.length === 0 ? (
              <p className="text-muted-foreground font-body text-sm">Tap roses above to add them</p>
            ) : (
              selected.map((color, i) => (
                <button
                  key={i}
                  onClick={() => removeRose(i)}
                  className="text-3xl hover:scale-110 transition-transform cursor-pointer animate-bloom"
                  title="Click to remove"
                >
                  {ROSE_EMOJIS[color]}
                </button>
              ))
            )}
          </div>

          <button
            onClick={() => { onCreateBouquet(selected, name); onClose(); }}
            disabled={selected.length < 2}
            className={`w-full py-3 rounded-xl font-body font-bold transition-all
              ${selected.length >= 2 ? 'bg-primary text-primary-foreground hover:scale-[1.02]' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
          >
            {selected.length < 2 ? 'Add at least 2 roses' : `Create Bouquet (${selected.length} roses)`}
          </button>
        </div>
      </div>
    </div>
  );
}
