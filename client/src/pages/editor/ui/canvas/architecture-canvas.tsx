import { lazy, Suspense, useMemo, useRef } from 'react';
import type { Node } from '@xyflow/react';
import type { ReactFlowInstance } from '@xyflow/react';
import { Background, ReactFlow } from '@xyflow/react';

import { TextBlockNode, useCanvasNotesStore } from '@/features/canvas-notes';
import { usePresentationStore } from '@/features/presentation';
import { useTutorial } from '@/features/tutorial';
import { TutorialBanner } from '@/features/tutorial';
import type { TypeOrNull } from '@/shared/model/types';

import { ArchitectureNodeComponent } from './architecture-node';
import { CanvasContextMenu } from './canvas-context-menu';
import { CanvasSearchTrigger } from './canvas-search-trigger';
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
type FlowNode =
    | ArchitectureFlowNode
    | Node<{ content: string; width?: number; height?: number }>;

const NODE_TYPES = {
    architecture: ArchitectureNodeComponent,
    textBlock: TextBlockNode,
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
    const archNodes = useArchitectureNodes();
    const textBlocks = useCanvasNotesStore((state) => state.blocks);
    const textBlocksVisible = useCanvasNotesStore((state) => state.visible);
    const edges = useArchitectureEdges();

    const nodes: FlowNode[] = useMemo(() => {
        const textBlockNodes: FlowNode[] = textBlocksVisible
            ? textBlocks.map((b) => ({
                  id: b.id,
                  type: 'textBlock',
                  position: b.position,
                  data: {
                      content: b.content,
                      width: b.width,
                      height: b.height,
                  },
                  draggable: true,
                  connectable: false,
              }))
            : [];
        return [...archNodes, ...textBlockNodes];
    }, [archNodes, textBlocks, textBlocksVisible]);

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
        openPaneContextMenu,
        handleAddTextBlock,
        handleContextDelete,
        handleContextEdit,
        handleContextDuplicate,
        canDeleteContext,
        canDuplicate,
        canEdit,
    } = useCanvasContextMenu();

    const { handleDragOver, handleDrop } = useCanvasDnd(flowRef);

    const nodeKinds = useNodeKinds(archNodes);
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
                nodes={nodes as ArchitectureFlowNode[]}
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
                onPaneContextMenu={noopWhenPresentation(openPaneContextMenu)}
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
                    {!isPresentationMode && <CanvasSearchTrigger />}
                </Suspense>
                <CanvasStatsPanel
                    nodesCount={archNodes.length}
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
                    canEdit={canEdit}
                    onClose={closeContextMenu}
                    onEdit={handleContextEdit}
                    onDuplicate={handleContextDuplicate}
                    onDelete={handleContextDelete}
                    onAddTextBlock={handleAddTextBlock}
                />
            )}
        </div>
    );
};
