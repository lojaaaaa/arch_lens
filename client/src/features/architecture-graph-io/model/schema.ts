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

const baseNodeSchema = z.object({
    id: z.string().describe('Уникальный идентификатор узла'),
    kind: nodeKindSchema,
    layer: z.enum(['frontend', 'backend', 'data']).describe('Слой архитектуры'),
    position: positionSchema,
    complexity: z.number().min(0).describe('Сложность узла (0 и выше)'),
    criticality: z.number().min(0).max(1).describe('Критичность узла (0–1)'),
});

const graphEdgeSchema = z.object({
    id: z.string().describe('Уникальный идентификатор связи'),
    source: z.string().describe('ID узла-источника'),
    target: z.string().describe('ID узла-цели'),
    kind: edgeKindSchema,
    frequency: z.number().min(0).optional().describe('Частота вызовов'),
    synchronous: z.boolean().optional().describe('Синхронный ли вызов'),
});

const metaSchema = z
    .object({
        name: z.string().describe('Название схемы'),
        version: z.number().describe('Версия формата'),
        createdAt: z.string().describe('Дата создания (ISO 8601)'),
    })
    .optional();

export const architectureGraphSchema = z.object({
    meta: metaSchema,
    nodes: z.array(baseNodeSchema.passthrough()),
    edges: z.array(graphEdgeSchema),
});
