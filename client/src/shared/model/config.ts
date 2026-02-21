import type { NodeKind } from './types';

export const allowedConnections: Record<NodeKind, NodeKind[]> = {
    ui_page: ['ui_component', 'api_gateway', 'system'],
    ui_component: ['state_store', 'api_gateway'],
    state_store: ['ui_component'],
    api_gateway: ['service'],
    service: ['service', 'database', 'cache', 'external_system'],
    database: [],
    cache: [],
    external_system: [],
    system: [],
} as const;
