import type { EdgeKind, NodeKind } from '@/shared/model/types';

export const NODE_LABELS: Record<NodeKind, string> = {
    ui_page: 'UI Page',
    ui_component: 'UI Component',
    state_store: 'State Store',
    api_gateway: 'API Gateway',
    service: 'Service',
    database: 'Database',
    cache: 'Cache',
    external_system: 'External System',
};

export const EDGE_KIND_LABELS: Record<EdgeKind, string> = {
    calls: 'calls',
    reads: 'reads',
    writes: 'writes',
    subscribes: 'subscribes',
    depends_on: 'depends_on',
    emits: 'emits',
} as const;

export const EDGE_KIND_HINTS: Record<EdgeKind, string> = {
    calls: 'Вызов API/сервиса (request–response)',
    reads: 'Чтение данных (например, из БД или кэша)',
    writes: 'Запись данных',
    subscribes: 'Подписка на события/обновления',
    depends_on: 'Зависимость (сервис/модуль зависит от другого)',
    emits: 'Публикация события',
} as const;

export const NODE_KINDS: { kind: NodeKind; label: string }[] = [
    { kind: 'ui_page', label: 'UI Page' },
    { kind: 'ui_component', label: 'UI Component' },
    { kind: 'state_store', label: 'State Store' },
    { kind: 'api_gateway', label: 'API Gateway' },
    { kind: 'service', label: 'Service' },
    { kind: 'database', label: 'Database' },
    { kind: 'cache', label: 'Cache' },
    { kind: 'external_system', label: 'External System' },
] as const;
