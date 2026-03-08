import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { ReactFlowInstance } from '@xyflow/react';
import { Background, ReactFlow, SelectionMode } from '@xyflow/react';

import type { NodeKind, TypeOrNull } from '@/shared/model/types';

import { ArchitectureNodeComponent } from './architecture-node';
import { CanvasContextMenu } from './canvas-context-menu';
import { CanvasEmptyState } from './canvas-empty-state';
import { CanvasStatsPanel } from './canvas-stats-panel';
import { TutorialBanner } from './tutorial-banner';
import { useCanvasContextMenu } from './use-canvas-context-menu';
import { useCanvasDnd } from './use-canvas-dnd';
import { useArchitectureCanvasHandlers } from './use-canvas-handlers';
import { useCanvasHighlight } from './use-canvas-highlight';
import { useTutorial } from '../../lib/use-tutorial';
import {
    useArchitectureActions,
    useArchitectureSelectors,
} from '../../model/selectors';
import type { ArchitectureFlowNode } from '../../model/types';

const BACKGROUND_SIZE = 1.3;
const nodeTypes = {
    architecture: ArchitectureNodeComponent,
} as const;

const CanvasMiniMap = lazy(() =>
    import('./canvas-minimap').then((module) => ({
        default: module.CanvasMiniMap,
    })),
);

const CanvasControls = lazy(() =>
    import('./canvas-controls').then((module) => ({
        default: module.CanvasControls,
    })),
);

export const ArchitectureCanvas = () => {
    const { nodes, edges } = useArchitectureSelectors();

    const { setFlowInstance } = useArchitectureActions();

    const flowRef =
        useRef<TypeOrNull<ReactFlowInstance<ArchitectureFlowNode>>>(null);

    const [showExtras, setShowExtras] = useState(false);
    const [flowReady, setFlowReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const schedule = () => {
            if (!cancelled) {
                setShowExtras(true);
            }
        };

        const requestIdleCallback = (
            window as typeof window & {
                requestIdleCallback?: (
                    cb: () => void,
                    opts?: { timeout: number },
                ) => number;
                cancelIdleCallback?: (id: number) => void;
            }
        ).requestIdleCallback;

        if (requestIdleCallback) {
            const idleId = requestIdleCallback(schedule, { timeout: 1000 });
            return () => {
                cancelled = true;
                (
                    window as typeof window & {
                        cancelIdleCallback?: (id: number) => void;
                    }
                ).cancelIdleCallback?.(idleId);
            };
        }

        const timeoutId = window.setTimeout(schedule, 0);
        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, []);

    useCanvasHighlight(flowRef, flowReady);

    const {
        onNodesChange,
        onEdgesChange,
        onConnect,
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

    const nodeKinds = nodes
        .map((n) => n.data?.node?.kind as NodeKind | undefined)
        .filter((k): k is NodeKind => Boolean(k));
    const { showBanner, hint, dismiss } = useTutorial(
        nodes.length,
        edges.length,
        nodeKinds,
    );

    const pairCounts = new Map<string, number>();
    for (const edge of edges) {
        const key = `${edge.source}-${edge.target}`;
        pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
    }

    const pairIndices = new Map<string, number>();

    const edgesWithLabels = edges.map((flowEdge) => {
        const data = flowEdge.data as { edge?: { kind: string } };
        const kind = data?.edge?.kind ?? 'calls';

        const pairKey = `${flowEdge.source}-${flowEdge.target}`;
        const pathTotal = pairCounts.get(pairKey) ?? 1;
        const pathIndex = pairIndices.get(pairKey) ?? 0;
        pairIndices.set(pairKey, pathIndex + 1);

        const handleIdx =
            pathTotal === 1
                ? 1
                : pathTotal === 2
                  ? pathIndex === 0
                      ? 0
                      : 2
                  : pathIndex;

        return {
            ...flowEdge,
            label: flowEdge.label ?? kind,
            markerEnd: flowEdge.markerEnd ?? { type: 'arrowclosed' },
            sourceHandle: `bottom-${handleIdx}`,
            targetHandle: `top-${handleIdx}`,
        };
    });

    const handlePaneClick = () => {
        closeContextMenu();
        onPaneClick();
    };

    return (
        <div className="relative h-full w-full">
            <ReactFlow<ArchitectureFlowNode>
                nodes={nodes}
                edges={edgesWithLabels}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeDoubleClick={onEdgeDoubleClick}
                onNodeDoubleClick={onNodeDoubleClick}
                onPaneClick={handlePaneClick}
                onEdgeContextMenu={openEdgeContextMenu}
                onNodeContextMenu={openNodeContextMenu}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onInit={(instance) => {
                    flowRef.current = instance;
                    setFlowInstance(instance);
                    setFlowReady(true);
                }}
                selectionOnDrag
                selectionMode={SelectionMode.Partial}
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
                {showExtras ? (
                    <Suspense fallback={null}>
                        <CanvasMiniMap />
                        <CanvasControls />
                    </Suspense>
                ) : null}
                <CanvasStatsPanel
                    nodesCount={nodes.length}
                    edgesCount={edges.length}
                />
            </ReactFlow>

            {nodes.length === 0 ? <CanvasEmptyState /> : null}

            {showBanner && hint ? (
                <div className="absolute top-4 left-1/2 z-20 -translate-x-1/2 px-4 max-w-md">
                    <TutorialBanner hint={hint} onDismiss={dismiss} />
                </div>
            ) : null}

            {contextMenu && (
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
