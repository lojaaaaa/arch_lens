import { useRef } from 'react';
import { nanoid } from 'nanoid';

import {
    createGraphEdge,
    ensureSystemEdges,
} from '@/shared/lib/architecture-graph-builders';
import { NODE_KIND } from '@/shared/model/config';
import type {
    ArchitectureNode,
    GraphEdge,
    TypeOrNull,
} from '@/shared/model/types';

import type {
    EditorClipboardApi,
    FlowEdgeWithData,
    FlowNodeWithArchitecture,
    UseEditorClipboardParams,
} from '../model/types';

const PASTE_OFFSET = 20;

const findSystemNode = <T extends FlowNodeWithArchitecture>(
    nodes: T[],
): T | undefined =>
    nodes.find((node) => node.data?.node?.kind === NODE_KIND.SYSTEM);

const isSystemNode = (node: ArchitectureNode) => node.kind === NODE_KIND.SYSTEM;

type ClipboardPayload =
    | { type: 'single'; node: FlowNodeWithArchitecture }
    | {
          type: 'multi';
          nodes: ArchitectureNode[];
          edges: GraphEdge[];
      };

export const useEditorClipboard = <
    TFlowNode extends FlowNodeWithArchitecture,
    TFlowEdge extends FlowEdgeWithData,
>(
    params: UseEditorClipboardParams<TFlowNode, TFlowEdge>,
): EditorClipboardApi<TFlowNode, TFlowEdge> => {
    const { nodes, edges, setNodes, setEdges, toFlowNode, toFlowEdge } = params;
    const clipboardRef = useRef<TypeOrNull<ClipboardPayload>>(null);

    const copy = (node: TFlowNode) => {
        clipboardRef.current = { type: 'single', node };
    };

    const copyMulti = (
        selectedNodes: TFlowNode[],
        selectedEdges: TFlowEdge[],
    ) => {
        const archNodes = selectedNodes
            .map((n) => n.data?.node)
            .filter(
                (n): n is ArchitectureNode =>
                    n !== undefined && n !== null && !isSystemNode(n),
            );

        const nodeIds = new Set(archNodes.map((n) => n.id));

        const graphEdges = selectedEdges
            .map((e) => e.data?.edge)
            .filter(
                (e): e is GraphEdge =>
                    e !== undefined &&
                    e !== null &&
                    nodeIds.has(e.source) &&
                    nodeIds.has(e.target),
            );

        if (archNodes.length === 0) {
            return;
        }

        clipboardRef.current =
            archNodes.length === 1 && graphEdges.length === 0
                ? {
                      type: 'single',
                      node: selectedNodes[0],
                  }
                : { type: 'multi', nodes: archNodes, edges: graphEdges };
    };

    const paste = () => {
        const payload = clipboardRef.current;
        if (!payload) {
            return;
        }

        if (payload.type === 'single') {
            pasteSingle(payload.node);
            return;
        }

        pasteMulti(payload.nodes, payload.edges);
    };

    const pasteSingle = (sourceNode: FlowNodeWithArchitecture) => {
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

    const pasteMulti = (
        archNodes: ArchitectureNode[],
        graphEdges: GraphEdge[],
    ) => {
        const idMap = new Map<string, string>();

        for (const n of archNodes) {
            idMap.set(n.id, nanoid());
        }

        const duplicatedNodes: ArchitectureNode[] = archNodes.map((node) => ({
            ...node,
            id: idMap.get(node.id)!,
            position: {
                x: node.position.x + PASTE_OFFSET,
                y: node.position.y + PASTE_OFFSET,
            },
        }));

        const duplicatedEdges: GraphEdge[] = graphEdges.map((edge) => ({
            ...edge,
            id: nanoid(),
            source: idMap.get(edge.source)!,
            target: idMap.get(edge.target)!,
        }));

        const flowNodes = duplicatedNodes.map((n) => toFlowNode(n, n.position));

        const currentArchNodes = nodes
            .map((n) => n.data?.node)
            .filter((n): n is ArchitectureNode => Boolean(n));
        const allArchNodes = [...currentArchNodes, ...duplicatedNodes];

        const currentGraphEdges = edges
            .map((e) => (e.data as { edge?: GraphEdge })?.edge)
            .filter((e): e is GraphEdge => Boolean(e));
        const allGraphEdges = [...currentGraphEdges, ...duplicatedEdges];

        const ensuredGraphEdges = ensureSystemEdges(
            allArchNodes,
            allGraphEdges,
        );

        const newGraphEdgesFromEnsure = ensuredGraphEdges.filter(
            (ge) => !allGraphEdges.some((e) => e.id === ge.id),
        );

        const newFlowEdges = [
            ...duplicatedEdges.map(toFlowEdge),
            ...newGraphEdgesFromEnsure.map(toFlowEdge),
        ];

        setNodes([...nodes, ...flowNodes]);
        setEdges([...edges, ...newFlowEdges]);
    };

    const duplicate = (node: TFlowNode) => {
        copy(node);
        paste();
    };

    return {
        copy,
        copyMulti,
        paste,
        duplicate,
    };
};
