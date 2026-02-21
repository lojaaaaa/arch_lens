import type { Node } from '@xyflow/react';
import type { Edge } from '@xyflow/react';
import { nanoid } from 'nanoid';

import type { ArchitectureGraphInput } from '@/features/architecture-graph-io';
import type {
    ArchitectureGraph,
    ArchitectureNode,
    EdgeKind,
    GraphEdge,
    NodeKind,
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

const getRandomPosition = () => {
    return {
        x: 80 + Math.random() * 400,
        y: 80 + Math.random() * 300,
    };
};

const getBaseNode = (kind: NodeKind, position?: { x: number; y: number }) => {
    const baseNode = {
        id: nanoid(),
        kind,
        position: position ?? getRandomPosition(),
        complexity: 1,
        criticality: 1,
    } as ArchitectureNode;

    return baseNode;
};

export const createNode = (
    kind: NodeKind,
    position?: { x: number; y: number },
): ArchitectureNode => {
    const baseNode = getBaseNode(kind, position);

    switch (kind) {
        case 'system':
            return {
                ...baseNode,
                kind: 'system',
                layer: 'frontend',
                pagesCount: 0,
                description: '',
            };
        case 'ui_page':
            return {
                ...baseNode,
                kind: 'ui_page',
                layer: 'frontend',
                route: '/',
                componentsCount: 0,
                stateUsage: 'none',
                updateFrequency: 1,
            };
        case 'ui_component':
            return {
                ...baseNode,
                kind: 'ui_component',
                layer: 'frontend',
                componentType: 'custom',
                nestedComponents: 0,
                propsCount: 0,
                stateType: 'none',
                renderFrequency: 1,
            };
        case 'state_store':
            return {
                ...baseNode,
                kind: 'state_store',
                layer: 'frontend',
                storeType: 'zustand',
                subscribersCount: 0,
                updateFrequency: 1,
            };
        case 'api_gateway':
            return {
                ...baseNode,
                kind: 'api_gateway',
                layer: 'backend',
                endpointsCount: 0,
                requestRate: 0,
                authRequired: false,
            };
        case 'service':
            return {
                ...baseNode,
                kind: 'service',
                layer: 'backend',
                operationsCount: 0,
                externalCalls: 0,
                stateful: false,
            };
        case 'database':
            return {
                ...baseNode,
                kind: 'database',
                layer: 'data',
                dbType: 'SQL',
                tablesCount: 0,
                readWriteRatio: 0.5,
            };
        case 'cache':
            return {
                ...baseNode,
                kind: 'cache',
                layer: 'data',
                cacheType: 'redis',
                hitRate: 0,
            };
        case 'external_system':
            return {
                ...baseNode,
                kind: 'external_system',
                layer: 'data',
                systemType: 'other',
                protocol: 'REST',
                reliability: 0.99,
                latencyMs: 200,
            };
        default:
            return baseNode;
    }
};

export const ensureSystemNode = (
    nodes: ArchitectureNode[],
): ArchitectureNode[] => {
    const systemIndex = nodes.findIndex((node) => node.kind === 'system');
    if (systemIndex === -1) {
        const systemNode = createNode('system', { x: 80, y: 80 });
        return [systemNode, ...nodes];
    }
    const systemNode = nodes[systemIndex];
    const remaining = nodes.filter((node) => node.kind !== 'system');
    return [systemNode, ...remaining];
};

export const ensureSystemEdges = (
    nodes: ArchitectureNode[],
    edges: GraphEdge[],
): GraphEdge[] => {
    const systemNode = nodes.find((node) => node.kind === 'system');
    if (!systemNode) {
        return edges;
    }
    const existingPairs = new Set(
        edges.map((edge) => `${edge.source}->${edge.target}:${edge.kind}`),
    );
    const pageIds = nodes
        .filter((node) => node.kind === 'ui_page')
        .map((node) => node.id);
    const nextEdges = [...edges];
    pageIds.forEach((pageId) => {
        const key = `${pageId}->${systemNode.id}:depends_on`;
        if (!existingPairs.has(key)) {
            nextEdges.push({
                id: nanoid(),
                source: pageId,
                target: systemNode.id,
                kind: 'depends_on',
            });
        }
    });
    return nextEdges;
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

export const createGraphEdge = (
    source: string,
    target: string,
    kind: EdgeKind = 'calls',
): GraphEdge => ({
    id: nanoid(),
    source,
    target,
    kind,
});

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
): EdgeKind | null => {
    return allowedEdgeKinds[sourceKind]?.[targetKind]?.[0] ?? null;
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

            return node;
        }),

        edges: edges.map((edge) => {
            const data = edge.data as FlowEdgeData | undefined;
            const graphEdge = data?.edge;
            return {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                kind: graphEdge?.kind ?? 'calls',
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

const STORAGE_KEY = 'architecture-editor-flow';

export type StoredFlow = {
    nodes: unknown[];
    edges: unknown[];
    viewport: { x: number; y: number; zoom: number };
    savedAt: string;
};

export const saveFlowToStorage = (flow: Omit<StoredFlow, 'savedAt'>) => {
    const stored: StoredFlow = {
        ...flow,
        savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
};

export const loadFlowFromStorage = (): StoredFlow | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        return JSON.parse(raw) as StoredFlow;
    } catch {
        return null;
    }
};

export const hasStoredFlow = (): boolean =>
    localStorage.getItem(STORAGE_KEY) !== null;

export const clearFlowFromStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
};
