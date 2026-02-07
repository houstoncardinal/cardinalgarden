import type { Tool, RoseColor } from '@/types/garden';

const TOOLS: { tool: Tool; emoji: string; label: string }[] = [
  { tool: 'hand', emoji: '✋', label: 'Pick' },
  { tool: 'water', emoji: '💧', label: 'Water' },
  { tool: 'plant', emoji: '🌱', label: 'Plant' },
  { tool: 'scissors', emoji: '✂️', label: 'Trim' },
];

const ALL_COLORS: { color: RoseColor; emoji: string }[] = [
  { color: 'red', emoji: '🌹' },
  { color: 'pink', emoji: '🌸' },
  { color: 'white', emoji: '🤍' },
  { color: 'yellow', emoji: '🌻' },
  { color: 'purple', emoji: '🪻' },
  { color: 'black', emoji: '🖤' },
  { color: 'rainbow', emoji: '🌈' },
];

interface Props {
  selectedTool: Tool;
  selectedColor: RoseColor;
  unlockedColors: RoseColor[];
  onSelectTool: (tool: Tool) => void;
  onSelectColor: (color: RoseColor) => void;
}

export function Toolbar({ selectedTool, selectedColor, unlockedColors, onSelectTool, onSelectColor }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 bg-card rounded-xl p-1.5 shadow-md border border-border">
        {TOOLS.map(({ tool, emoji, label }) => (
          <button
            key={tool}
            onClick={() => onSelectTool(tool)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all text-sm font-body font-semibold
              ${selectedTool === tool
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'hover:bg-muted text-foreground'
              }`}
            title={label}
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>

      {selectedTool === 'plant' && (
        <div className="flex items-center gap-1 bg-card rounded-xl p-1.5 shadow-md border border-border animate-bounce-in">
          {ALL_COLORS.filter(({ color }) => unlockedColors.includes(color)).map(({ color, emoji }) => (
            <button
              key={color}
              onClick={() => onSelectColor(color)}
              className={`text-2xl px-2 py-1 rounded-lg transition-all
                ${selectedColor === color ? 'bg-secondary/20 scale-110 ring-2 ring-secondary' : 'hover:bg-muted'}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
