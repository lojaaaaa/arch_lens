import { type MouseEvent, useCallback, useMemo, useRef, useState } from 'react';
import {
    type Connection,
    type Edge,
    type NodeChange,
    type NodeMouseHandler,
    type OnConnect,
    type OnEdgesChange,
    type OnNodesChange,
    reconnectEdge,
} from '@xyflow/react';
import { toast } from 'sonner';

import { useCanvasNotesStore } from '@/features/canvas-notes';
import { useGraphHighlightStore } from '@/features/graph-highlight';

import type { PendingConnection } from './edge-type-picker';
import {
    EDGE_CONNECTION_HINTS,
    EDGE_KIND_LABELS,
    NODE_LABELS,
} from '../../lib/config';
import { allowedEdgeKinds, isEdgeAllowed } from '../../lib/utils';
import {
    useArchitectureActions,
    useArchitectureNodes,
} from '../../model/selectors';
import { useArchitectureStore } from '../../model/store';
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

    const [pendingConnection, setPendingConnection] =
        useState<PendingConnection | null>(null);

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

            if (!isEdgeAllowed(sourceKind, targetKind)) {
                const sourceLabel = NODE_LABELS[sourceKind] ?? sourceKind;
                const targetLabel = NODE_LABELS[targetKind] ?? targetKind;
                toast(
                    `Недопустимая связь между ${sourceLabel} и ${targetLabel}`,
                );
                return;
            }

            const kinds = allowedEdgeKinds[sourceKind]?.[targetKind] ?? [];

            if (kinds.length === 1) {
                addEdge(sourceId, targetId, kinds[0]);
                const hint = EDGE_CONNECTION_HINTS[sourceKind]?.[targetKind];
                if (hint) {
                    const kindLabel = EDGE_KIND_LABELS[kinds[0]] ?? kinds[0];
                    toast.info(`${kindLabel}. ${hint}`, { duration: 4000 });
                }
                return;
            }

            setPendingConnection({
                sourceId,
                targetId,
                allowedKinds: kinds,
                targetNodeId: targetId,
            });
        },
        [addEdge, nodes],
    );

    const clearPendingConnection = useCallback(
        () => setPendingConnection(null),
        [],
    );

    const edgeReconnectSuccessful = useRef(true);

    const onReconnectStart = useCallback(() => {
        edgeReconnectSuccessful.current = false;
    }, []);

    const onReconnect = useCallback(
        (oldEdge: Edge, newConnection: Connection) => {
            edgeReconnectSuccessful.current = true;
            const { setEdges } = useArchitectureStore.getState();
            const currentEdges = useArchitectureStore.getState().edges;
            setEdges(reconnectEdge(oldEdge, newConnection, currentEdges));
        },
        [],
    );

    const onReconnectEnd = useCallback(
        (_: globalThis.MouseEvent | TouchEvent, edge: Edge) => {
            if (!edgeReconnectSuccessful.current) {
                const { removeEdge: rm } = useArchitectureStore.getState();
                rm(edge.id);
            }
            edgeReconnectSuccessful.current = true;
        },
        [],
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
        onReconnectStart,
        onReconnect,
        onReconnectEnd,
        onNodeClick,
        onEdgeClick,
        onEdgeDoubleClick,
        onNodeDoubleClick,
        onPaneClick,
        pendingConnection,
        clearPendingConnection,
    };
};
