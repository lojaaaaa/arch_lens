import { nanoid } from 'nanoid';

import type {
    ArchitectureNode,
    EdgeKind,
    GraphEdge,
    NodeKind,
} from '@/shared/model/types';

const getRandomPosition = () => ({
    x: 80 + Math.random() * 400,
    y: 80 + Math.random() * 300,
});

const getBaseNode = (kind: NodeKind, position?: { x: number; y: number }) =>
    ({
        id: nanoid(),
        kind,
        position: position ?? getRandomPosition(),
        complexity: 1,
        criticality: 1,
    }) as ArchitectureNode;

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
    for (const pageId of pageIds) {
        const key = `${pageId}->${systemNode.id}:depends_on`;
        if (!existingPairs.has(key)) {
            nextEdges.push({
                id: nanoid(),
                source: pageId,
                target: systemNode.id,
                kind: 'depends_on',
            });
        }
    }
    return nextEdges;
};
