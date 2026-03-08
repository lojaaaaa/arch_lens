import type { NodeKind } from './types';

export const allowedConnections: Record<NodeKind, NodeKind[]> = {
    ui_page: ['ui_component', 'api_gateway', 'system'],
    ui_component: ['ui_component', 'state_store', 'api_gateway'],
    state_store: ['ui_component'],
    api_gateway: ['service'],
    service: ['service', 'database', 'cache', 'external_system'],
    database: [],
    cache: [],
    external_system: [],
    system: [],
} as const;

export const NODE_KIND = {
    UI_PAGE: 'ui_page',
    UI_COMPONENT: 'ui_component',
    STATE_STORE: 'state_store',
    API_GATEWAY: 'api_gateway',
    SERVICE: 'service',
    DATABASE: 'database',
    CACHE: 'cache',
    EXTERNAL_SYSTEM: 'external_system',
    SYSTEM: 'system',
} as const satisfies Record<string, NodeKind>;
