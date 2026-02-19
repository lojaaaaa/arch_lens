import {
    type MouseEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Background,
    Controls,
    MiniMap,
    Panel,
    ReactFlow,
    type ReactFlowInstance,
} from '@xyflow/react';
import { Copy, LayoutGrid, Pencil, Trash2 } from 'lucide-react';

import { useTheme } from '@/shared/lib/use-theme';
import { useAnalysisStore } from '@/pages/analysis/model/store';

import { ArchitectureNodeComponent } from './architecture-node';
import { useArchitectureCanvasHandlers } from './use-canvas-handlers';
import {
    useArchitectureActions,
    useArchitectureSelectors,
} from '../../model/selectors';
import type { ArchitectureFlowNode } from '../../model/types';

const BACKGROUND_SIZE = 1.3;
const FIT_VIEW_DELAY_MS = 300;
const HIGHLIGHT_AUTO_CLEAR_MS = 10_000;

const nodeTypes = {
    architecture: ArchitectureNodeComponent,
} as const;

type ContextMenuState = {
    nodeId: string;
    x: number;
    y: number;
} | null;

const MINIMAP_LIGHT = {
    nodeColor: '#e2e2e2',
    maskColor: 'rgba(240, 240, 240, 0.6)',
    bgColor: '#ffffff',
} as const;

const MINIMAP_DARK = {
    nodeColor: '#94a3b8',
    maskColor: 'rgba(0, 0, 0, 0.6)',
    bgColor: '#1e293b',
} as const;

export const ArchitectureCanvas = () => {
    const { theme } = useTheme();
    const { nodes, edges } = useArchitectureSelectors();

    const { setFlowInstance, removeNode, selectNode, addNode } =
        useArchitectureActions();

    const minimapColors = theme === 'dark' ? MINIMAP_DARK : MINIMAP_LIGHT;
    const flowRef = useRef<ReactFlowInstance<ArchitectureFlowNode> | null>(
        null,
    );
    const highlightedNodeIds = useAnalysisStore(
        (state) => state.highlightedNodeIds,
    );
    const clearHighlight = useAnalysisStore((state) => state.clearHighlight);

    const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

    useEffect(() => {
        if (highlightedNodeIds.length === 0 || !flowRef.current) {
            return;
        }

        const fitTimer = setTimeout(() => {
            flowRef.current?.fitView({
                nodes: highlightedNodeIds.map((nodeId) => ({ id: nodeId })),
                padding: 0.4,
                duration: 500,
            });
        }, FIT_VIEW_DELAY_MS);

        const clearTimer = setTimeout(clearHighlight, HIGHLIGHT_AUTO_CLEAR_MS);

        return () => {
            clearTimeout(fitTimer);
            clearTimeout(clearTimer);
        };
    }, [highlightedNodeIds, clearHighlight]);

    const {
        onNodesChange,
        onEdgesChange,
        onConnect,
        onEdgeDoubleClick,
        onNodeDoubleClick,
        onPaneClick: originalPaneClick,
    } = useArchitectureCanvasHandlers();

    const handlePaneClick = useCallback(() => {
        setContextMenu(null);
        originalPaneClick();
    }, [originalPaneClick]);

    const handleNodeContextMenu = useCallback(
        (event: MouseEvent, node: ArchitectureFlowNode) => {
            event.preventDefault();
            setContextMenu({
                nodeId: node.id,
                x: event.clientX,
                y: event.clientY,
            });
        },
        [],
    );

    const handleContextDelete = useCallback(() => {
        if (!contextMenu) {
            return;
        }
        removeNode(contextMenu.nodeId);
        setContextMenu(null);
    }, [contextMenu, removeNode]);

    const handleContextEdit = useCallback(() => {
        if (!contextMenu) {
            return;
        }
        selectNode(contextMenu.nodeId);
        setContextMenu(null);
    }, [contextMenu, selectNode]);

    const handleContextDuplicate = useCallback(() => {
        if (!contextMenu) {
            return;
        }
        const sourceNode = nodes.find(
            (flowNode) => flowNode.id === contextMenu.nodeId,
        );
        if (!sourceNode?.data) {
            setContextMenu(null);
            return;
        }
        const archNode = (sourceNode.data as { node?: { kind?: string } })
            ?.node;
        if (archNode?.kind) {
            addNode(archNode.kind as Parameters<typeof addNode>[0]);
        }
        setContextMenu(null);
    }, [contextMenu, nodes, addNode]);

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
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgeDoubleClick={onEdgeDoubleClick}
                onNodeDoubleClick={onNodeDoubleClick}
                onPaneClick={handlePaneClick}
                onNodeContextMenu={handleNodeContextMenu}
                onInit={(instance) => {
                    flowRef.current = instance;
                    setFlowInstance(instance);
                }}
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
                <MiniMap
                    nodeColor={minimapColors.nodeColor}
                    maskColor={minimapColors.maskColor}
                    bgColor={minimapColors.bgColor}
                />
                <Controls position="bottom-center" orientation="horizontal" />

                {nodes.length === 0 && (
                    <Panel
                        position="top-center"
                        className="!pointer-events-none !m-0 flex h-full w-full items-center justify-center"
                    >
                        <div className="flex flex-col items-center gap-3 text-center">
                            <LayoutGrid className="text-muted-foreground/40 size-10" />
                            <p className="text-muted-foreground text-sm">
                                Добавьте элемент из панели слева,
                                <br />
                                чтобы начать проектирование
                            </p>
                        </div>
                    </Panel>
                )}
            </ReactFlow>

            {contextMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setContextMenu(null)}
                        onContextMenu={(event) => {
                            event.preventDefault();
                            setContextMenu(null);
                        }}
                    />
                    <div
                        className="bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 fixed z-50 min-w-[10rem] overflow-hidden rounded-md border p-1 shadow-md"
                        style={{
                            left: contextMenu.x,
                            top: contextMenu.y,
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleContextEdit}
                            className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                        >
                            <Pencil className="size-3.5 opacity-60" />
                            Редактировать
                        </button>
                        <button
                            type="button"
                            onClick={handleContextDuplicate}
                            className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                        >
                            <Copy className="size-3.5 opacity-60" />
                            Дублировать
                        </button>
                        <div className="bg-border -mx-1 my-1 h-px" />
                        <button
                            type="button"
                            onClick={handleContextDelete}
                            className="hover:bg-destructive/10 text-destructive flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                        >
                            <Trash2 className="size-3.5 opacity-60" />
                            Удалить
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
