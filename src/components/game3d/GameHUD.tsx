import { useState, useEffect, useCallback } from 'react';
import type { Tool, RoseColor } from '@/types/garden';
import { DECORATION_TYPES } from './VoxelTerrain';

const TOOLS: { tool: Tool; emoji: string; label: string; key: string }[] = [
  { tool: 'hand', emoji: '✋', label: 'Pick', key: '1' },
  { tool: 'water', emoji: '💧', label: 'Water', key: '2' },
  { tool: 'plant', emoji: '🌱', label: 'Plant', key: '3' },
  { tool: 'scissors', emoji: '✂️', label: 'Trim', key: '4' },
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
  timeOfDay: number;
  flying: boolean;
  onPlaceDecoration?: (type: string) => void;
  decorationCount: number;
}

const WEATHER_LABELS: Record<string, string> = {
  clear: '🌤️ Clear',
  sunny: '☀️ Sunny',
  rainy: '🌧️ Rainy',
};

const TIME_LABELS = (t: number): string => {
  if (t < 0.2) return '🌙 Night';
  if (t < 0.3) return '🌅 Dawn';
  if (t < 0.5) return '☀️ Morning';
  if (t < 0.65) return '🌤️ Afternoon';
  if (t < 0.75) return '🌇 Dusk';
  return '🌙 Night';
};

const COLOR_DISPLAY: Record<RoseColor, { emoji: string }> = {
  red: { emoji: '🌹' },
  pink: { emoji: '🌸' },
  white: { emoji: '🤍' },
  yellow: { emoji: '🌻' },
  purple: { emoji: '🪻' },
  black: { emoji: '🖤' },
  rainbow: { emoji: '🌈' },
};

export function GameHUD({
  selectedTool, selectedColor, unlockedColors, coins, score,
  weather, basket, onSelectTool, onSelectColor,
  onOpenShop, onOpenBouquet, onOpenDonate, totalTrees,
  timeOfDay, flying, onPlaceDecoration, decorationCount,
}: Props) {
  const [showInventory, setShowInventory] = useState(false);
  const [showDecoMenu, setShowDecoMenu] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const totalRoses = Object.values(basket).reduce((a, b) => a + b, 0);

  // Keyboard shortcuts for tool selection
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const tool = TOOLS.find(t => t.key === e.key);
      if (tool) onSelectTool(tool.tool);
      if (e.key === 'e' || e.key === 'E') onOpenShop();
      if (e.key === 'b' || e.key === 'B') onOpenBouquet();
      if (e.key === 'i' || e.key === 'I') setShowInventory(p => !p);
      if (e.key === 'h' || e.key === 'H') setControlsVisible(p => !p);
      if (e.key === 'g' || e.key === 'G') setShowDecoMenu(p => !p);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSelectTool, onOpenShop, onOpenBouquet]);

  // Auto-hide controls after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => setControlsVisible(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-center justify-between p-2 sm:p-3 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <div className="bg-card/80 backdrop-blur-md rounded-xl px-3 py-1.5 border border-border/50 shadow-lg">
              <span className="font-display text-base font-bold text-foreground">🌹 Rose Garden</span>
            </div>
            <div className="bg-card/80 backdrop-blur-md rounded-lg px-2 py-1 border border-border/50 text-xs font-body text-muted-foreground">
              {WEATHER_LABELS[weather]}
            </div>
            <div className="bg-card/80 backdrop-blur-md rounded-lg px-2 py-1 border border-border/50 text-xs font-body text-muted-foreground">
              {TIME_LABELS(timeOfDay)}
            </div>
            {flying && (
              <div className="bg-primary/80 backdrop-blur-md rounded-lg px-2 py-1 border border-border/50 text-xs font-body font-bold text-primary-foreground animate-pulse">
                ✈️ Flying
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={onOpenDonate} className="bg-primary/80 backdrop-blur-md rounded-lg px-2.5 py-1 border border-border/50 flex items-center gap-1 hover:bg-primary transition-colors">
              <span className="text-xs">🌳</span>
              <span className="font-body font-bold text-xs text-primary-foreground">{totalTrees}</span>
            </button>
            <div className="bg-card/80 backdrop-blur-md rounded-lg px-2.5 py-1 border border-border/50 flex items-center gap-1">
              <span className="text-xs">🪙</span>
              <span className="font-body font-bold text-xs text-accent-foreground">{coins}</span>
            </div>
            <div className="bg-card/80 backdrop-blur-md rounded-lg px-2.5 py-1 border border-border/50 flex items-center gap-1">
              <span className="text-xs">⭐</span>
              <span className="font-body font-bold text-xs text-accent-foreground">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="relative">
          <div className="w-0.5 h-5 bg-foreground/60 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="h-0.5 w-5 bg-foreground/60 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="w-1 h-1 bg-foreground/80 rounded-full absolute -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Active tool indicator (center bottom) */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-card/60 backdrop-blur-md rounded-lg px-3 py-1 border border-border/30 text-center">
          <span className="text-lg">{TOOLS.find(t => t.tool === selectedTool)?.emoji}</span>
          <span className="font-body font-bold text-xs text-foreground ml-1.5">{TOOLS.find(t => t.tool === selectedTool)?.label}</span>
          {selectedTool === 'plant' && (
            <span className="ml-1.5 text-sm">{COLOR_DISPLAY[selectedColor]?.emoji}</span>
          )}
        </div>
      </div>

      {/* Bottom toolbar — Minecraft hotbar style */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-end justify-center p-3 gap-2 pointer-events-auto">
          {/* Tools hotbar */}
          <div className="bg-card/80 backdrop-blur-md rounded-xl p-1.5 border-2 border-border/60 shadow-2xl flex gap-0.5">
            {TOOLS.map(({ tool, emoji, label, key }) => (
              <button
                key={tool}
                onClick={() => onSelectTool(tool)}
                className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center transition-all relative
                  ${selectedTool === tool
                    ? 'bg-primary/90 text-primary-foreground scale-105 shadow-lg ring-2 ring-primary-foreground/30'
                    : 'hover:bg-muted/80 text-foreground'}`}
                title={`${label} [${key}]`}
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-[8px] font-body font-bold opacity-70">{key}</span>
              </button>
            ))}
            <div className="w-px bg-border/50 mx-0.5" />
            {/* Color slots when planting */}
            {selectedTool === 'plant' && unlockedColors.map(color => (
              <button
                key={color}
                onClick={() => onSelectColor(color)}
                className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all
                  ${selectedColor === color
                    ? 'ring-2 ring-primary scale-105 bg-muted/50'
                    : 'hover:bg-muted/50'}`}
                title={color}
              >
                <span className="text-xl">{COLOR_DISPLAY[color].emoji}</span>
              </button>
            ))}
          </div>

          {/* Quick action buttons */}
          <div className="bg-card/80 backdrop-blur-md rounded-xl p-1.5 border-2 border-border/60 shadow-2xl flex gap-0.5">
            <button onClick={() => setShowInventory(!showInventory)} className="w-14 h-14 rounded-lg flex flex-col items-center justify-center hover:bg-muted/80 transition-all relative" title="Inventory [I]">
              <span className="text-xl">🧺</span>
              {totalRoses > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">{totalRoses}</span>
              )}
              <span className="text-[8px] font-body font-bold opacity-70">I</span>
            </button>
            <button onClick={onOpenShop} className="w-14 h-14 rounded-lg flex flex-col items-center justify-center hover:bg-muted/80 transition-all" title="Shop [E]">
              <span className="text-xl">🏪</span>
              <span className="text-[8px] font-body font-bold opacity-70">E</span>
            </button>
            <button onClick={onOpenBouquet} className="w-14 h-14 rounded-lg flex flex-col items-center justify-center hover:bg-muted/80 transition-all" title="Bouquet [B]">
              <span className="text-xl">💐</span>
              <span className="text-[8px] font-body font-bold opacity-70">B</span>
            </button>
            <button onClick={() => setShowDecoMenu(!showDecoMenu)} className="w-14 h-14 rounded-lg flex flex-col items-center justify-center hover:bg-muted/80 transition-all" title="Decorations [G]">
              <span className="text-xl">🏮</span>
              <span className="text-[8px] font-body font-bold opacity-70">G</span>
            </button>
          </div>
        </div>

        {/* Inventory popup */}
        {showInventory && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md rounded-xl p-4 border border-border shadow-2xl w-72 pointer-events-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-foreground text-sm">🧺 Basket</h3>
              <button onClick={() => setShowInventory(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(basket) as [RoseColor, number][])
                .filter(([_, count]) => count > 0)
                .map(([color, count]) => (
                  <div key={color} className="flex flex-col items-center bg-muted/50 rounded-lg p-2">
                    <span className="text-xl">{COLOR_DISPLAY[color]?.emoji || '🌹'}</span>
                    <span className="font-body font-bold text-xs text-foreground">{count}</span>
                    <span className="font-body text-[10px] text-muted-foreground capitalize">{color}</span>
                  </div>
                ))}
            </div>
            {totalRoses === 0 && (
              <p className="font-body text-xs text-muted-foreground text-center py-3">Empty — pick some roses!</p>
            )}
          </div>
        )}

        {/* Decoration menu */}
        {showDecoMenu && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md rounded-xl p-4 border border-border shadow-2xl w-72 pointer-events-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-foreground text-sm">🏮 Decorations ({decorationCount})</h3>
              <button onClick={() => setShowDecoMenu(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DECORATION_TYPES.map(deco => (
                <button
                  key={deco.type}
                  onClick={() => { onPlaceDecoration?.(deco.type); setShowDecoMenu(false); }}
                  className="flex flex-col items-center bg-muted/50 rounded-lg p-2 hover:bg-muted transition-colors"
                >
                  <span className="text-2xl">{deco.emoji}</span>
                  <span className="font-body text-[10px] text-foreground font-bold">{deco.name}</span>
                  <span className="font-body text-[9px] text-muted-foreground">🪙 15</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls hint */}
      {controlsVisible && (
        <div className="absolute top-14 left-2 z-20 pointer-events-none animate-fade-in">
          <div className="bg-card/70 backdrop-blur-md rounded-lg px-3 py-2 border border-border/50 text-[11px] font-body text-muted-foreground space-y-0.5 leading-relaxed">
            <p><kbd className="bg-muted px-1 rounded text-[10px]">W A S D</kbd> Move</p>
            <p><kbd className="bg-muted px-1 rounded text-[10px]">Mouse</kbd> Look</p>
            <p><kbd className="bg-muted px-1 rounded text-[10px]">Space</kbd> Jump · <kbd className="bg-muted px-1 rounded text-[10px]">F</kbd> Fly</p>
            <p><kbd className="bg-muted px-1 rounded text-[10px]">C</kbd> Descend · <kbd className="bg-muted px-1 rounded text-[10px]">Shift</kbd> Sprint</p>
            <p><kbd className="bg-muted px-1 rounded text-[10px]">1-4</kbd> Tools · <kbd className="bg-muted px-1 rounded text-[10px]">E</kbd> Shop</p>
            <p><kbd className="bg-muted px-1 rounded text-[10px]">I</kbd> Inventory · <kbd className="bg-muted px-1 rounded text-[10px]">B</kbd> Bouquet</p>
            <p><kbd className="bg-muted px-1 rounded text-[10px]">G</kbd> Decor · <kbd className="bg-muted px-1 rounded text-[10px]">H</kbd> Hide</p>
            <p className="text-[9px] italic opacity-60 mt-1">Click canvas to lock cursor</p>
          </div>
        </div>
      )}
    </>
  );
}
