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
            targetAvailability: 0.99,
            targetThroughputRps: 500,
            latencySloMs: 300,
            deploymentModel: 'monolith',
        },
    );
    const page = createPresetNode(
        'ui_page',
        { x: 80, y: 200 },
        {
            displayName: 'Список заказов',
            componentsCount: 5,
        },
    );
    const gateway = createPresetNode(
        'api_gateway',
        { x: 320, y: 200 },
        {
            displayName: 'API Gateway',
            requestRate: 200,
            endpointsCount: 8,
            capacityRps: 1000,
        },
    );
    const service = createPresetNode(
        'service',
        { x: 560, y: 200 },
        {
            displayName: 'Order Service',
            operationsCount: 6,
            externalCalls: 0,
            capacityRps: 500,
        },
    );
    const database = createPresetNode(
        'database',
        { x: 800, y: 140 },
        {
            displayName: 'Orders DB',
            readWriteRatio: 0.8,
            latencyMs: 5,
        },
    );
    const cache = createPresetNode(
        'cache',
        { x: 800, y: 260 },
        {
            displayName: 'Order Cache',
            hitRate: 0.85,
            latencyMs: 1,
        },
    );

    const nodes = [system, page, gateway, service, database, cache];
    const edges = [
        createGraphEdge(page.id, system.id, 'depends_on'),
        createGraphEdge(page.id, gateway.id, 'calls', { synchronous: false }),
        createGraphEdge(gateway.id, service.id, 'calls', { synchronous: true }),
        createGraphEdge(service.id, database.id, 'reads', {
            synchronous: true,
        }),
        createGraphEdge(service.id, database.id, 'writes', {
            synchronous: true,
        }),
        createGraphEdge(service.id, cache.id, 'reads', { synchronous: true }),
        createGraphEdge(service.id, cache.id, 'writes', { synchronous: true }),
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
            targetAvailability: 0.999,
            targetThroughputRps: 2000,
            latencySloMs: 200,
            deploymentModel: 'microservices',
        },
    );
    const page = createPresetNode(
        'ui_page',
        { x: 80, y: 210 },
        {
            displayName: 'Клиент',
            componentsCount: 8,
        },
    );
    const gateway = createPresetNode(
        'api_gateway',
        { x: 320, y: 210 },
        {
            displayName: 'Gateway',
            requestRate: 500,
            endpointsCount: 12,
            capacityRps: 3000,
        },
    );
    const authService = createPresetNode(
        'service',
        { x: 560, y: 120 },
        {
            displayName: 'Auth Service',
            operationsCount: 4,
            externalCalls: 0,
            capacityRps: 1000,
        },
    );
    const billingService = createPresetNode(
        'service',
        { x: 560, y: 300 },
        {
            displayName: 'Billing Service',
            operationsCount: 6,
            externalCalls: 2,
            capacityRps: 800,
        },
    );
    const authDb = createPresetNode(
        'database',
        { x: 820, y: 90 },
        {
            displayName: 'Auth DB',
            readWriteRatio: 0.9,
            latencyMs: 3,
        },
    );
    const billingDb = createPresetNode(
        'database',
        { x: 820, y: 330 },
        {
            displayName: 'Billing DB',
            readWriteRatio: 0.5,
            latencyMs: 5,
        },
    );
    const external = createPresetNode(
        'external_system',
        { x: 820, y: 210 },
        {
            displayName: 'Payment Provider',
            reliability: 0.97,
            latencyMs: 150,
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
        createGraphEdge(page.id, gateway.id, 'calls', { synchronous: false }),
        createGraphEdge(gateway.id, authService.id, 'calls', {
            synchronous: true,
        }),
        createGraphEdge(gateway.id, billingService.id, 'calls', {
            synchronous: true,
        }),
        createGraphEdge(authService.id, authDb.id, 'reads', {
            synchronous: true,
        }),
        createGraphEdge(authService.id, authDb.id, 'writes', {
            synchronous: true,
        }),
        createGraphEdge(billingService.id, billingDb.id, 'reads', {
            synchronous: true,
        }),
        createGraphEdge(billingService.id, billingDb.id, 'writes', {
            synchronous: true,
        }),
        createGraphEdge(billingService.id, external.id, 'calls', {
            synchronous: true,
        }),
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
            targetAvailability: 0.999,
            targetThroughputRps: 5000,
            latencySloMs: 500,
            deploymentModel: 'microservices',
        },
    );
    const page = createPresetNode(
        'ui_page',
        { x: 80, y: 210 },
        {
            displayName: 'Админ-панель',
            componentsCount: 6,
        },
    );
    const gateway = createPresetNode(
        'api_gateway',
        { x: 320, y: 210 },
        {
            displayName: 'Public API',
            requestRate: 1000,
            endpointsCount: 10,
            capacityRps: 5000,
        },
    );
    const producer = createPresetNode(
        'service',
        { x: 560, y: 120 },
        {
            displayName: 'Producer',
            operationsCount: 5,
            externalCalls: 0,
            capacityRps: 2000,
        },
    );
    const consumer = createPresetNode(
        'service',
        { x: 560, y: 300 },
        {
            displayName: 'Consumer',
            operationsCount: 3,
            externalCalls: 0,
            capacityRps: 3000,
        },
    );
    const store = createPresetNode(
        'database',
        { x: 820, y: 120 },
        {
            displayName: 'Event Store',
            readWriteRatio: 0.3,
            latencyMs: 4,
        },
    );
    const cache = createPresetNode(
        'cache',
        { x: 820, y: 300 },
        {
            displayName: 'Read Cache',
            hitRate: 0.92,
            latencyMs: 1,
        },
    );

    const nodes = [system, page, gateway, producer, consumer, store, cache];
    const edges = [
        createGraphEdge(page.id, system.id, 'depends_on'),
        createGraphEdge(page.id, gateway.id, 'calls', { synchronous: false }),
        createGraphEdge(gateway.id, producer.id, 'calls', {
            synchronous: true,
        }),
        createGraphEdge(gateway.id, consumer.id, 'calls', {
            synchronous: true,
        }),
        createGraphEdge(producer.id, store.id, 'writes', { synchronous: true }),
        createGraphEdge(producer.id, consumer.id, 'emits', {
            synchronous: false,
        }),
        createGraphEdge(consumer.id, store.id, 'reads', { synchronous: true }),
        createGraphEdge(consumer.id, cache.id, 'reads', { synchronous: true }),
        createGraphEdge(consumer.id, cache.id, 'writes', { synchronous: true }),
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
        createGraphEdge(page.id, godService.id, 'calls', {
            synchronous: false,
        }),
        createGraphEdge(godService.id, db1.id, 'reads', { synchronous: true }),
        createGraphEdge(godService.id, db1.id, 'writes', { synchronous: true }),
        createGraphEdge(godService.id, db2.id, 'reads', { synchronous: true }),
        createGraphEdge(godService.id, db2.id, 'writes', { synchronous: true }),
        createGraphEdge(godService.id, cache.id, 'reads', {
            synchronous: true,
        }),
        createGraphEdge(godService.id, cache.id, 'writes', {
            synchronous: true,
        }),
        createGraphEdge(godService.id, database.id, 'reads', {
            synchronous: true,
        }),
        createGraphEdge(cycleA.id, cycleB.id, 'calls', { synchronous: true }),
        createGraphEdge(cycleB.id, cycleC.id, 'calls', { synchronous: true }),
        createGraphEdge(cycleC.id, cycleA.id, 'calls', { synchronous: true }),
    ];

    const ensuredNodes = ensureSystemNode(nodes);
    return {
        nodes: ensuredNodes,
        edges: ensureSystemEdges(ensuredNodes, edges),
    };
};

const buildLayeredPreset = (): {
    nodes: ArchitectureNode[];
    edges: GraphEdge[];
} => {
    const system = createPresetNode(
        'system',
        { x: 80, y: 60 },
        {
            displayName: 'Трёхслойная система',
            targetAvailability: 0.99,
            targetThroughputRps: 1000,
            latencySloMs: 400,
            deploymentModel: 'monolith',
        },
    );
    const page = createPresetNode(
        'ui_page',
        { x: 80, y: 180 },
        {
            displayName: 'Главная страница',
            componentsCount: 6,
        },
    );
    const header = createPresetNode(
        'ui_component',
        { x: 80, y: 320 },
        {
            displayName: 'Header',
            propsCount: 4,
        },
    );
    const store = createPresetNode(
        'state_store',
        { x: 280, y: 320 },
        {
            displayName: 'App Store',
            subscribersCount: 3,
        },
    );
    const gateway = createPresetNode(
        'api_gateway',
        { x: 320, y: 180 },
        {
            displayName: 'BFF',
            requestRate: 300,
            endpointsCount: 10,
            capacityRps: 1500,
        },
    );
    const userService = createPresetNode(
        'service',
        { x: 560, y: 120 },
        {
            displayName: 'User Service',
            operationsCount: 5,
            externalCalls: 0,
            capacityRps: 800,
        },
    );
    const contentService = createPresetNode(
        'service',
        { x: 560, y: 260 },
        {
            displayName: 'Content Service',
            operationsCount: 7,
            externalCalls: 0,
            capacityRps: 600,
        },
    );
    const userDb = createPresetNode(
        'database',
        { x: 800, y: 120 },
        {
            displayName: 'Users DB',
            readWriteRatio: 0.85,
            latencyMs: 4,
        },
    );
    const contentDb = createPresetNode(
        'database',
        { x: 800, y: 260 },
        {
            displayName: 'Content DB',
            readWriteRatio: 0.9,
            latencyMs: 5,
        },
    );
    const cache = createPresetNode(
        'cache',
        { x: 800, y: 390 },
        {
            displayName: 'Redis',
            hitRate: 0.88,
            latencyMs: 1,
        },
    );

    const nodes = [
        system,
        page,
        header,
        store,
        gateway,
        userService,
        contentService,
        userDb,
        contentDb,
        cache,
    ];
    const edges = [
        createGraphEdge(page.id, system.id, 'depends_on'),
        createGraphEdge(page.id, header.id, 'depends_on'),
        createGraphEdge(page.id, store.id, 'reads'),
        createGraphEdge(page.id, gateway.id, 'calls', { synchronous: false }),
        createGraphEdge(header.id, store.id, 'reads'),
        createGraphEdge(gateway.id, userService.id, 'calls', {
            synchronous: true,
        }),
        createGraphEdge(gateway.id, contentService.id, 'calls', {
            synchronous: true,
        }),
        createGraphEdge(userService.id, userDb.id, 'reads', {
            synchronous: true,
        }),
        createGraphEdge(userService.id, userDb.id, 'writes', {
            synchronous: true,
        }),
        createGraphEdge(contentService.id, contentDb.id, 'reads', {
            synchronous: true,
        }),
        createGraphEdge(contentService.id, contentDb.id, 'writes', {
            synchronous: true,
        }),
        createGraphEdge(contentService.id, cache.id, 'reads', {
            synchronous: true,
        }),
        createGraphEdge(contentService.id, cache.id, 'writes', {
            synchronous: true,
        }),
    ];

    const ensuredNodes = ensureSystemNode(nodes);
    return {
        nodes: ensuredNodes,
        edges: ensureSystemEdges(ensuredNodes, edges),
    };
};

const buildMessageQueuePreset = (): {
    nodes: ArchitectureNode[];
    edges: GraphEdge[];
} => {
    const system = createPresetNode(
        'system',
        { x: 80, y: 60 },
        {
            displayName: 'Система с очередями',
            targetAvailability: 0.999,
            targetThroughputRps: 3000,
            latencySloMs: 1000,
            deploymentModel: 'microservices',
        },
    );
    const page = createPresetNode(
        'ui_page',
        { x: 80, y: 200 },
        {
            displayName: 'Заявки',
            componentsCount: 4,
        },
    );
    const gateway = createPresetNode(
        'api_gateway',
        { x: 300, y: 200 },
        {
            displayName: 'API Gateway',
            requestRate: 800,
            endpointsCount: 6,
            capacityRps: 5000,
        },
    );
    const orderService = createPresetNode(
        'service',
        { x: 530, y: 120 },
        {
            displayName: 'Order Service',
            operationsCount: 5,
            externalCalls: 0,
            capacityRps: 1500,
        },
    );
    const notificationService = createPresetNode(
        'service',
        { x: 530, y: 290 },
        {
            displayName: 'Notification Service',
            operationsCount: 3,
            externalCalls: 1,
            capacityRps: 2000,
        },
    );
    const orderDb = createPresetNode(
        'database',
        { x: 780, y: 60 },
        {
            displayName: 'Orders DB',
            readWriteRatio: 0.6,
            latencyMs: 5,
        },
    );
    const emailProvider = createPresetNode(
        'external_system',
        { x: 780, y: 230 },
        {
            displayName: 'Email Provider',
            reliability: 0.98,
            latencyMs: 200,
        },
    );
    const smsProvider = createPresetNode(
        'external_system',
        { x: 780, y: 350 },
        {
            displayName: 'SMS Provider',
            reliability: 0.95,
            latencyMs: 300,
        },
    );

    const nodes = [
        system,
        page,
        gateway,
        orderService,
        notificationService,
        orderDb,
        emailProvider,
        smsProvider,
    ];
    const edges = [
        createGraphEdge(page.id, system.id, 'depends_on'),
        createGraphEdge(page.id, gateway.id, 'calls', { synchronous: false }),
        createGraphEdge(gateway.id, orderService.id, 'calls', {
            synchronous: true,
        }),
        createGraphEdge(orderService.id, orderDb.id, 'reads', {
            synchronous: true,
        }),
        createGraphEdge(orderService.id, orderDb.id, 'writes', {
            synchronous: true,
        }),
        createGraphEdge(orderService.id, notificationService.id, 'emits', {
            synchronous: false,
        }),
        createGraphEdge(notificationService.id, emailProvider.id, 'calls', {
            synchronous: true,
        }),
        createGraphEdge(notificationService.id, smsProvider.id, 'calls', {
            synchronous: true,
        }),
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
        id: 'layered',
        label: 'Трёхслойная',
        description:
            'Классическая трёхслойная архитектура с BFF, компонентами и стором.',
        build: buildLayeredPreset,
    },
    {
        id: 'message-queue',
        label: 'С очередями',
        description:
            'Асинхронная обработка через emit: Order → Notification с внешними провайдерами.',
        build: buildMessageQueuePreset,
    },
    {
        id: 'anti-pattern',
        label: 'Антипаттерны',
        description:
            'Эталонная «плохая» архитектура: циклы, frontend→DB, god service, orphan.',
        build: buildAntiPatternPreset,
    },
];
