import type { EdgeKind, LayerType, NodeKind } from '@/shared/model/types';

/** Подсказки при создании связи: «Обычно между X и Y используют...» */
export const EDGE_CONNECTION_HINTS: Partial<
    Record<NodeKind, Partial<Record<NodeKind, string>>>
> = {
    ui_component: {
        api_gateway:
            'Тип calls — вызов API (request-response). Двойной клик по связи для смены типа.',
        state_store:
            'reads/writes для данных, subscribes для реактивных обновлений.',
    },
    service: {
        database:
            'reads — чтение, writes — запись. Для кэширования добавьте cache между service и database.',
        cache: 'reads при промахе идёт в БД, writes — инвалидация кэша.',
        service: 'calls для синхронных вызовов, emits/subscribes для событий.',
        external_system: 'calls для REST/GraphQL, emits для webhook.',
    },
    api_gateway: {
        service: 'calls — маршрутизация запросов к сервисам.',
    },
};

export const NODE_LABELS: Record<NodeKind, string> = {
    ui_page: 'Страница',
    ui_component: 'Компонент',
    state_store: 'Хранилище',
    system: 'Система',
    api_gateway: 'API Gateway',
    service: 'Сервис',
    database: 'База данных',
    cache: 'Кэш',
    external_system: 'Внешняя система',
};

export const LAYER_COLORS: Record<
    LayerType,
    { bg: string; border: string; text: string }
> = {
    frontend: {
        bg: 'bg-blue-50/60 dark:bg-blue-950/40',
        border: 'border-blue-200/40 dark:border-blue-800/30',
        text: 'text-blue-600 dark:text-blue-400',
    },
    backend: {
        bg: 'bg-green-50/60 dark:bg-green-950/40',
        border: 'border-green-200/40 dark:border-green-800/30',
        text: 'text-green-600 dark:text-green-400',
    },
    data: {
        bg: 'bg-amber-50/60 dark:bg-amber-950/40',
        border: 'border-amber-200/40 dark:border-amber-800/30',
        text: 'text-amber-600 dark:text-amber-400',
    },
};

export const LAYER_LABELS: Record<LayerType, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    data: 'Data',
};

export const EDGE_KIND_LABELS: Record<EdgeKind, string> = {
    calls: 'Вызов',
    reads: 'Чтение',
    writes: 'Запись',
    subscribes: 'Подписка',
    depends_on: 'Зависит от',
    emits: 'Событие',
} as const;

export const EDGE_KIND_HINTS: Record<EdgeKind, string> = {
    calls: 'Вызов API/сервиса (request–response)',
    reads: 'Чтение данных (например, из БД или кэша)',
    writes: 'Запись данных',
    subscribes: 'Подписка на события/обновления',
    depends_on: 'Зависимость (сервис/модуль зависит от другого)',
    emits: 'Публикация события',
} as const;

const EDGE_COLOR = 'var(--edge)';

/**
 * Правила стилей связей (семантика):
 * - Сплошная линия: синхронные вызовы (calls, writes) — immediate request-response
 * - Пунктирная: асинхронные/события (subscribes, emits) или поток данных (reads)
 * - Пунктир + animated: event-driven (subscribes, emits)
 * - depends_on: пунктир — структурная зависимость
 */
export const EDGE_STYLES: Record<
    EdgeKind,
    {
        color: string;
        strokeDasharray?: string;
        animated?: boolean;
        strokeWidth?: number;
    }
> = {
    calls: { color: EDGE_COLOR },
    reads: { color: EDGE_COLOR, strokeDasharray: '6 3' },
    writes: { color: EDGE_COLOR, strokeWidth: 2.5 },
    subscribes: { color: EDGE_COLOR, strokeDasharray: '8 4', animated: true },
    depends_on: { color: EDGE_COLOR, strokeDasharray: '4 4' },
    emits: { color: EDGE_COLOR, strokeDasharray: '8 4', animated: true },
} as const;

export const NODE_KINDS: { kind: NodeKind; label: string }[] = [
    { kind: 'ui_page', label: 'Страница' },
    { kind: 'ui_component', label: 'Компонент' },
    { kind: 'state_store', label: 'Хранилище' },
    { kind: 'api_gateway', label: 'API Gateway' },
    { kind: 'service', label: 'Сервис' },
    { kind: 'database', label: 'База данных' },
    { kind: 'cache', label: 'Кэш' },
    { kind: 'external_system', label: 'Внешняя система' },
] as const;

export const LAYER_NODE_KINDS: {
    layer: LayerType;
    label: string;
    kinds: { kind: NodeKind; label: string }[];
}[] = [
    {
        layer: 'frontend',
        label: 'Frontend',
        kinds: [
            { kind: 'ui_page', label: 'Страница' },
            { kind: 'ui_component', label: 'Компонент' },
            { kind: 'state_store', label: 'Хранилище' },
        ],
    },
    {
        layer: 'backend',
        label: 'Backend',
        kinds: [
            { kind: 'api_gateway', label: 'API Gateway' },
            { kind: 'service', label: 'Сервис' },
        ],
    },
    {
        layer: 'data',
        label: 'Data',
        kinds: [
            { kind: 'database', label: 'База данных' },
            { kind: 'cache', label: 'Кэш' },
            { kind: 'external_system', label: 'Внешняя система' },
        ],
    },
];
