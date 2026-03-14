import type { Node } from '@xyflow/react';
import type { Edge } from '@xyflow/react';

import type { ArchitectureGraphInput } from '@/features/architecture-graph-io';
import {
    createNode,
    ensureSystemEdges,
    ensureSystemNode,
} from '@/shared/lib/architecture-graph-builders';
import type {
    ArchitectureGraph,
    ArchitectureNode,
    EdgeKind,
    GraphEdge,
    NodeKind,
    TypeOrNull,
} from '@/shared/model/types';

import { EDGE_KIND_LABELS, EDGE_STYLES, NODE_LABELS } from './config';
import type { ArchitectureFlowNode } from '../model/types';

export interface FlowEdgeData extends Record<string, unknown> {
    edge: GraphEdge;
}

export interface FlowNodeData extends Record<string, unknown> {
    label: string;
    node: ArchitectureNode;
}

export {
    createGraphEdge,
    createNode,
    ensureSystemEdges,
    ensureSystemNode,
} from '@/shared/lib/architecture-graph-builders';

export const filterInvalidEdgesOnImport = (
    graph: ArchitectureGraphInput,
): {
    schema: ArchitectureGraphInput;
    invalidWarnings: string[];
} => {
    const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
    const validEdges: ArchitectureGraphInput['edges'] = [];
    const invalidWarnings: string[] = [];

    for (const edge of graph.edges) {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        const sourceKind = sourceNode?.kind;
        const targetKind = targetNode?.kind;

        if (!sourceKind || !targetKind) {
            invalidWarnings.push(
                `Связь ${edge.source} → ${edge.target}: узел не найден`,
            );
            continue;
        }

        if (isEdgeAllowed(sourceKind, targetKind)) {
            validEdges.push(edge);
        } else {
            const sourceLabel = NODE_LABELS[sourceKind] ?? sourceKind;
            const targetLabel = NODE_LABELS[targetKind] ?? targetKind;
            invalidWarnings.push(
                `Недопустимая связь: ${sourceLabel} → ${targetLabel}`,
            );
        }
    }

    return {
        schema: { ...graph, edges: validEdges },
        invalidWarnings,
    };
};

export const architectureGraphToFlow = (
    graph: ArchitectureGraphInput,
): {
    nodes: ReturnType<typeof toFlowNode>[];
    edges: ReturnType<typeof toFlowEdge>[];
} => {
    const normalizedNodes = graph.nodes.map((node) => {
        const normalized = normalizeImportedNode(node);
        return normalized;
    });
    const ensuredNodes = ensureSystemNode(normalizedNodes);
    const nodeIds = new Set(ensuredNodes.map((node) => node.id));
    const filteredEdges = graph.edges.filter(
        (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
    );
    const ensuredEdges = ensureSystemEdges(ensuredNodes, filteredEdges);
    return {
        nodes: ensuredNodes.map((node) => toFlowNode(node)),
        edges: ensuredEdges.map((edge) => toFlowEdge(edge)),
    };
};

export const normalizeImportedNode = (
    partial: {
        id: string;
        kind: NodeKind;
        position: { x: number; y: number };
    } & Record<string, unknown>,
): ArchitectureNode => {
    const defaults = createNode(partial.kind, partial.position);
    return { ...defaults, ...partial, id: partial.id } as ArchitectureNode;
};

const EDGE_LABEL_STYLE = {
    labelStyle: { fill: 'var(--foreground)', fontSize: 10 },
    labelBgStyle: { fill: 'var(--background)', fillOpacity: 0.95 },
    labelBgPadding: [2, 6] as [number, number],
    labelBgBorderRadius: 4,
};

export const toFlowEdge = (graphEdge: GraphEdge): Edge<FlowEdgeData> => {
    const edgeStyle = EDGE_STYLES[graphEdge.kind];
    return {
        id: graphEdge.id,
        source: graphEdge.source,
        target: graphEdge.target,
        label: EDGE_KIND_LABELS[graphEdge.kind] ?? graphEdge.kind,
        type: 'smoothstep',
        animated: edgeStyle?.animated ?? false,
        style: {
            stroke: edgeStyle?.color,
            strokeWidth: edgeStyle?.strokeWidth ?? 1.5,
            ...(edgeStyle?.strokeDasharray
                ? { strokeDasharray: edgeStyle.strokeDasharray }
                : {}),
        },
        markerEnd: { type: 'arrowclosed', color: edgeStyle?.color },
        labelStyle: EDGE_LABEL_STYLE.labelStyle,
        labelBgStyle: EDGE_LABEL_STYLE.labelBgStyle,
        labelBgPadding: EDGE_LABEL_STYLE.labelBgPadding,
        labelBgBorderRadius: EDGE_LABEL_STYLE.labelBgBorderRadius,
        data: { edge: graphEdge },
    };
};

export const toFlowNode = (
    archNode: ArchitectureNode,
    position?: { x: number; y: number },
): Node<FlowNodeData> => {
    const pos = position ?? archNode.position;
    return {
        id: archNode.id,
        type: 'architecture',
        position: pos,
        data: {
            label:
                archNode.displayName ??
                NODE_LABELS[archNode.kind] ??
                archNode.kind,
            node: archNode,
        },
    };
};

export const allowedEdgeKinds: Record<
    NodeKind,
    Partial<Record<NodeKind, EdgeKind[]>>
> = {
    ui_page: {
        ui_component: ['depends_on'],
        system: ['depends_on'],
        api_gateway: ['calls'],
    },

    ui_component: {
        ui_component: ['depends_on'],
        state_store: ['reads', 'writes', 'subscribes'],
        api_gateway: ['calls'],
    },

    state_store: {
        ui_component: ['emits'],
    },

    api_gateway: {
        service: ['calls'],
    },

    service: {
        service: ['calls', 'emits', 'subscribes', 'depends_on'],
        database: ['reads', 'writes'],
        cache: ['reads', 'writes'],
        external_system: ['calls', 'emits'],
    },

    database: {},
    cache: {},
    external_system: {},
    system: {},
};

export const isEdgeAllowed = (
    sourceKind: NodeKind,
    targetKind: NodeKind,
): boolean => {
    return (allowedEdgeKinds[sourceKind]?.[targetKind]?.length ?? 0) > 0;
};

export const getDefaultEdgeKind = (
    sourceKind: NodeKind,
    targetKind: NodeKind,
): TypeOrNull<EdgeKind> => {
    return allowedEdgeKinds[sourceKind]?.[targetKind]?.[0] ?? null;
};

const serializeNodeForAnalysis = (node: ArchitectureNode): ArchitectureNode => {
    const base = {
        id: node.id,
        kind: node.kind,
        layer: node.layer,
        position: { ...node.position },
        complexity: node.complexity,
        criticality: node.criticality,
        displayName: node.displayName,
    };
    return { ...base, ...node } as ArchitectureNode;
};

export const buildArchitectureGraph = (
    nodes: ArchitectureFlowNode[],
    edges: Edge[],
) => {
    return {
        nodes: nodes.map(({ id, data: { node } }) => {
            if (!node) {
                throw new Error(`Node ${id} has no architecture data`);
            }
            return serializeNodeForAnalysis(node);
        }),

        edges: edges.map((edge) => {
            const data = edge.data as FlowEdgeData | undefined;
            const graphEdge = data?.edge;
            return {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                kind: graphEdge?.kind ?? 'calls',
                ...(graphEdge?.frequency !== undefined && {
                    frequency: graphEdge.frequency,
                }),
                ...(graphEdge?.synchronous !== undefined && {
                    synchronous: graphEdge.synchronous,
                }),
            };
        }),
    };
};

export const ensureSystemFlowGraph = (
    nodes: ArchitectureFlowNode[],
    edges: Edge[],
): {
    nodes: ReturnType<typeof toFlowNode>[];
    edges: ReturnType<typeof toFlowEdge>[];
} => {
    const graph = buildArchitectureGraph(nodes, edges);
    const ensuredNodes = ensureSystemNode(graph.nodes);
    const ensuredEdges = ensureSystemEdges(ensuredNodes, graph.edges);
    return {
        nodes: ensuredNodes.map((node) => toFlowNode(node)),
        edges: ensuredEdges.map((edge) => toFlowEdge(edge)),
    };
};

const ARCHITECTURE_GRAPH_VERSION = 1;

export const buildExportableGraph = (
    nodes: ArchitectureFlowNode[],
    edges: Edge[],
    name = 'Архитектурная схема',
): ArchitectureGraph => {
    const { nodes: graphNodes, edges: graphEdges } = buildArchitectureGraph(
        nodes,
        edges,
    );

    return {
        meta: {
            name,
            version: ARCHITECTURE_GRAPH_VERSION,
            createdAt: new Date().toISOString(),
        },
        nodes: graphNodes,
        edges: graphEdges,
    };
};
