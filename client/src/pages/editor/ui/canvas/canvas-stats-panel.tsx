import { Panel } from '@xyflow/react';
import { LayoutGrid, Share2 } from 'lucide-react';

type CanvasStatsPanelProps = {
    nodesCount: number;
    edgesCount: number;
};

export const CanvasStatsPanel = ({
    nodesCount,
    edgesCount,
}: CanvasStatsPanelProps) => {
    return (
        <Panel
            position="bottom-left"
            className="bg-card/70 text-muted-foreground flex items-center gap-3 rounded-md border px-2 py-1 text-[10px] shadow-sm backdrop-blur-sm"
        >
            <span className="flex items-center gap-1">
                <LayoutGrid className="size-3 opacity-60" />
                {nodesCount}
            </span>
            <span className="flex items-center gap-1">
                <Share2 className="size-3 opacity-60" />
                {edgesCount}
            </span>
        </Panel>
    );
};
