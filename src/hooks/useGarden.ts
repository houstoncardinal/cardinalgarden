import { useState, useCallback, useEffect } from 'react';
import type { GameState, RosePlot, RoseColor, GrowthStage, Tool, ShopItem, Bouquet, Weather } from '@/types/garden';

const GRID_SIZE = 20;

const BASE_COLORS: RoseColor[] = ['red', 'pink', 'white', 'yellow'];

const randomColor = (): RoseColor => {
  return BASE_COLORS[Math.floor(Math.random() * BASE_COLORS.length)];
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

const emptyBasket = (): Record<RoseColor, number> => ({
  red: 0, pink: 0, white: 0, yellow: 0, purple: 0, black: 0, rainbow: 0,
});

const WEATHERS: Weather[] = ['clear', 'sunny', 'rainy'];

export function useGarden() {
  const [state, setState] = useState<GameState>({
    plots: createInitialPlots(),
    basket: emptyBasket(),
    score: 0,
    coins: 50,
    selectedTool: 'hand',
    selectedColor: 'red',
    weather: 'clear',
    weatherTimer: 0,
    bouquets: [],
    unlockedColors: ['red', 'pink', 'white', 'yellow'],
    growthSpeed: 1,
    autoWaterChance: 0,
  });

  const [pickingId, setPickingId] = useState<string | null>(null);
  const [wateringId, setWateringId] = useState<string | null>(null);
  const [bloomingId, setBloomingId] = useState<string | null>(null);

  // Weather timer
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const newWeather = WEATHERS[Math.floor(Math.random() * WEATHERS.length)];
        let plots = prev.plots;
        // Rain auto-waters
        if (newWeather === 'rainy') {
          plots = plots.map(plot => {
            if (!plot || plot.watered) return plot;
            if (Math.random() < 0.5 + prev.autoWaterChance) {
              return { ...plot, watered: true, lastWatered: Date.now() };
            }
            return plot;
          });
        }
        return { ...prev, weather: newWeather, plots };
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

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
    }, Math.max(1000, 4000 / state.growthSpeed * (state.weather === 'sunny' ? 0.5 : 1)));
    return () => clearInterval(interval);
  }, [state.growthSpeed, state.weather]);

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

      if (!plot && tool === 'plant') {
        if (!prev.unlockedColors.includes(prev.selectedColor)) return prev;
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
              coins: p.coins + 3,
            };
          });
        }, 500);
        return prev;
      }

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
              coins: p.coins + 5,
            };
          });
        }, 500);
        return prev;
      }

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

  const buyItem = useCallback((item: ShopItem) => {
    setState(prev => {
      if (prev.coins < item.price) return prev;
      let next = { ...prev, coins: prev.coins - item.price };
      if (item.type === 'rose' && item.color && !prev.unlockedColors.includes(item.color)) {
        next.unlockedColors = [...prev.unlockedColors, item.color];
      }
      if (item.effect === 'growthSpeed') {
        next.growthSpeed = prev.growthSpeed * 2;
      }
      if (item.effect === 'autoWater') {
        next.autoWaterChance = Math.min(1, prev.autoWaterChance + 0.25);
      }
      return next;
    });
  }, []);

  const sellBouquet = useCallback((recipe: { name: string; requires: RoseColor[]; value: number }) => {
    setState(prev => {
      const newBasket = { ...prev.basket };
      for (const c of recipe.requires) {
        if (newBasket[c] <= 0) return prev;
        newBasket[c]--;
      }
      const bouquet: Bouquet = {
        id: `bouquet-${Date.now()}`,
        name: recipe.name,
        roses: recipe.requires,
        createdAt: Date.now(),
        value: recipe.value,
      };
      return {
        ...prev,
        basket: newBasket,
        coins: prev.coins + recipe.value,
        score: prev.score + recipe.value,
        bouquets: [...prev.bouquets, bouquet],
      };
    });
  }, []);

  const createBouquet = useCallback((roses: RoseColor[], name: string) => {
    setState(prev => {
      const newBasket = { ...prev.basket };
      for (const c of roses) {
        if (newBasket[c] <= 0) return prev;
        newBasket[c]--;
      }
      const value = roses.length * 8;
      const bouquet: Bouquet = {
        id: `bouquet-${Date.now()}`,
        name,
        roses,
        createdAt: Date.now(),
        value,
      };
      return {
        ...prev,
        basket: newBasket,
        score: prev.score + value,
        bouquets: [...prev.bouquets, bouquet],
      };
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
    buyItem,
    sellBouquet,
    createBouquet,
  };
}
