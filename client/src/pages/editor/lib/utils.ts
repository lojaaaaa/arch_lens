import type { Node } from '@xyflow/react';
import type { Edge } from '@xyflow/react';
import { nanoid } from 'nanoid';

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
                layer: 'backend',
                systemType: 'other',
                protocol: 'REST',
                reliability: 0.99,
                latencyMs: 200,
            };
        default:
            return baseNode;
    }
};

import type { ArchitectureGraphInput } from '@/features/architecture-graph-io';

export const architectureGraphToFlow = (
    graph: ArchitectureGraphInput,
): {
    nodes: ReturnType<typeof toFlowNode>[];
    edges: ReturnType<typeof toFlowEdge>[];
} => {
    const flowNodes = graph.nodes.map((node) => {
        const normalized = normalizeImportedNode(node);
        return toFlowNode(normalized);
    });
    const flowEdges = graph.edges.map((edge) =>
        toFlowEdge({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            kind: edge.kind,
        }),
    );
    return { nodes: flowNodes, edges: flowEdges };
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
            label: NODE_LABELS[archNode.kind] ?? archNode.kind,
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
