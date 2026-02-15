import { useState, useCallback, useRef, useEffect } from 'react';
import { useGarden } from '@/hooks/useGarden';
import { useSound } from '@/hooks/useSound';
import { useTreeTracker } from '@/hooks/useTreeTracker';
import { GardenScene } from '@/components/game3d/GardenScene';
import { GameHUD } from '@/components/game3d/GameHUD';
import { Shop } from '@/components/game/Shop';
import { BouquetBuilder } from '@/components/game/BouquetBuilder';
import { DonationPanel } from '@/components/game/DonationPanel';
import type { Decoration } from '@/components/game3d/VoxelTerrain';

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
  const [flying, setFlying] = useState(false);
  const [decorations, setDecorations] = useState<Decoration[]>([]);

  // Day/night cycle — full cycle every 5 minutes
  const [timeOfDay, setTimeOfDay] = useState(0.45); // Start at morning
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(prev => (prev + 0.0003) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handlePlotClickWithSound = useCallback((index: number) => {
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
  }, [state.plots, state.selectedTool, sound, handlePlotClick]);

  const handlePlaceDecoration = useCallback((type: string) => {
    // Place decoration at a random position near the garden
    const x = 2 + Math.random() * 12;
    const z = 2 + Math.random() * 12;
    const newDeco: Decoration = {
      id: `deco-${Date.now()}-${Math.random()}`,
      type,
      position: [x, 1.5, z],
    };
    setDecorations(prev => [...prev, newDeco]);
    sound.playCoin();
  }, [sound]);

  // Handle escape to close modals
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowShop(false);
        setShowBouquet(false);
        setShowDonate(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-background">
      {/* 3D Canvas */}
      <GardenScene
        plots={state.plots}
        pickingId={pickingId}
        wateringId={wateringId}
        bloomingId={bloomingId}
        weather={state.weather}
        onPlotClick={handlePlotClickWithSound}
        decorations={decorations}
        timeOfDay={timeOfDay}
        onFlyingChange={setFlying}
      />

      {/* HUD Overlay */}
      <GameHUD
        selectedTool={state.selectedTool}
        selectedColor={state.selectedColor}
        unlockedColors={state.unlockedColors}
        coins={state.coins}
        score={state.score}
        weather={state.weather}
        basket={state.basket}
        onSelectTool={selectTool}
        onSelectColor={selectColor}
        onOpenShop={() => setShowShop(true)}
        onOpenBouquet={() => setShowBouquet(true)}
        onOpenDonate={() => setShowDonate(true)}
        totalTrees={totalTrees}
        timeOfDay={timeOfDay}
        flying={flying}
        onPlaceDecoration={handlePlaceDecoration}
        decorationCount={decorations.length}
      />

      {/* Sound controls */}
      <div className="absolute top-2 right-2 z-20 flex gap-1">
        <button onClick={sound.toggleMute} className="bg-card/80 backdrop-blur-md rounded-lg w-9 h-9 flex items-center justify-center border border-border/50 text-base hover:bg-muted transition-colors">
          {sound.muted ? '🔇' : '🔊'}
        </button>
        <button onClick={sound.musicPlaying ? sound.stopMusic : sound.startMusic} className="bg-card/80 backdrop-blur-md rounded-lg w-9 h-9 flex items-center justify-center border border-border/50 text-base hover:bg-muted transition-colors">
          {sound.musicPlaying ? '🎵' : '🎶'}
        </button>
      </div>

      {/* Modals */}
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
