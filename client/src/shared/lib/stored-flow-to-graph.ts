import type {
    ArchitectureGraph,
    ArchitectureNode,
    GraphEdge,
} from '@/shared/model/types';

export type StoredCanvasNote = {
    id: string;
    position: { x: number; y: number };
    content: string;
    width?: number;
    height?: number;
};

export type StoredFlow = {
    nodes: unknown[];
    edges: unknown[];
    viewport: { x: number; y: number; zoom: number };
    canvasNotes?: StoredCanvasNote[];
    savedAt: string;
};

const ARCHITECTURE_GRAPH_VERSION = 1;

const isArchitectureNode = (value: unknown): value is ArchitectureNode =>
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'kind' in value;

const isGraphEdge = (value: unknown): value is GraphEdge =>
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'source' in value &&
    'target' in value &&
    'kind' in value;

export const storedFlowToArchitectureGraph = (
    stored: StoredFlow,
): ArchitectureGraph => {
    const nodes: ArchitectureNode[] = [];
    for (const flowNode of stored.nodes) {
        const data = (flowNode as { data?: { node?: unknown } }).data;
        const node = data?.node;
        if (isArchitectureNode(node)) {
            nodes.push(node);
        }
    }

    const edges: GraphEdge[] = [];
    for (const flowEdge of stored.edges) {
        const data = (
            flowEdge as {
                data?: { edge?: unknown };
                id?: string;
                source?: string;
                target?: string;
            }
        ).data;
        const edge = data?.edge;
        if (isGraphEdge(edge)) {
            edges.push(edge);
        } else if (
            typeof flowEdge === 'object' &&
            flowEdge !== null &&
            'id' in flowEdge &&
            'source' in flowEdge &&
            'target' in flowEdge
        ) {
            const fe = flowEdge as {
                id: string;
                source: string;
                target: string;
            };
            edges.push({
                id: fe.id,
                source: fe.source,
                target: fe.target,
                kind: 'calls',
            });
        }
    }

    return {
        meta: {
            name: 'Сохранённая схема',
            version: ARCHITECTURE_GRAPH_VERSION,
            createdAt: stored.savedAt ?? new Date().toISOString(),
        },
        nodes,
        edges,
    };
};
