import { useMemo } from 'react';
import { Background, Controls, MiniMap, ReactFlow } from '@xyflow/react';

import { useArchitectureCanvasHandlers } from './use-canvas-handlers';
import {
    useArchitectureActions,
    useArchitectureSelectors,
} from '../../model/selectors';
import type { ArchitectureFlowNode } from '../../model/types';

const BACKGROUND_SIZE = 1.3;

export const ArchitectureCanvas = () => {
    const { nodes, edges } = useArchitectureSelectors();

    const { setFlowInstance } = useArchitectureActions();

    const {
        onNodesChange,
        onEdgesChange,
        onConnect,
        onEdgeDoubleClick,
        onNodeDoubleClick,
        onPaneClick,
    } = useArchitectureCanvasHandlers();

    const edgesWithLabels = useMemo(
        () =>
            edges.map((flowEdge) => {
                const data = flowEdge.data as { edge?: { kind: string } };
                const kind = data?.edge?.kind ?? 'calls';
                return {
                    ...flowEdge,
                    label: flowEdge.label ?? kind,
                    markerEnd: flowEdge.markerEnd ?? { type: 'arrowclosed' },
                };
            }),
        [edges],
    );

    return (
        <div className="h-[calc(100svh-3rem-1px)] w-full">
            <ReactFlow<ArchitectureFlowNode>
                nodes={nodes}
                edges={edgesWithLabels}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeDoubleClick={onEdgeDoubleClick}
                onNodeDoubleClick={onNodeDoubleClick}
                onPaneClick={onPaneClick}
                onInit={setFlowInstance}
                fitView
                fitViewOptions={{
                    padding: 0.2,
                }}
                defaultEdgeOptions={{
                    markerEnd: { type: 'arrowclosed' },
                }}
                proOptions={{ hideAttribution: true }}
            >
                <Background size={BACKGROUND_SIZE} />
                <MiniMap />
                <Controls position="bottom-center" orientation="horizontal" />
            </ReactFlow>
        </div>
    );
};
