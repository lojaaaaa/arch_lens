import type { MouseEvent as ReactMouseEvent } from 'react';
import { useState } from 'react';
import type { EdgeMouseHandler, NodeMouseHandler } from '@xyflow/react';

import { useCanvasNotesStore } from '@/features/canvas-notes';
import type { TypeOrNull } from '@/shared/model/types';

import {
    useArchitectureActions,
    useArchitectureFlowInstance,
    useArchitectureNodes,
} from '../../model/selectors';
import type { ArchitectureFlowNode } from '../../model/types';

type ContextMenuState = TypeOrNull<
    | { type: 'node'; id: string; x: number; y: number }
    | { type: 'edge'; id: string; x: number; y: number }
    | { type: 'pane'; x: number; y: number }
>;

export const useCanvasContextMenu = () => {
    const nodes = useArchitectureNodes();
    const blocks = useCanvasNotesStore((state) => state.blocks);
    const flowInstance = useArchitectureFlowInstance();
    const addTextBlock = useCanvasNotesStore((state) => state.addBlock);
    const removeTextBlock = useCanvasNotesStore((state) => state.removeBlock);
    const { removeNode, removeEdge, selectNode, selectEdge, addNode } =
        useArchitectureActions();

    const textBlockIds = new Set(blocks.map((b) => b.id));
    const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

    const closeContextMenu = () => {
        setContextMenu(null);
    };

    const openNodeContextMenu: NodeMouseHandler<ArchitectureFlowNode> = (
        event,
        node,
    ) => {
        event.preventDefault();
        setContextMenu({
            type: 'node',
            id: node.id,
            x: event.clientX,
            y: event.clientY,
        });
    };

    const openEdgeContextMenu: EdgeMouseHandler = (event, edge) => {
        event.preventDefault();
        setContextMenu({
            type: 'edge',
            id: edge.id,
            x: event.clientX,
            y: event.clientY,
        });
    };

    const openPaneContextMenu = (
        event:
            | ReactMouseEvent
            | { clientX: number; clientY: number; preventDefault: () => void },
    ) => {
        event.preventDefault();
        setContextMenu({
            type: 'pane',
            x: event.clientX,
            y: event.clientY,
        });
    };

    const isSystemContextNode = (() => {
        if (!contextMenu || contextMenu.type !== 'node') {
            return false;
        }
        if (textBlockIds.has(contextMenu.id)) {
            return false;
        }
        const node = nodes.find((flowNode) => flowNode.id === contextMenu.id);
        return node?.data?.node?.kind === 'system';
    })();

    const isTextBlockContext =
        contextMenu?.type === 'node' && textBlockIds.has(contextMenu.id);

    const canDeleteContext =
        contextMenu?.type === 'edge' ||
        (contextMenu?.type === 'node' && !isSystemContextNode);

    const handleContextDelete = () => {
        if (!contextMenu) {
            return;
        }
        if (contextMenu.type === 'node') {
            if (textBlockIds.has(contextMenu.id)) {
                removeTextBlock(contextMenu.id);
            } else {
                removeNode(contextMenu.id);
            }
        } else if (contextMenu.type === 'edge') {
            removeEdge(contextMenu.id);
        }
        setContextMenu(null);
    };

    const handleContextEdit = () => {
        if (!contextMenu) {
            return;
        }
        if (contextMenu.type === 'node' && !textBlockIds.has(contextMenu.id)) {
            selectNode(contextMenu.id);
        } else if (contextMenu?.type === 'edge') {
            selectEdge(contextMenu.id);
        }
        setContextMenu(null);
    };

    const handleContextDuplicate = () => {
        if (!contextMenu || contextMenu.type !== 'node') {
            return;
        }
        const sourceNode = nodes.find(
            (flowNode) => flowNode.id === contextMenu.id,
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
    };

    const canDuplicate = Boolean(
        contextMenu?.type === 'node' &&
        !isSystemContextNode &&
        !isTextBlockContext,
    );

    const handleAddTextBlock = () => {
        if (!contextMenu || contextMenu.type !== 'pane' || !flowInstance) {
            setContextMenu(null);
            return;
        }
        const position = flowInstance.screenToFlowPosition({
            x: contextMenu.x,
            y: contextMenu.y,
        });
        addTextBlock(position);
        setContextMenu(null);
    };

    return {
        contextMenu,
        closeContextMenu,
        openNodeContextMenu,
        openEdgeContextMenu,
        openPaneContextMenu,
        handleAddTextBlock,
        handleContextDelete,
        handleContextEdit,
        handleContextDuplicate,
        canDeleteContext,
        canDuplicate,
        canEdit: Boolean(contextMenu?.type === 'node' && !isTextBlockContext),
        isSystemContextNode,
    };
};
