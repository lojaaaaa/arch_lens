import { type MouseEvent, useCallback, useMemo } from 'react';
import {
    type NodeChange,
    type NodeMouseHandler,
    type OnConnect,
    type OnEdgesChange,
    type OnNodesChange,
} from '@xyflow/react';
import { toast } from 'sonner';

import { useCanvasNotesStore } from '@/features/canvas-notes';
import { useGraphHighlightStore } from '@/features/graph-highlight';

import {
    EDGE_CONNECTION_HINTS,
    EDGE_KIND_LABELS,
    NODE_LABELS,
} from '../../lib/config';
import { getDefaultEdgeKind, isEdgeAllowed } from '../../lib/utils';
import {
    useArchitectureActions,
    useArchitectureNodes,
} from '../../model/selectors';
import type { ArchitectureFlowNode } from '../../model/types';

export const useArchitectureCanvasHandlers = () => {
    const nodes = useArchitectureNodes();
    const blocks = useCanvasNotesStore((state) => state.blocks);
    const updateTextBlockPosition = useCanvasNotesStore(
        (state) => state.updatePosition,
    );
    const removeTextBlock = useCanvasNotesStore((state) => state.removeBlock);
    const {
        applyNodeChanges,
        applyEdgeChanges,
        selectEdge,
        selectNode,
        addEdge,
    } = useArchitectureActions();

    const clearHighlight = useGraphHighlightStore(
        (state) => state.clearHighlight,
    );

    const archNodeIds = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes]);
    const textBlockIds = useMemo(
        () => new Set(blocks.map((b) => b.id)),
        [blocks],
    );

    const onNodesChange: OnNodesChange<ArchitectureFlowNode> = useCallback(
        (nodeChanges) => {
            const archChanges: NodeChange[] = [];
            for (const change of nodeChanges) {
                const id =
                    change.type === 'remove'
                        ? change.id
                        : (change as { id?: string }).id;
                if (id && textBlockIds.has(id)) {
                    if (change.type === 'position' && 'position' in change) {
                        const pos = (
                            change as { position?: { x: number; y: number } }
                        ).position;
                        if (pos) {
                            updateTextBlockPosition(id, pos);
                        }
                    }
                    if (change.type === 'remove') {
                        removeTextBlock(id);
                    }
                } else if (id && archNodeIds.has(id)) {
                    archChanges.push(change);
                }
            }
            if (archChanges.length > 0) {
                applyNodeChanges(archChanges);
            }
        },
        [
            archNodeIds,
            textBlockIds,
            applyNodeChanges,
            updateTextBlockPosition,
            removeTextBlock,
        ],
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (edgeChanges) => {
            applyEdgeChanges(edgeChanges);
        },
        [applyEdgeChanges],
    );

    const onConnect: OnConnect = useCallback(
        (connection) => {
            const sourceId = connection.source;
            const targetId = connection.target;
            if (!sourceId || !targetId) {
                return;
            }
            const sourceNode = nodes.find((node) => node.id === sourceId);
            const targetNode = nodes.find((node) => node.id === targetId);
            const sourceKind = sourceNode?.data?.node?.kind;
            const targetKind = targetNode?.data?.node?.kind;

            if (!sourceKind || !targetKind) {
                return;
            }

            const defaultKind = getDefaultEdgeKind(sourceKind, targetKind);
            if (defaultKind && isEdgeAllowed(sourceKind, targetKind)) {
                addEdge(sourceId, targetId, defaultKind);
                const hint = EDGE_CONNECTION_HINTS[sourceKind]?.[targetKind];
                if (hint) {
                    const kindLabel =
                        EDGE_KIND_LABELS[defaultKind] ?? defaultKind;
                    toast.info(`${kindLabel}. ${hint}`, { duration: 4000 });
                }
                return;
            }

            const sourceLabel = NODE_LABELS[sourceKind] ?? sourceKind;
            const targetLabel = NODE_LABELS[targetKind] ?? targetKind;
            toast(`Недопустимая связь между ${sourceLabel} и ${targetLabel}`);
        },
        [addEdge, nodes],
    );

    const onNodeClick: NodeMouseHandler = useCallback(
        (_, { id }) => selectNode(id),
        [selectNode],
    );

    const onEdgeClick = useCallback(
        (_: MouseEvent, edge: { id: string }) => {
            selectEdge(edge.id);
        },
        [selectEdge],
    );

    const onEdgeDoubleClick = useCallback(
        (_: MouseEvent, edge: { id: string }) => {
            selectEdge(edge.id);
        },
        [selectEdge],
    );

    const onNodeDoubleClick: NodeMouseHandler = useCallback(
        (_, { id }) => selectNode(id),
        [selectNode],
    );

    const onPaneClick = useCallback((): void => {
        selectNode(null);
        clearHighlight();
    }, [selectNode, clearHighlight]);

    return {
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodeClick,
        onEdgeClick,
        onEdgeDoubleClick,
        onNodeDoubleClick,
        onPaneClick,
    };
};
