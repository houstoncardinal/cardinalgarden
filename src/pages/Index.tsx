import { useState } from 'react';
import { useGarden } from '@/hooks/useGarden';
import { useSound } from '@/hooks/useSound';
import { useTreeTracker } from '@/hooks/useTreeTracker';
import { GardenScene } from '@/components/game3d/GardenScene';
import { GameHUD } from '@/components/game3d/GameHUD';
import { Shop } from '@/components/game/Shop';
import { BouquetBuilder } from '@/components/game/BouquetBuilder';
import { DonationPanel } from '@/components/game/DonationPanel';

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
    <div className="w-screen h-screen relative overflow-hidden bg-background">
      {/* 3D Canvas - full screen */}
      <GardenScene
        plots={state.plots}
        pickingId={pickingId}
        wateringId={wateringId}
        bloomingId={bloomingId}
        weather={state.weather}
        onPlotClick={handlePlotClickWithSound}
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
      />

      {/* Sound controls */}
      <div className="absolute top-3 right-3 z-20 flex gap-1">
        <button onClick={sound.toggleMute} className="bg-card/90 backdrop-blur-sm rounded-lg w-10 h-10 flex items-center justify-center border border-border text-lg hover:bg-muted transition-colors">
          {sound.muted ? '🔇' : '🔊'}
        </button>
        <button onClick={sound.musicPlaying ? sound.stopMusic : sound.startMusic} className="bg-card/90 backdrop-blur-sm rounded-lg w-10 h-10 flex items-center justify-center border border-border text-lg hover:bg-muted transition-colors">
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
