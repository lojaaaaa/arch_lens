import {
    createGraphEdge,
    createNode,
    ensureSystemEdges,
    ensureSystemNode,
} from '@/shared/lib/architecture-graph-builders';
import type {
    ArchitectureNode,
    GraphEdge,
    NodeKind,
} from '@/shared/model/types';

import type { ArchitecturePreset } from '../model/types';

const createPresetNode = <TKind extends NodeKind>(
    kind: TKind,
    position: { x: number; y: number },
    overrides?: Partial<
        Omit<Extract<ArchitectureNode, { kind: TKind }>, 'id' | 'kind'>
    >,
): Extract<ArchitectureNode, { kind: TKind }> =>
    ({
        ...(createNode(kind, position) as Extract<
            ArchitectureNode,
            { kind: TKind }
        >),
        ...overrides,
    }) as Extract<ArchitectureNode, { kind: TKind }>;

const buildCrudPreset = (): {
    nodes: ArchitectureNode[];
    edges: GraphEdge[];
} => {
    const system = createPresetNode(
        'system',
        { x: 80, y: 60 },
        {
            displayName: 'Система',
        },
    );
    const page = createPresetNode(
        'ui_page',
        { x: 80, y: 200 },
        {
            displayName: 'Список заказов',
        },
    );
    const gateway = createPresetNode(
        'api_gateway',
        { x: 320, y: 200 },
        {
            displayName: 'API Gateway',
        },
    );
    const service = createPresetNode(
        'service',
        { x: 560, y: 200 },
        {
            displayName: 'Order Service',
        },
    );
    const database = createPresetNode(
        'database',
        { x: 800, y: 140 },
        {
            displayName: 'Orders DB',
        },
    );
    const cache = createPresetNode(
        'cache',
        { x: 800, y: 260 },
        {
            displayName: 'Order Cache',
        },
    );

    const nodes = [system, page, gateway, service, database, cache];
    const edges = [
        createGraphEdge(page.id, system.id, 'depends_on'),
        createGraphEdge(page.id, gateway.id, 'calls'),
        createGraphEdge(gateway.id, service.id, 'calls'),
        createGraphEdge(service.id, database.id, 'reads'),
        createGraphEdge(service.id, database.id, 'writes'),
        createGraphEdge(service.id, cache.id, 'reads'),
        createGraphEdge(service.id, cache.id, 'writes'),
    ];

    const ensuredNodes = ensureSystemNode(nodes);
    return {
        nodes: ensuredNodes,
        edges: ensureSystemEdges(ensuredNodes, edges),
    };
};

const buildMicroservicesPreset = (): {
    nodes: ArchitectureNode[];
    edges: GraphEdge[];
} => {
    const system = createPresetNode(
        'system',
        { x: 80, y: 60 },
        {
            displayName: 'Платформа',
        },
    );
    const page = createPresetNode(
        'ui_page',
        { x: 80, y: 210 },
        {
            displayName: 'Клиент',
        },
    );
    const gateway = createPresetNode(
        'api_gateway',
        { x: 320, y: 210 },
        {
            displayName: 'Gateway',
        },
    );
    const authService = createPresetNode(
        'service',
        { x: 560, y: 120 },
        {
            displayName: 'Auth Service',
        },
    );
    const billingService = createPresetNode(
        'service',
        { x: 560, y: 300 },
        {
            displayName: 'Billing Service',
        },
    );
    const authDb = createPresetNode(
        'database',
        { x: 820, y: 90 },
        {
            displayName: 'Auth DB',
        },
    );
    const billingDb = createPresetNode(
        'database',
        { x: 820, y: 330 },
        {
            displayName: 'Billing DB',
        },
    );
    const external = createPresetNode(
        'external_system',
        { x: 820, y: 210 },
        {
            displayName: 'Payment Provider',
        },
    );

    const nodes = [
        system,
        page,
        gateway,
        authService,
        billingService,
        authDb,
        billingDb,
        external,
    ];
    const edges = [
        createGraphEdge(page.id, system.id, 'depends_on'),
        createGraphEdge(page.id, gateway.id, 'calls'),
        createGraphEdge(gateway.id, authService.id, 'calls'),
        createGraphEdge(gateway.id, billingService.id, 'calls'),
        createGraphEdge(authService.id, authDb.id, 'reads'),
        createGraphEdge(authService.id, authDb.id, 'writes'),
        createGraphEdge(billingService.id, billingDb.id, 'reads'),
        createGraphEdge(billingService.id, billingDb.id, 'writes'),
        createGraphEdge(billingService.id, external.id, 'calls'),
    ];

    const ensuredNodes = ensureSystemNode(nodes);
    return {
        nodes: ensuredNodes,
        edges: ensureSystemEdges(ensuredNodes, edges),
    };
};

const buildEventDrivenPreset = (): {
    nodes: ArchitectureNode[];
    edges: GraphEdge[];
} => {
    const system = createPresetNode(
        'system',
        { x: 80, y: 60 },
        {
            displayName: 'Событийная платформа',
        },
    );
    const page = createPresetNode(
        'ui_page',
        { x: 80, y: 210 },
        {
            displayName: 'Админ-панель',
        },
    );
    const gateway = createPresetNode(
        'api_gateway',
        { x: 320, y: 210 },
        {
            displayName: 'Public API',
        },
    );
    const producer = createPresetNode(
        'service',
        { x: 560, y: 120 },
        {
            displayName: 'Producer',
        },
    );
    const consumer = createPresetNode(
        'service',
        { x: 560, y: 300 },
        {
            displayName: 'Consumer',
        },
    );
    const store = createPresetNode(
        'database',
        { x: 820, y: 120 },
        {
            displayName: 'Event Store',
        },
    );
    const cache = createPresetNode(
        'cache',
        { x: 820, y: 300 },
        {
            displayName: 'Read Cache',
        },
    );

    const nodes = [system, page, gateway, producer, consumer, store, cache];
    const edges = [
        createGraphEdge(page.id, system.id, 'depends_on'),
        createGraphEdge(page.id, gateway.id, 'calls'),
        createGraphEdge(gateway.id, producer.id, 'calls'),
        createGraphEdge(producer.id, store.id, 'writes'),
        createGraphEdge(producer.id, consumer.id, 'emits'),
        createGraphEdge(consumer.id, store.id, 'reads'),
        createGraphEdge(consumer.id, cache.id, 'writes'),
        createGraphEdge(page.id, cache.id, 'reads'),
    ];

    const ensuredNodes = ensureSystemNode(nodes);
    return {
        nodes: ensuredNodes,
        edges: ensureSystemEdges(ensuredNodes, edges),
    };
};

const buildAntiPatternPreset = (): {
    nodes: ArchitectureNode[];
    edges: GraphEdge[];
} => {
    const system = createPresetNode(
        'system',
        { x: 80, y: 60 },
        {
            displayName: 'Система',
        },
    );
    const page = createPresetNode(
        'ui_page',
        { x: 80, y: 180 },
        {
            displayName: 'Страница',
        },
    );
    const database = createPresetNode(
        'database',
        { x: 320, y: 180 },
        {
            displayName: 'Orders DB',
        },
    );
    const godService = createPresetNode(
        'service',
        { x: 560, y: 100 },
        {
            displayName: 'God Service',
            operationsCount: 15,
            externalCalls: 8,
        },
    );
    const db1 = createPresetNode(
        'database',
        { x: 800, y: 60 },
        {
            displayName: 'DB1',
        },
    );
    const db2 = createPresetNode(
        'database',
        { x: 800, y: 140 },
        {
            displayName: 'DB2',
        },
    );
    const cache = createPresetNode(
        'cache',
        { x: 800, y: 220 },
        {
            displayName: 'Cache',
        },
    );
    const orphan = createPresetNode(
        'service',
        { x: 320, y: 320 },
        {
            displayName: 'Orphan',
        },
    );
    const cycleA = createPresetNode(
        'service',
        { x: 560, y: 260 },
        {
            displayName: 'Service A',
        },
    );
    const cycleB = createPresetNode(
        'service',
        { x: 720, y: 260 },
        {
            displayName: 'Service B',
        },
    );
    const cycleC = createPresetNode(
        'service',
        { x: 640, y: 340 },
        {
            displayName: 'Service C',
        },
    );

    const nodes = [
        system,
        page,
        database,
        godService,
        db1,
        db2,
        cache,
        orphan,
        cycleA,
        cycleB,
        cycleC,
    ];
    const edges = [
        createGraphEdge(page.id, godService.id, 'calls'),
        createGraphEdge(godService.id, db1.id, 'reads'),
        createGraphEdge(godService.id, db1.id, 'writes'),
        createGraphEdge(godService.id, db2.id, 'reads'),
        createGraphEdge(godService.id, db2.id, 'writes'),
        createGraphEdge(godService.id, cache.id, 'reads'),
        createGraphEdge(godService.id, cache.id, 'writes'),
        createGraphEdge(godService.id, database.id, 'reads'),
        createGraphEdge(cycleA.id, cycleB.id, 'calls'),
        createGraphEdge(cycleB.id, cycleC.id, 'calls'),
        createGraphEdge(cycleC.id, cycleA.id, 'calls'),
    ];

    const ensuredNodes = ensureSystemNode(nodes);
    return {
        nodes: ensuredNodes,
        edges: ensureSystemEdges(ensuredNodes, edges),
    };
};

export const ARCHITECTURE_PRESETS: ArchitecturePreset[] = [
    {
        id: 'crud',
        label: 'CRUD',
        description: 'Классическая архитектура с API и БД.',
        build: buildCrudPreset,
    },
    {
        id: 'microservices',
        label: 'Микросервисы',
        description: 'Несколько сервисов и внешние зависимости.',
        build: buildMicroservicesPreset,
    },
    {
        id: 'event-driven',
        label: 'Событийная',
        description: 'Producer/Consumer с event-store.',
        build: buildEventDrivenPreset,
    },
    {
        id: 'anti-pattern',
        label: 'Антипаттерны',
        description:
            'Эталонная «плохая» архитектура: циклы, frontend→DB, god service, orphan.',
        build: buildAntiPatternPreset,
    },
];
