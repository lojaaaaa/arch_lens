import { z } from 'zod';

const positionSchema = z.object({
    x: z.number().describe('Координата X узла на canvas'),
    y: z.number().describe('Координата Y узла на canvas'),
});

export const nodeKindSchema = z.enum([
    'ui_page',
    'ui_component',
    'state_store',
    'api_gateway',
    'service',
    'database',
    'cache',
    'external_system',
]);

export const edgeKindSchema = z.enum([
    'calls',
    'reads',
    'writes',
    'subscribes',
    'depends_on',
    'emits',
]);

const layerSchema = z.enum(['frontend', 'backend', 'data']);

const baseFields = {
    id: z.string().min(1, 'ID узла не может быть пустым'),
    position: positionSchema,
    complexity: z.number().min(0).default(1),
    criticality: z.number().min(0).max(1).default(0.5),
};

const uiPageNodeSchema = z.object({
    ...baseFields,
    kind: z.literal('ui_page'),
    layer: z.literal('frontend').default('frontend'),
    route: z.string().default('/'),
    componentsCount: z.number().min(0).default(1),
    stateUsage: z.enum(['none', 'local', 'global']).default('local'),
    updateFrequency: z.number().min(0).default(1),
});

const uiComponentNodeSchema = z.object({
    ...baseFields,
    kind: z.literal('ui_component'),
    layer: z.literal('frontend').default('frontend'),
    componentType: z
        .enum(['input', 'table', 'button', 'custom'])
        .default('custom'),
    nestedComponents: z.number().min(0).default(0),
    propsCount: z.number().min(0).default(1),
    stateType: z.enum(['none', 'local', 'context', 'global']).default('local'),
    renderFrequency: z.number().min(0).default(1),
});

const stateStoreNodeSchema = z.object({
    ...baseFields,
    kind: z.literal('state_store'),
    layer: z.literal('frontend').default('frontend'),
    storeType: z
        .enum([
            'redux',
            'zustand',
            'context',
            'local_storage',
            'session_storage',
        ])
        .default('zustand'),
    subscribersCount: z.number().min(0).default(1),
    updateFrequency: z.number().min(0).default(1),
});

const apiGatewayNodeSchema = z.object({
    ...baseFields,
    kind: z.literal('api_gateway'),
    layer: z.literal('backend').default('backend'),
    endpointsCount: z.number().min(0).default(1),
    requestRate: z.number().min(0).default(10),
    authRequired: z.boolean().default(false),
});

const serviceNodeSchema = z.object({
    ...baseFields,
    kind: z.literal('service'),
    layer: layerSchema.default('backend'),
    operationsCount: z.number().min(0).default(1),
    externalCalls: z.number().min(0).default(0),
    stateful: z.boolean().default(false),
});

const databaseNodeSchema = z.object({
    ...baseFields,
    kind: z.literal('database'),
    layer: layerSchema.default('data'),
    dbType: z.enum(['SQL', 'NoSQL']).default('SQL'),
    tablesCount: z.number().min(0).default(1),
    readWriteRatio: z.number().min(0).max(1).default(0.7),
});

const cacheNodeSchema = z.object({
    ...baseFields,
    kind: z.literal('cache'),
    layer: z.literal('data').default('data'),
    cacheType: z.enum(['redis', 'memory']).default('redis'),
    hitRate: z.number().min(0).max(1).default(0.8),
});

const externalSystemNodeSchema = z.object({
    ...baseFields,
    kind: z.literal('external_system'),
    layer: layerSchema.default('backend'),
    systemType: z
        .enum([
            'auth',
            'payment',
            'analytics',
            'storage',
            'notification',
            'other',
        ])
        .default('other'),
    protocol: z.enum(['REST', 'GraphQL', 'SOAP', 'gRPC']).default('REST'),
    reliability: z.number().min(0).max(1).default(0.95),
    latencyMs: z.number().min(0).default(100),
    rateLimit: z.number().min(0).optional(),
});

export const architectureNodeSchema = z.discriminatedUnion('kind', [
    uiPageNodeSchema,
    uiComponentNodeSchema,
    stateStoreNodeSchema,
    apiGatewayNodeSchema,
    serviceNodeSchema,
    databaseNodeSchema,
    cacheNodeSchema,
    externalSystemNodeSchema,
]);

const graphEdgeSchema = z.object({
    id: z.string().min(1, 'ID связи не может быть пустым'),
    source: z.string().min(1, 'source не может быть пустым'),
    target: z.string().min(1, 'target не может быть пустым'),
    kind: edgeKindSchema,
    frequency: z.number().min(0).optional(),
    synchronous: z.boolean().optional(),
});

const metaSchema = z
    .object({
        name: z.string().default('Без названия'),
        version: z.number().default(1),
        createdAt: z.string().default(() => new Date().toISOString()),
    })
    .optional();

export const architectureGraphSchema = z.object({
    meta: metaSchema,
    nodes: z.array(architectureNodeSchema),
    edges: z.array(graphEdgeSchema),
});
