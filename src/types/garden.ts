export type RoseColor = 'red' | 'pink' | 'white' | 'yellow';

export type GrowthStage = 'seed' | 'sprout' | 'bud' | 'bloom';

export interface RosePlot {
  id: string;
  color: RoseColor;
  stage: GrowthStage;
  watered: boolean;
  lastWatered: number;
}

export type Tool = 'hand' | 'water' | 'plant' | 'scissors';

export interface GameState {
  plots: (RosePlot | null)[];
  basket: Record<RoseColor, number>;
  score: number;
  selectedTool: Tool;
  selectedColor: RoseColor;
}
