import { memo, useState } from 'react';
import { Handle, type NodeProps, Position } from '@xyflow/react';

import { useAnalysisStore } from '@/pages/analysis/model/store';
import { cn } from '@/shared/lib/utils';
import type {
    ArchitectureNode,
    LayerType,
    NodeKind,
} from '@/shared/model/types';

import { LAYER_COLORS, NODE_LABELS } from '../../lib/config';
import { useArchitectureActions } from '../../model/selectors';

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
        const displayName = node?.displayName?.trim() || '';
        const title = displayName || label;
        const typeLabel = NODE_LABELS[kind] ?? kind;
        const { updateNode } = useArchitectureActions();
        const [isEditing, setIsEditing] = useState(false);
        const [draftName, setDraftName] = useState(displayName);

        const isHighlighted = useAnalysisStore((state) =>
            state.highlightedNodeIds.includes(id),
        );

        const handleStartEdit = () => {
            setDraftName(displayName);
            setIsEditing(true);
        };

        const handleCancelEdit = () => {
            setDraftName(displayName);
            setIsEditing(false);
        };

        const handleSaveEdit = () => {
            const trimmed = draftName.trim();
            updateNode(id, {
                displayName: trimmed.length > 0 ? trimmed : undefined,
            });
            setIsEditing(false);
        };

        return (
            <>
                <Handle
                    type="target"
                    position={Position.Top}
                    className="!z-10 !top-0 !h-1.5 !w-1.5 !opacity-50"
                />
                <div
                    className={cn(
                        'rounded-lg border px-3 pb-3 pt-4 min-w-[120px] max-w-[500px] transition-shadow backdrop-blur-sm relative',
                        colors.bg,
                        colors.border,
                        selected &&
                            'ring-1 ring-primary/30 ring-offset-0 shadow-sm',
                        isHighlighted &&
                            'ring-2 ring-red-400 ring-offset-1 shadow-lg shadow-red-200/40 animate-pulse',
                    )}
                >
                    <span
                        className={cn(
                            'text-[7px] text-gray-600 leading-none rounded px-0.5 py-0.5 absolute top-[-1px] left-[-15px] translate-x-3 -translate-y-3 whitespace-nowrap',
                            ' bg-background/80',
                            colors.border,
                        )}
                        title={typeLabel}
                    >
                        {typeLabel}
                    </span>
                    <div className="flex flex-col min-w-0 gap-1 items-center text-center">
                        <div className="flex items-center gap-1.5 min-w-0">
                            {isEditing ? (
                                <input
                                    value={draftName}
                                    autoFocus
                                    onChange={(event) =>
                                        setDraftName(event.target.value)
                                    }
                                    onBlur={handleSaveEdit}
                                    onClick={(event) => event.stopPropagation()}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            handleSaveEdit();
                                        }
                                        if (event.key === 'Escape') {
                                            event.preventDefault();
                                            handleCancelEdit();
                                        }
                                    }}
                                    className={cn(
                                        'nodrag w-full bg-transparent text-xs font-semibold outline-none truncate',
                                        colors.text,
                                    )}
                                />
                            ) : (
                                <button
                                    type="button"
                                    onDoubleClick={(event) => {
                                        event.stopPropagation();
                                        handleStartEdit();
                                    }}
                                    className={cn(
                                        'text-xs font-semibold truncate text-center',
                                        colors.text,
                                    )}
                                    title={title}
                                >
                                    {title}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="!z-10 !bottom-0 !h-1.5 !w-1.5 !opacity-50"
                />
            </>
        );
    },
);

ArchitectureNodeComponent.displayName = 'ArchitectureNodeComponent';
