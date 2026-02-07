export type RoseColor = 'red' | 'pink' | 'white' | 'yellow' | 'purple' | 'black' | 'rainbow';

export type GrowthStage = 'seed' | 'sprout' | 'bud' | 'bloom';

export type Weather = 'sunny' | 'rainy' | 'clear';

export interface RosePlot {
  id: string;
  color: RoseColor;
  stage: GrowthStage;
  watered: boolean;
  lastWatered: number;
}

export type Tool = 'hand' | 'water' | 'plant' | 'scissors';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'rose' | 'upgrade';
  emoji: string;
  color?: RoseColor;
  effect?: string;
}

export interface Bouquet {
  id: string;
  name: string;
  roses: RoseColor[];
  createdAt: number;
  value: number;
}

export interface GameState {
  plots: (RosePlot | null)[];
  basket: Record<RoseColor, number>;
  score: number;
  coins: number;
  selectedTool: Tool;
  selectedColor: RoseColor;
  weather: Weather;
  weatherTimer: number;
  bouquets: Bouquet[];
  unlockedColors: RoseColor[];
  growthSpeed: number; // multiplier
  autoWaterChance: number; // 0-1
}
