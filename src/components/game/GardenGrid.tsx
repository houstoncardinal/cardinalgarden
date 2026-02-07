import type { RosePlot } from '@/types/garden';
import { RosePlotCell } from './RosePlot';

interface Props {
  plots: (RosePlot | null)[];
  pickingId: string | null;
  wateringId: string | null;
  bloomingId: string | null;
  onPlotClick: (index: number) => void;
}

export function GardenGrid({ plots, pickingId, wateringId, bloomingId, onPlotClick }: Props) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
      {plots.map((plot, i) => (
        <RosePlotCell
          key={plot?.id ?? `empty-${i}`}
          plot={plot}
          isPicking={plot?.id === pickingId}
          isWatering={plot?.id === wateringId}
          isBlooming={plot?.id === bloomingId}
          onClick={() => onPlotClick(i)}
        />
      ))}
    </div>
  );
}
