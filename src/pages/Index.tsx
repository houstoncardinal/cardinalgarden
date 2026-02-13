import { useState } from 'react';
import { useGarden } from '@/hooks/useGarden';
import { useSound } from '@/hooks/useSound';
import { useTreeTracker } from '@/hooks/useTreeTracker';
import { GardenGrid } from '@/components/game/GardenGrid';
import { Toolbar } from '@/components/game/Toolbar';
import { Basket } from '@/components/game/Basket';
import { HelpPanel } from '@/components/game/HelpPanel';
import { WeatherEffects } from '@/components/game/WeatherEffects';
import { Shop } from '@/components/game/Shop';
import { BouquetBuilder } from '@/components/game/BouquetBuilder';
import { DonationPanel } from '@/components/game/DonationPanel';

const WEATHER_LABELS: Record<string, string> = {
  clear: '🌤️ Clear',
  sunny: '☀️ Sunny (2x growth!)',
  rainy: '🌧️ Rainy (auto-water!)',
};

const Index = () => {
  const {
    state,
    pickingId,
    wateringId,
    bloomingId,
    selectTool,
    selectColor,
    handlePlotClick,
    buyItem,
    sellBouquet,
    createBouquet,
  } = useGarden();

  const sound = useSound();
  const { totalTrees } = useTreeTracker();
  const [showShop, setShowShop] = useState(false);
  const [showBouquet, setShowBouquet] = useState(false);
  const [showDonate, setShowDonate] = useState(false);

  const handlePlotClickWithSound = (index: number) => {
    const plot = state.plots[index];
    if (!plot && state.selectedTool === 'plant') {
      sound.playPlant();
    } else if (plot && state.selectedTool === 'hand' && plot.stage === 'bloom') {
      sound.playPick();
    } else if (plot && state.selectedTool === 'scissors' && plot.stage === 'bloom') {
      sound.playPick();
    } else if (plot && state.selectedTool === 'water' && !plot.watered) {
      sound.playWater();
    }
    handlePlotClick(index);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <WeatherEffects weather={state.weather} />

      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            🌹 Rose Garden
          </h1>
          <div className="flex items-center gap-2">
            <span className="bg-muted rounded-full px-3 py-1 font-body text-xs text-muted-foreground">
              {WEATHER_LABELS[state.weather]}
            </span>
            <button onClick={() => setShowDonate(true)} className="flex items-center gap-1 bg-primary/20 rounded-full px-3 py-1.5 hover:bg-primary/30 transition-colors">
              <span className="text-sm">🌳</span>
              <span className="font-body font-bold text-sm text-primary">{totalTrees}</span>
            </button>
            <div className="flex items-center gap-1 bg-accent/30 rounded-full px-3 py-1.5">
              <span className="text-sm">🪙</span>
              <span className="font-body font-bold text-sm text-accent-foreground">{state.coins}</span>
            </div>
            <div className="flex items-center gap-1 bg-accent/30 rounded-full px-3 py-1.5">
              <span className="text-sm">⭐</span>
              <span className="font-body font-bold text-sm text-accent-foreground">{state.score}</span>
            </div>
            <button onClick={sound.toggleMute} className="text-xl hover:scale-110 transition-transform" title={sound.muted ? 'Unmute' : 'Mute'}>
              {sound.muted ? '🔇' : '🔊'}
            </button>
            <button onClick={sound.musicPlaying ? sound.stopMusic : sound.startMusic} className="text-xl hover:scale-110 transition-transform" title="Toggle music">
              {sound.musicPlaying ? '🎵' : '🎶'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6 relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          <Toolbar
            selectedTool={state.selectedTool}
            selectedColor={state.selectedColor}
            unlockedColors={state.unlockedColors}
            onSelectTool={selectTool}
            onSelectColor={selectColor}
          />
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setShowShop(true)}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-body font-bold text-sm hover:scale-105 transition-transform shadow-md"
            >
              🏪 Shop
            </button>
            <button
              onClick={() => setShowBouquet(true)}
              className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground font-body font-bold text-sm hover:scale-105 transition-transform shadow-md"
            >
              💐 Bouquet
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          <div className="bg-garden-light/20 rounded-2xl p-4 sm:p-6 border-2 border-garden-light/40 shadow-inner">
            <GardenGrid
              plots={state.plots}
              pickingId={pickingId}
              wateringId={wateringId}
              bloomingId={bloomingId}
              onPlotClick={handlePlotClickWithSound}
            />
          </div>

          <div className="space-y-4">
            <Basket basket={state.basket} score={state.score} />
            {state.bouquets.length > 0 && (
              <div className="bg-card rounded-2xl p-5 shadow-lg border border-border">
                <h2 className="font-display text-lg font-bold text-foreground mb-3">💐 My Bouquets</h2>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {state.bouquets.slice(-5).reverse().map(b => (
                    <div key={b.id} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm">
                      <span>💐</span>
                      <span className="font-body font-semibold text-foreground flex-1">{b.name}</span>
                      <span className="font-body text-muted-foreground text-xs">{b.roses.length} roses</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <HelpPanel />
          </div>
        </div>
      </main>

      {showShop && (
        <Shop
          coins={state.coins}
          basket={state.basket}
          unlockedColors={state.unlockedColors}
          bouquets={state.bouquets}
          onBuyItem={(item) => { buyItem(item); sound.playCoin(); }}
          onSellBouquet={(recipe) => { sellBouquet(recipe); sound.playCoin(); }}
          onClose={() => setShowShop(false)}
        />
      )}

      {showBouquet && (
        <BouquetBuilder
          basket={state.basket}
          onCreateBouquet={createBouquet}
          onClose={() => setShowBouquet(false)}
        />
      )}

      {showDonate && (
        <DonationPanel onClose={() => setShowDonate(false)} />
      )}
    </div>
  );
};

export default Index;
