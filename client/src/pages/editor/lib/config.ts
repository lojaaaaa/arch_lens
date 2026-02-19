import type { EdgeKind, LayerType, NodeKind } from '@/shared/model/types';

export const NODE_LABELS: Record<NodeKind, string> = {
    ui_page: 'Страница',
    ui_component: 'Компонент',
    state_store: 'Хранилище',
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
        border: 'border-blue-300 dark:border-blue-700',
        text: 'text-blue-600 dark:text-blue-400',
    },
    backend: {
        bg: 'bg-green-50/60 dark:bg-green-950/40',
        border: 'border-green-300 dark:border-green-700',
        text: 'text-green-600 dark:text-green-400',
    },
    data: {
        bg: 'bg-amber-50/60 dark:bg-amber-950/40',
        border: 'border-amber-300 dark:border-amber-700',
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
    depends_on: { color: EDGE_COLOR, strokeDasharray: '3 3' },
    emits: { color: EDGE_COLOR, animated: true },
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
