import { memo } from 'react';
import { Handle, type NodeProps, Position } from '@xyflow/react';

import { useAnalysisStore } from '@/pages/analysis/model/store';
import { cn } from '@/shared/lib/utils';
import type {
    ArchitectureNode,
    LayerType,
    NodeKind,
} from '@/shared/model/types';

import { LAYER_COLORS, NODE_LABELS } from '../../lib/config';

type ArchNodeData = {
    label: string;
    node: ArchitectureNode;
};

export const ArchitectureNodeComponent = memo(
    ({ data, selected, id }: NodeProps & { data: ArchNodeData }) => {
        const { node } = data;
        const layer = (node?.layer ?? 'backend') as LayerType;
        const kind = (node?.kind ?? 'service') as NodeKind;
        const colors = LAYER_COLORS[layer];
        const label = data.label || NODE_LABELS[kind] || kind;

        const isHighlighted = useAnalysisStore((state) =>
            state.highlightedNodeIds.includes(id),
        );

        return (
            <>
                <Handle
                    type="target"
                    position={Position.Top}
                    className="!bg-muted-foreground"
                />
                <div
                    className={cn(
                        'rounded-lg border px-3 py-2 min-w-[120px] transition-shadow backdrop-blur-sm',
                        colors.bg,
                        colors.border,
                        selected &&
                            'ring-2 ring-primary ring-offset-1 shadow-md',
                        isHighlighted &&
                            'ring-2 ring-red-400 ring-offset-1 shadow-lg shadow-red-200/40 animate-pulse',
                    )}
                >
                    <div className="flex flex-col min-w-0">
                        <span
                            className={cn(
                                'text-xs font-semibold truncate',
                                colors.text,
                            )}
                        >
                            {label}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">
                            {kind}
                        </span>
                    </div>
                </div>
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="!bg-muted-foreground"
                />
            </>
        );
    },
);

ArchitectureNodeComponent.displayName = 'ArchitectureNodeComponent';
