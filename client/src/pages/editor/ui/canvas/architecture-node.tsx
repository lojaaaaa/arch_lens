import { memo, useState } from 'react';
import { Handle, type NodeProps, Position } from '@xyflow/react';

import { useGraphHighlightStore } from '@/features/graph-highlight';
import { usePresentationStore } from '@/features/presentation';
import { cn } from '@/shared/lib/utils';
import type {
    ArchitectureNode,
    LayerType,
    NodeKind,
} from '@/shared/model/types';

import {
    LAYER_COLORS,
    NODE_LABELS,
    SYSTEM_NODE_COLORS,
} from '../../lib/config';
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
        const colors =
            kind === 'system' ? SYSTEM_NODE_COLORS : LAYER_COLORS[layer];
        const label = data.label || NODE_LABELS[kind] || kind;
        const displayName = node?.displayName?.trim() || '';
        const title = displayName || label;
        const typeLabel = NODE_LABELS[kind] ?? kind;
        const isPresentationMode = usePresentationStore(
            (state) => state.isPresentationMode,
        );
        const { updateNode } = useArchitectureActions();
        const [isEditing, setIsEditing] = useState(false);
        const [draftName, setDraftName] = useState(displayName);

        const isHighlighted = useGraphHighlightStore((state) =>
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

        const handleClass = cn(
            '!z-10 !h-4 !w-8 !transform !-translate-x-1/2 !border-0 !bg-transparent transition-opacity duration-150',
            isPresentationMode
                ? '!opacity-0 pointer-events-none'
                : '!opacity-0 group-hover:!opacity-100 group-hover:!border group-hover:!border-[var(--handle-border)] group-hover:!bg-[var(--handle)] group-hover:!rounded-full pointer-events-auto',
        );

        return (
            <div className="group/node size-full">
                {[0, 1, 2].map((idx) => (
                    <Handle
                        key={`top-${idx}`}
                        type="target"
                        id={`top-${idx}`}
                        position={Position.Top}
                        className={handleClass}
                        style={{
                            top: 0,
                            left: `${25 + idx * 25}%`,
                        }}
                    />
                ))}
                <div
                    className={cn(
                        'rounded-lg border px-4 py-6 min-w-[150px] min-h-[56px] max-w-[500px] transition-shadow backdrop-blur-sm relative',
                        colors.bg,
                        colors.border,
                        selected && 'ring-1 ring-primary/20 ring-offset-0',
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
                                        if (isPresentationMode) {
                                            return;
                                        }
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
                {[0, 1, 2].map((idx) => (
                    <Handle
                        key={`bottom-${idx}`}
                        type="source"
                        id={`bottom-${idx}`}
                        position={Position.Bottom}
                        className={handleClass}
                        style={{
                            bottom: 0,
                            left: `${25 + idx * 25}%`,
                        }}
                    />
                ))}
            </div>
        );
    },
);

ArchitectureNodeComponent.displayName = 'ArchitectureNodeComponent';
