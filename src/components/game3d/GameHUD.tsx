import { useState } from 'react';
import type { Tool, RoseColor } from '@/types/garden';

const TOOLS: { tool: Tool; emoji: string; label: string }[] = [
  { tool: 'hand', emoji: '✋', label: 'Pick' },
  { tool: 'water', emoji: '💧', label: 'Water' },
  { tool: 'plant', emoji: '🌱', label: 'Plant' },
  { tool: 'scissors', emoji: '✂️', label: 'Trim' },
];

interface Props {
  selectedTool: Tool;
  selectedColor: RoseColor;
  unlockedColors: RoseColor[];
  coins: number;
  score: number;
  weather: string;
  basket: Record<RoseColor, number>;
  onSelectTool: (tool: Tool) => void;
  onSelectColor: (color: RoseColor) => void;
  onOpenShop: () => void;
  onOpenBouquet: () => void;
  onOpenDonate: () => void;
  totalTrees: number;
}

const WEATHER_LABELS: Record<string, string> = {
  clear: '🌤️ Clear',
  sunny: '☀️ Sunny',
  rainy: '🌧️ Rainy',
};

const COLOR_DISPLAY: Record<RoseColor, { emoji: string; bg: string }> = {
  red: { emoji: '🌹', bg: 'bg-red-500' },
  pink: { emoji: '🌸', bg: 'bg-pink-400' },
  white: { emoji: '🤍', bg: 'bg-gray-100' },
  yellow: { emoji: '🌻', bg: 'bg-yellow-400' },
  purple: { emoji: '🪻', bg: 'bg-purple-600' },
  black: { emoji: '🖤', bg: 'bg-gray-900' },
  rainbow: { emoji: '🌈', bg: 'bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500' },
};

export function GameHUD({
  selectedTool, selectedColor, unlockedColors, coins, score,
  weather, basket, onSelectTool, onSelectColor,
  onOpenShop, onOpenBouquet, onOpenDonate, totalTrees,
}: Props) {
  const [showInventory, setShowInventory] = useState(false);

  const totalRoses = Object.values(basket).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-center justify-between p-3 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="bg-card/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-border shadow-lg">
              <span className="font-display text-lg font-bold text-foreground">🌹 Rose Garden</span>
            </div>
            <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border text-sm font-body text-muted-foreground">
              {WEATHER_LABELS[weather]}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onOpenDonate} className="bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border flex items-center gap-1 hover:bg-primary transition-colors">
              <span className="text-sm">🌳</span>
              <span className="font-body font-bold text-sm text-primary-foreground">{totalTrees}</span>
            </button>
            <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border flex items-center gap-1">
              <span className="text-sm">🪙</span>
              <span className="font-body font-bold text-sm text-accent-foreground">{coins}</span>
            </div>
            <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border flex items-center gap-1">
              <span className="text-sm">⭐</span>
              <span className="font-body font-bold text-sm text-accent-foreground">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="w-1 h-6 bg-foreground/50 absolute" />
        <div className="h-1 w-6 bg-foreground/50 absolute" />
      </div>

      {/* Bottom toolbar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-end justify-center p-4 gap-3 pointer-events-auto">
          {/* Tools */}
          <div className="bg-card/90 backdrop-blur-sm rounded-xl p-2 border border-border shadow-lg flex gap-1">
            {TOOLS.map(({ tool, emoji, label }) => (
              <button
                key={tool}
                onClick={() => onSelectTool(tool)}
                className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-lg transition-all
                  ${selectedTool === tool ? 'bg-primary text-primary-foreground scale-110 shadow-md' : 'hover:bg-muted'}`}
                title={label}
              >
                <span>{emoji}</span>
                <span className="text-[9px] font-body font-bold">{label}</span>
              </button>
            ))}
          </div>

          {/* Color selector (when planting) */}
          {selectedTool === 'plant' && (
            <div className="bg-card/90 backdrop-blur-sm rounded-xl p-2 border border-border shadow-lg flex gap-1">
              {unlockedColors.map(color => (
                <button
                  key={color}
                  onClick={() => onSelectColor(color)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all
                    ${selectedColor === color ? 'ring-2 ring-primary scale-110' : 'hover:bg-muted'}`}
                  title={color}
                >
                  {COLOR_DISPLAY[color].emoji}
                </button>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="bg-card/90 backdrop-blur-sm rounded-xl p-2 border border-border shadow-lg flex gap-1">
            <button onClick={() => setShowInventory(!showInventory)} className="w-12 h-12 rounded-lg flex flex-col items-center justify-center hover:bg-muted transition-all">
              <span className="text-lg">🧺</span>
              <span className="text-[9px] font-body font-bold text-foreground">{totalRoses}</span>
            </button>
            <button onClick={onOpenShop} className="w-12 h-12 rounded-lg flex flex-col items-center justify-center hover:bg-muted transition-all">
              <span className="text-lg">🏪</span>
              <span className="text-[9px] font-body font-bold text-foreground">Shop</span>
            </button>
            <button onClick={onOpenBouquet} className="w-12 h-12 rounded-lg flex flex-col items-center justify-center hover:bg-muted transition-all">
              <span className="text-lg">💐</span>
              <span className="text-[9px] font-body font-bold text-foreground">Build</span>
            </button>
          </div>
        </div>

        {/* Inventory popup */}
        {showInventory && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm rounded-xl p-4 border border-border shadow-2xl w-64">
            <h3 className="font-display font-bold text-foreground text-sm mb-2">🧺 Basket</h3>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(basket) as [RoseColor, number][])
                .filter(([_, count]) => count > 0)
                .map(([color, count]) => (
                  <div key={color} className="flex flex-col items-center bg-muted/50 rounded-lg p-1.5">
                    <span className="text-lg">{COLOR_DISPLAY[color]?.emoji || '🌹'}</span>
                    <span className="font-body font-bold text-xs text-foreground">{count}</span>
                  </div>
                ))}
            </div>
            {totalRoses === 0 && (
              <p className="font-body text-xs text-muted-foreground text-center py-2">Empty — pick some roses!</p>
            )}
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div className="absolute top-16 left-3 z-20 pointer-events-none">
        <div className="bg-card/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-border text-xs font-body text-muted-foreground space-y-0.5">
          <p><strong>WASD</strong> — Move</p>
          <p><strong>Mouse</strong> — Look</p>
          <p><strong>Space</strong> — Jump</p>
          <p><strong>Click</strong> — Use tool</p>
          <p className="text-[10px] italic">Click to lock cursor</p>
        </div>
      </div>
    </>
  );
}
