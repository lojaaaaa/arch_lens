import { type MouseEvent, useCallback } from 'react';
import {
    type NodeMouseHandler,
    type OnConnect,
    type OnEdgesChange,
    type OnNodesChange,
} from '@xyflow/react';
import { toast } from 'sonner';

import { useAnalysisStore } from '@/pages/analysis/model/store';

import { NODE_LABELS } from '../../lib/config';
import { getDefaultEdgeKind, isEdgeAllowed } from '../../lib/utils';
import {
    useArchitectureActions,
    useArchitectureSelectors,
} from '../../model/selectors';
import type { ArchitectureFlowNode } from '../../model/types';

export const useArchitectureCanvasHandlers = () => {
    const { nodes } = useArchitectureSelectors();
    const {
        applyNodeChanges,
        applyEdgeChanges,
        selectEdge,
        selectNode,
        addEdge,
    } = useArchitectureActions();

    const clearHighlight = useAnalysisStore((state) => state.clearHighlight);

    const onNodesChange: OnNodesChange<ArchitectureFlowNode> = useCallback(
        (nodeChanges) => {
            applyNodeChanges(nodeChanges);
        },
        [applyNodeChanges],
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
                return;
            }

            const sourceLabel = NODE_LABELS[sourceKind] ?? sourceKind;
            const targetLabel = NODE_LABELS[targetKind] ?? targetKind;
            toast(`Недопустимая связь между ${sourceLabel} и ${targetLabel}`);
        },
        [addEdge, nodes],
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
        onEdgeDoubleClick,
        onNodeDoubleClick,
        onPaneClick,
    };
};
