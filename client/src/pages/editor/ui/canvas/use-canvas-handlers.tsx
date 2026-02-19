import { type MouseEvent, useCallback } from 'react';
import {
    applyEdgeChanges,
    applyNodeChanges,
    type NodeMouseHandler,
    type OnConnect,
    type OnEdgesChange,
    type OnNodesChange,
} from '@xyflow/react';

import { useAnalysisStore } from '@/pages/analysis/model/store';

import {
    useArchitectureActions,
    useArchitectureSelectors,
} from '../../model/selectors';
import type { ArchitectureFlowNode } from '../../model/types';

export const useArchitectureCanvasHandlers = () => {
    const { nodes, edges } = useArchitectureSelectors();

    const { setNodes, setEdges, selectEdge, selectNode, addEdge } =
        useArchitectureActions();

    const clearHighlight = useAnalysisStore((state) => state.clearHighlight);

    const onNodesChange: OnNodesChange<ArchitectureFlowNode> = useCallback(
        (changes) => {
            setNodes(applyNodeChanges(changes, nodes));
        },
        [nodes, setNodes],
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            setEdges(applyEdgeChanges(changes, edges));
        },
        [edges, setEdges],
    );

    const onConnect: OnConnect = useCallback(
        (connection) => {
            if (connection.source && connection.target) {
                addEdge(connection.source, connection.target, 'calls');
            }
        },
        [addEdge],
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
