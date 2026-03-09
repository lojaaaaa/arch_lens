import { lazy, Suspense, useRef } from 'react';
import type { ReactFlowInstance } from '@xyflow/react';
import { Background, ReactFlow } from '@xyflow/react';

import { usePresentationStore } from '@/features/presentation';
import { useTutorial } from '@/features/tutorial';
import { TutorialBanner } from '@/features/tutorial';
import type { TypeOrNull } from '@/shared/model/types';

import { ArchitectureNodeComponent } from './architecture-node';
import { CanvasContextMenu } from './canvas-context-menu';
import { CanvasStatsPanel } from './canvas-stats-panel';
import { useArchitectureCanvasProps } from './use-architecture-canvas-props';
import { useCanvasContextMenu } from './use-canvas-context-menu';
import { useCanvasDnd } from './use-canvas-dnd';
import { useArchitectureCanvasHandlers } from './use-canvas-handlers';
import { useCanvasHighlight } from './use-canvas-highlight';
import { useEdgesWithLabels } from './use-edges-with-labels';
import { useNodeKinds } from './use-node-kinds';
import {
    useArchitectureActions,
    useArchitectureEdges,
    useArchitectureNodes,
} from '../../model/selectors';
import type { ArchitectureFlowNode } from '../../model/types';

const NODE_TYPES = {
    architecture: ArchitectureNodeComponent,
} as const;

export const BACKGROUND_SIZE = 1.3;

const CanvasMiniMap = lazy(() =>
    import('./canvas-minimap').then((moduleExport) => ({
        default: moduleExport.CanvasMiniMap,
    })),
);

const CanvasControls = lazy(() =>
    import('./canvas-controls').then((moduleExport) => ({
        default: moduleExport.CanvasControls,
    })),
);

export const ArchitectureCanvas = () => {
    const nodes = useArchitectureNodes();
    const edges = useArchitectureEdges();

    const isPresentationMode = usePresentationStore(
        (state) => state.isPresentationMode,
    );
    const { setFlowInstance } = useArchitectureActions();

    const flowRef =
        useRef<TypeOrNull<ReactFlowInstance<ArchitectureFlowNode>>>(null);

    useCanvasHighlight();

    const canvasProps = useArchitectureCanvasProps();
    const {
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodeClick,
        onEdgeClick,
        onEdgeDoubleClick,
        onNodeDoubleClick,
        onPaneClick,
    } = useArchitectureCanvasHandlers();

    const {
        contextMenu,
        closeContextMenu,
        openEdgeContextMenu,
        openNodeContextMenu,
        handleContextDelete,
        handleContextEdit,
        handleContextDuplicate,
        canDeleteContext,
        canDuplicate,
    } = useCanvasContextMenu();

    const { handleDragOver, handleDrop } = useCanvasDnd(flowRef);

    const nodeKinds = useNodeKinds(nodes);
    const { showBanner, hint, dismiss } = useTutorial(
        nodes.length,
        edges.length,
        nodeKinds,
    );

    const edgesWithLabels = useEdgesWithLabels(edges);

    const isShowTutorial = !isPresentationMode && showBanner && hint;

    const handlePaneClick = () => {
        closeContextMenu();
        onPaneClick();
    };

    const noopWhenPresentation = <T,>(handler: T) =>
        isPresentationMode ? undefined : handler;

    return (
        <div className="relative h-full w-full">
            <ReactFlow<ArchitectureFlowNode>
                nodes={nodes}
                edges={edgesWithLabels}
                nodeTypes={NODE_TYPES}
                onInit={(instance) => {
                    flowRef.current = instance;
                    setFlowInstance(instance);
                }}
                nodesDraggable={canvasProps.nodesDraggable}
                nodesConnectable={canvasProps.nodesConnectable}
                elementsSelectable={canvasProps.elementsSelectable}
                selectionOnDrag={canvasProps.selectionOnDrag}
                selectionMode={canvasProps.selectionMode}
                onConnect={noopWhenPresentation(onConnect)}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onPaneClick={noopWhenPresentation(handlePaneClick)}
                onNodeClick={noopWhenPresentation(onNodeClick)}
                onEdgeClick={noopWhenPresentation(onEdgeClick)}
                onNodeContextMenu={noopWhenPresentation(openNodeContextMenu)}
                onEdgeContextMenu={noopWhenPresentation(openEdgeContextMenu)}
                onNodeDoubleClick={noopWhenPresentation(onNodeDoubleClick)}
                onEdgeDoubleClick={noopWhenPresentation(onEdgeDoubleClick)}
                onDragOver={noopWhenPresentation(handleDragOver)}
                onDrop={noopWhenPresentation(handleDrop)}
                fitView
                fitViewOptions={canvasProps.fitViewOptions}
                defaultEdgeOptions={{
                    markerEnd: { type: 'arrowclosed' },
                }}
                proOptions={{ hideAttribution: true }}
            >
                <Background size={BACKGROUND_SIZE} />
                <Suspense fallback={null}>
                    <CanvasMiniMap />
                    <CanvasControls />
                </Suspense>
                <CanvasStatsPanel
                    nodesCount={nodes.length}
                    edgesCount={edges.length}
                />
            </ReactFlow>

            {isShowTutorial && (
                <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 px-4 max-w-md">
                    <TutorialBanner hint={hint} onDismiss={dismiss} />
                </div>
            )}

            {!isPresentationMode && contextMenu && (
                <CanvasContextMenu
                    contextMenu={contextMenu}
                    canDelete={canDeleteContext}
                    canDuplicate={canDuplicate}
                    onClose={closeContextMenu}
                    onEdit={handleContextEdit}
                    onDuplicate={handleContextDuplicate}
                    onDelete={handleContextDelete}
                />
            )}
        </div>
    );
};
