import { useEffect, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { nanoid } from 'nanoid';

import { Separator } from '@/shared/ui/separator';
import { SidebarInset } from '@/shared/ui/sidebar';

import { createGraphEdge, toFlowEdge, toFlowNode } from './lib/utils';
import {
    useArchitectureActions,
    useArchitectureSelectors,
} from './model/selectors';
import { ArchitectureCanvas } from './ui/canvas/architecture-canvas';
import { Header } from './ui/header/header';
import { EdgePropertiesSheet } from './ui/properties/edge-properties-sheet';
import { NodePropertiesSheet } from './ui/properties/node-properties-sheet';
import { Sidebar } from './ui/sidebar/sidebar';

const EditorPage = () => {
    const { nodes, edges, selectedNodeId, selectedEdgeId } =
        useArchitectureSelectors();
    const {
        undo,
        redo,
        canUndo,
        canRedo,
        addNode,
        setNodes,
        setEdges,
        removeNode,
        removeEdge,
        selectNode,
        selectEdge,
    } = useArchitectureActions();
    const copiedNodeRef = useRef<(typeof nodes)[number] | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const isEditable =
                target?.tagName === 'INPUT' ||
                target?.tagName === 'TEXTAREA' ||
                target?.isContentEditable;

            if (isEditable) {
                return;
            }

            const selectedNode =
                nodes.find((node) => node.id === selectedNodeId) ??
                nodes.find((node) => node.selected);
            const selectedEdge =
                edges.find((edge) => edge.id === selectedEdgeId) ??
                edges.find((edge) => edge.selected);

            const isUndo =
                (event.metaKey || event.ctrlKey) &&
                !event.shiftKey &&
                event.code === 'KeyZ';
            const isRedo =
                (event.metaKey || event.ctrlKey) &&
                (event.code === 'KeyY' ||
                    (event.shiftKey && event.code === 'KeyZ'));
            const isDuplicate =
                (event.metaKey || event.ctrlKey) && event.code === 'KeyX';
            const isDelete =
                event.key === 'Delete' || event.key === 'Backspace';
            const isEscape = event.key === 'Escape';
            const isCopy =
                (event.metaKey || event.ctrlKey) && event.code === 'KeyC';
            const isPaste =
                (event.metaKey || event.ctrlKey) && event.code === 'KeyV';

            if (isUndo) {
                event.preventDefault();
                if (canUndo()) {
                    undo();
                }
            }

            if (isRedo) {
                event.preventDefault();
                if (canRedo()) {
                    redo();
                }
            }

            if (isDuplicate && selectedNode) {
                event.preventDefault();
                const sourceNode = selectedNode;
                const architectureNode = sourceNode?.data?.node;
                if (architectureNode?.kind) {
                    addNode(architectureNode.kind);
                }
            }

            if (isCopy && selectedNode) {
                event.preventDefault();
                copiedNodeRef.current = selectedNode;
            }

            if (isPaste) {
                event.preventDefault();
                const sourceNode = copiedNodeRef.current;
                const architectureNode = sourceNode?.data?.node;
                if (!architectureNode) {
                    return;
                }
                const nextPosition = {
                    x: architectureNode.position.x + 24,
                    y: architectureNode.position.y + 24,
                };
                const duplicatedNode = {
                    ...architectureNode,
                    id: nanoid(),
                    position: nextPosition,
                };
                const flowNode = toFlowNode(duplicatedNode, nextPosition);
                setNodes([...nodes, flowNode]);
                if (architectureNode.kind === 'ui_page') {
                    const systemNode = nodes.find(
                        (node) => node.data?.node?.kind === 'system',
                    );
                    if (systemNode) {
                        const flowEdge = toFlowEdge(
                            createGraphEdge(
                                duplicatedNode.id,
                                systemNode.id,
                                'depends_on',
                            ),
                        );
                        setEdges([...edges, flowEdge]);
                    }
                }
            }

            if (isDelete) {
                if (selectedEdge) {
                    event.preventDefault();
                    removeEdge(selectedEdge.id);
                    selectEdge(null);
                } else if (selectedNode) {
                    event.preventDefault();
                    removeNode(selectedNode.id);
                    selectNode(null);
                }
            }

            if (isEscape) {
                event.preventDefault();
                selectNode(null);
                selectEdge(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () =>
            window.removeEventListener('keydown', handleKeyDown, {
                capture: true,
            });
    }, [
        nodes,
        edges,
        selectedNodeId,
        selectedEdgeId,
        undo,
        redo,
        canUndo,
        canRedo,
        addNode,
        setNodes,
        setEdges,
        removeNode,
        removeEdge,
        selectNode,
        selectEdge,
    ]);

    return (
        <ReactFlowProvider>
            <Sidebar />
            <SidebarInset className="h-svh min-h-svh overflow-hidden">
                <Header />
                <Separator />

                <div className="relative flex-1 min-h-0 overflow-hidden">
                    <NodePropertiesSheet />
                    <EdgePropertiesSheet />
                    <ArchitectureCanvas />
                </div>
            </SidebarInset>
        </ReactFlowProvider>
    );
};

export const Component = EditorPage;
