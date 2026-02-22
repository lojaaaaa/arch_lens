import { useRef } from 'react';
import type { Edge } from '@xyflow/react';
import { nanoid } from 'nanoid';

import { NODE_KIND } from '@/shared/model/config';
import type { TypeOrNull } from '@/shared/model/types';

import { createGraphEdge, toFlowEdge, toFlowNode } from './utils';
import type { ArchitectureFlowNode } from '../model/types';

type ClipboardPayload = {
    node: ArchitectureFlowNode;
};

type UseEditorClipboardParams = {
    nodes: ArchitectureFlowNode[];
    edges: Edge[];
    setNodes: (nodes: ArchitectureFlowNode[]) => void;
    setEdges: (edges: Edge[]) => void;
};

const PASTE_OFFSET = 1;

export const useEditorClipboard = ({
    nodes,
    edges,
    setNodes,
    setEdges,
}: UseEditorClipboardParams) => {
    const clipboardRef = useRef<TypeOrNull<ClipboardPayload>>(null);

    const copy = (node: ArchitectureFlowNode) => {
        clipboardRef.current = { node };
    };

    const paste = () => {
        const payload = clipboardRef.current;
        if (!payload) {
            return;
        }

        const sourceNode = payload.node;
        const architectureNode = sourceNode.data?.node;

        if (!architectureNode) {
            return;
        }

        const nextPosition = {
            x: architectureNode.position.x + PASTE_OFFSET,
            y: architectureNode.position.y + PASTE_OFFSET,
        };

        const duplicatedNode = {
            ...architectureNode,
            id: nanoid(),
            position: nextPosition,
        };

        const flowNode = toFlowNode(duplicatedNode, nextPosition);
        setNodes([...nodes, flowNode]);

        if (architectureNode.kind !== NODE_KIND.UI_PAGE) {
            return;
        }

        const systemNode = nodes.find(
            (node) => node.data?.node?.kind === NODE_KIND.SYSTEM,
        );

        if (!systemNode) {
            return;
        }

        const flowEdge = toFlowEdge(
            createGraphEdge(duplicatedNode.id, systemNode.id, 'depends_on'),
        );

        setEdges([...edges, flowEdge]);
    };

    const duplicate = (node: ArchitectureFlowNode) => {
        copy(node);
        paste();
    };

    return {
        copy,
        paste,
        duplicate,
    };
};
