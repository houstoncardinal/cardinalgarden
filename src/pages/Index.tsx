import { useGarden } from '@/hooks/useGarden';
import { GardenGrid } from '@/components/game/GardenGrid';
import { Toolbar } from '@/components/game/Toolbar';
import { Basket } from '@/components/game/Basket';
import { HelpPanel } from '@/components/game/HelpPanel';

const Index = () => {
  const {
    state,
    pickingId,
    wateringId,
    bloomingId,
    selectTool,
    selectColor,
    handlePlotClick,
  } = useGarden();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            🌹 Rose Garden
          </h1>
          <div className="flex items-center gap-2 bg-accent/30 rounded-full px-4 py-1.5">
            <span className="text-lg">⭐</span>
            <span className="font-body font-bold text-lg text-accent-foreground">{state.score}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Toolbar */}
        <Toolbar
          selectedTool={state.selectedTool}
          selectedColor={state.selectedColor}
          onSelectTool={selectTool}
          onSelectColor={selectColor}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          {/* Garden */}
          <div className="bg-garden-light/20 rounded-2xl p-4 sm:p-6 border-2 border-garden-light/40 shadow-inner">
            <GardenGrid
              plots={state.plots}
              pickingId={pickingId}
              wateringId={wateringId}
              bloomingId={bloomingId}
              onPlotClick={handlePlotClick}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Basket basket={state.basket} score={state.score} />
            <HelpPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
