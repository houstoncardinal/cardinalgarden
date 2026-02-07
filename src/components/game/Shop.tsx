import { useState } from 'react';
import type { ShopItem, RoseColor, Bouquet } from '@/types/garden';

const SHOP_ITEMS: ShopItem[] = [
  { id: 'purple', name: 'Purple Rose', description: 'Rare and elegant', price: 50, type: 'rose', emoji: '🪻', color: 'purple' },
  { id: 'black', name: 'Black Rose', description: 'Mysterious and dark', price: 100, type: 'rose', emoji: '🖤', color: 'black' },
  { id: 'rainbow', name: 'Rainbow Rose', description: 'Magical prismatic petals', price: 200, type: 'rose', emoji: '🌈', color: 'rainbow' },
  { id: 'speed', name: 'Growth Boost', description: '2x growth speed', price: 75, type: 'upgrade', emoji: '⚡', effect: 'growthSpeed' },
  { id: 'autowater', name: 'Sprinkler', description: '+25% auto-water chance', price: 120, type: 'upgrade', emoji: '🚿', effect: 'autoWater' },
];

const BOUQUET_RECIPES: { name: string; requires: RoseColor[]; value: number; emoji: string }[] = [
  { name: 'Classic Dozen', requires: ['red', 'red', 'red'], value: 30, emoji: '💐' },
  { name: 'Pastel Mix', requires: ['pink', 'white', 'yellow'], value: 40, emoji: '🌺' },
  { name: 'Royal Bouquet', requires: ['purple', 'red', 'pink'], value: 60, emoji: '👑' },
  { name: 'Shadow & Light', requires: ['black', 'white'], value: 80, emoji: '🌓' },
  { name: 'Rainbow Dream', requires: ['rainbow', 'pink', 'yellow'], value: 120, emoji: '✨' },
];

interface Props {
  coins: number;
  basket: Record<RoseColor, number>;
  unlockedColors: RoseColor[];
  bouquets: Bouquet[];
  onBuyItem: (item: ShopItem) => void;
  onSellBouquet: (recipe: typeof BOUQUET_RECIPES[0]) => void;
  onClose: () => void;
}

export function Shop({ coins, basket, unlockedColors, bouquets, onBuyItem, onSellBouquet, onClose }: Props) {
  const [tab, setTab] = useState<'buy' | 'sell' | 'bouquets'>('buy');

  const canAffordItem = (item: ShopItem) => coins >= item.price;
  const isUnlocked = (item: ShopItem) => item.color ? unlockedColors.includes(item.color) : false;

  const canMakeBouquet = (recipe: typeof BOUQUET_RECIPES[0]) => {
    const needed: Partial<Record<RoseColor, number>> = {};
    recipe.requires.forEach(c => { needed[c] = (needed[c] || 0) + 1; });
    return Object.entries(needed).every(([c, n]) => basket[c as RoseColor] >= (n ?? 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[80vh] overflow-auto animate-bounce-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display text-xl font-bold text-foreground">🏪 Garden Shop</h2>
          <div className="flex items-center gap-3">
            <span className="bg-accent/20 rounded-full px-3 py-1 font-body font-bold text-accent-foreground">🪙 {coins}</span>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
          </div>
        </div>

        <div className="flex border-b border-border">
          {(['buy', 'sell', 'bouquets'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 font-body font-semibold text-sm capitalize transition-colors
                ${tab === t ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t === 'buy' ? '🛒 Buy' : t === 'sell' ? '💰 Sell' : '💐 Bouquets'}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">
          {tab === 'buy' && SHOP_ITEMS.map(item => {
            const owned = item.type === 'rose' && isUnlocked(item);
            return (
              <div key={item.id} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                <span className="text-3xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-bold text-foreground text-sm">{item.name}</p>
                  <p className="font-body text-xs text-muted-foreground">{item.description}</p>
                </div>
                <button
                  onClick={() => onBuyItem(item)}
                  disabled={!canAffordItem(item) || owned}
                  className={`px-3 py-1.5 rounded-lg font-body font-bold text-sm transition-all
                    ${owned ? 'bg-primary/20 text-primary cursor-default' : canAffordItem(item) ? 'bg-primary text-primary-foreground hover:scale-105' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                >
                  {owned ? '✓ Owned' : `🪙 ${item.price}`}
                </button>
              </div>
            );
          })}

          {tab === 'sell' && BOUQUET_RECIPES.map(recipe => (
            <div key={recipe.name} className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
              <span className="text-3xl">{recipe.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body font-bold text-foreground text-sm">{recipe.name}</p>
                <p className="font-body text-xs text-muted-foreground">
                  Needs: {recipe.requires.join(', ')}
                </p>
              </div>
              <button
                onClick={() => onSellBouquet(recipe)}
                disabled={!canMakeBouquet(recipe)}
                className={`px-3 py-1.5 rounded-lg font-body font-bold text-sm transition-all
                  ${canMakeBouquet(recipe) ? 'bg-accent text-accent-foreground hover:scale-105' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
              >
                🪙 +{recipe.value}
              </button>
            </div>
          ))}

          {tab === 'bouquets' && (
            bouquets.length === 0
              ? <p className="text-center text-muted-foreground font-body py-8">No bouquets yet! Sell arrangements in the Sell tab.</p>
              : <div className="grid grid-cols-2 gap-3">
                  {bouquets.map(b => (
                    <div key={b.id} className="bg-muted/50 rounded-xl p-3 text-center">
                      <div className="text-3xl mb-1">💐</div>
                      <p className="font-body font-bold text-foreground text-sm">{b.name}</p>
                      <p className="font-body text-xs text-muted-foreground">
                        {b.roses.map((c, i) => {
                          const emojis: Record<string, string> = { red: '🌹', pink: '🌸', white: '🤍', yellow: '🌻', purple: '🪻', black: '🖤', rainbow: '🌈' };
                          return <span key={i}>{emojis[c]}</span>;
                        })}
                      </p>
                      <p className="font-body text-xs text-accent-foreground mt-1">🪙 {b.value}</p>
                    </div>
                  ))}
                </div>
          )}
        </div>
      </div>
    </div>
  );
}
