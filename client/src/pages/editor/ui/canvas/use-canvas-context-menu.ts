import { useState } from 'react';
import type { EdgeMouseHandler, NodeMouseHandler } from '@xyflow/react';

import type { TypeOrNull } from '@/shared/model/types';

import {
    useArchitectureActions,
    useArchitectureNodes,
} from '../../model/selectors';
import type { ArchitectureFlowNode } from '../../model/types';

type ContextMenuState = TypeOrNull<{
    type: 'node' | 'edge';
    id: string;
    x: number;
    y: number;
}>;

export const useCanvasContextMenu = () => {
    const nodes = useArchitectureNodes();
    const { removeNode, removeEdge, selectNode, selectEdge, addNode } =
        useArchitectureActions();
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

    const isSystemContextNode = (() => {
        if (!contextMenu || contextMenu.type !== 'node') {
            return false;
        }
        const node = nodes.find((flowNode) => flowNode.id === contextMenu.id);
        return node?.data?.node?.kind === 'system';
    })();

    const canDeleteContext =
        contextMenu?.type === 'edge' ||
        (contextMenu?.type === 'node' && !isSystemContextNode);

    const handleContextDelete = () => {
        if (!contextMenu) {
            return;
        }
        if (contextMenu.type === 'node') {
            removeNode(contextMenu.id);
        } else {
            removeEdge(contextMenu.id);
        }
        setContextMenu(null);
    };

    const handleContextEdit = () => {
        if (!contextMenu) {
            return;
        }
        if (contextMenu.type === 'node') {
            selectNode(contextMenu.id);
        } else {
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
        contextMenu?.type === 'node' && !isSystemContextNode,
    );

    return {
        contextMenu,
        closeContextMenu,
        openNodeContextMenu,
        openEdgeContextMenu,
        handleContextDelete,
        handleContextEdit,
        handleContextDuplicate,
        canDeleteContext,
        canDuplicate,
        isSystemContextNode,
    };
};
