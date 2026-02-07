import { useState, useCallback, useEffect } from 'react';
import type { GameState, RosePlot, RoseColor, GrowthStage, Tool } from '@/types/garden';

const GRID_SIZE = 20;

const randomColor = (): RoseColor => {
  const colors: RoseColor[] = ['red', 'pink', 'white', 'yellow'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const randomStage = (): GrowthStage => {
  const stages: GrowthStage[] = ['sprout', 'bud', 'bloom', 'bloom', 'bloom'];
  return stages[Math.floor(Math.random() * stages.length)];
};

const createInitialPlots = (): (RosePlot | null)[] => {
  return Array.from({ length: GRID_SIZE }, (_, i) => {
    if (Math.random() > 0.4) {
      return {
        id: `plot-${i}`,
        color: randomColor(),
        stage: randomStage(),
        watered: false,
        lastWatered: 0,
      };
    }
    return null;
  });
};

export function useGarden() {
  const [state, setState] = useState<GameState>({
    plots: createInitialPlots(),
    basket: { red: 0, pink: 0, white: 0, yellow: 0 },
    score: 0,
    selectedTool: 'hand',
    selectedColor: 'red',
  });

  const [pickingId, setPickingId] = useState<string | null>(null);
  const [wateringId, setWateringId] = useState<string | null>(null);
  const [bloomingId, setBloomingId] = useState<string | null>(null);

  // Growth timer
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        plots: prev.plots.map(plot => {
          if (!plot) return null;
          if (plot.watered && plot.stage !== 'bloom') {
            const stages: GrowthStage[] = ['seed', 'sprout', 'bud', 'bloom'];
            const idx = stages.indexOf(plot.stage);
            if (idx < stages.length - 1) {
              return { ...plot, stage: stages[idx + 1], watered: false };
            }
          }
          return plot;
        }),
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const selectTool = useCallback((tool: Tool) => {
    setState(prev => ({ ...prev, selectedTool: tool }));
  }, []);

  const selectColor = useCallback((color: RoseColor) => {
    setState(prev => ({ ...prev, selectedColor: color }));
  }, []);

  const handlePlotClick = useCallback((index: number) => {
    setState(prev => {
      const plot = prev.plots[index];
      const tool = prev.selectedTool;

      // Plant on empty plot
      if (!plot && tool === 'plant') {
        const newPlots = [...prev.plots];
        const newId = `plot-${Date.now()}-${index}`;
        newPlots[index] = {
          id: newId,
          color: prev.selectedColor,
          stage: 'seed',
          watered: false,
          lastWatered: 0,
        };
        setBloomingId(newId);
        setTimeout(() => setBloomingId(null), 700);
        return { ...prev, plots: newPlots, score: prev.score + 5 };
      }

      if (!plot) return prev;

      // Pick a bloom
      if (tool === 'hand' && plot.stage === 'bloom') {
        setPickingId(plot.id);
        setTimeout(() => {
          setPickingId(null);
          setState(p => {
            const newPlots = [...p.plots];
            newPlots[index] = null;
            return {
              ...p,
              plots: newPlots,
              basket: { ...p.basket, [plot.color]: p.basket[plot.color] + 1 },
              score: p.score + 10,
            };
          });
        }, 500);
        return prev;
      }

      // Trim with scissors
      if (tool === 'scissors' && plot.stage === 'bloom') {
        setPickingId(plot.id);
        setTimeout(() => {
          setPickingId(null);
          setState(p => {
            const newPlots = [...p.plots];
            newPlots[index] = { ...plot, stage: 'sprout', watered: false };
            return {
              ...p,
              plots: newPlots,
              basket: { ...p.basket, [plot.color]: p.basket[plot.color] + 1 },
              score: p.score + 15,
            };
          });
        }, 500);
        return prev;
      }

      // Water
      if (tool === 'water' && !plot.watered) {
        setWateringId(plot.id);
        setTimeout(() => setWateringId(null), 600);
        const newPlots = [...prev.plots];
        newPlots[index] = { ...plot, watered: true, lastWatered: Date.now() };
        return { ...prev, plots: newPlots, score: prev.score + 2 };
      }

      return prev;
    });
  }, []);

  return {
    state,
    pickingId,
    wateringId,
    bloomingId,
    selectTool,
    selectColor,
    handlePlotClick,
  };
}
