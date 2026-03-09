import { useRef } from 'react';
import { nanoid } from 'nanoid';

import { createGraphEdge } from '@/shared/lib/architecture-graph-builders';
import { NODE_KIND } from '@/shared/model/config';
import type { ArchitectureNode, TypeOrNull } from '@/shared/model/types';

import type {
    EditorClipboardApi,
    FlowNodeWithArchitecture,
    UseEditorClipboardParams,
} from '../model/types';

const PASTE_OFFSET = 1;

const findSystemNode = <T extends FlowNodeWithArchitecture>(
    nodes: T[],
): T | undefined =>
    nodes.find((node) => node.data?.node?.kind === NODE_KIND.SYSTEM);

export const useEditorClipboard = <
    TFlowNode extends FlowNodeWithArchitecture,
    TFlowEdge,
>(
    params: UseEditorClipboardParams<TFlowNode, TFlowEdge>,
): EditorClipboardApi<TFlowNode> => {
    const { nodes, edges, setNodes, setEdges, toFlowNode, toFlowEdge } = params;
    const clipboardRef = useRef<TypeOrNull<{ node: TFlowNode }>>(null);

    const copy = (node: TFlowNode) => {
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

        const duplicatedNode: ArchitectureNode = {
            ...architectureNode,
            id: nanoid(),
            position: nextPosition,
        };

        const flowNode = toFlowNode(duplicatedNode, nextPosition);
        setNodes([...nodes, flowNode]);

        if (architectureNode.kind !== NODE_KIND.UI_PAGE) {
            return;
        }

        const systemNode = findSystemNode(nodes);

        if (!systemNode) {
            return;
        }

        const flowEdge = toFlowEdge(
            createGraphEdge(duplicatedNode.id, systemNode.id, 'depends_on'),
        );

        setEdges([...edges, flowEdge]);
    };

    const duplicate = (node: TFlowNode) => {
        copy(node);
        paste();
    };

    return {
        copy,
        paste,
        duplicate,
    };
};
