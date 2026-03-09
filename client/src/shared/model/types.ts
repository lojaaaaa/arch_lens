export type TypeOrNull<T> = T | null;

export type LayerType = 'frontend' | 'backend' | 'data';

export type NodeKind =
    | 'ui_page'
    | 'ui_component'
    | 'state_store'
    | 'system'
    | 'api_gateway'
    | 'service'
    | 'database'
    | 'cache'
    | 'external_system';

export type EdgeKind =
    | 'calls'
    | 'reads'
    | 'writes'
    | 'subscribes'
    | 'depends_on'
    | 'emits';

export interface BaseNode {
    id: string;
    kind: NodeKind;
    layer: LayerType;
    displayName?: string;

    position: { x: number; y: number };

    complexity: number;
    criticality: number;
}

export interface FrontendNodeBase extends BaseNode {
    layer: 'frontend';
}

export interface BackendNodeBase extends BaseNode {
    layer: 'backend';
}

export interface DataNodeBase extends BaseNode {
    layer: 'data';
}

export interface UIPageNode extends FrontendNodeBase {
    kind: 'ui_page';

    route: string;
    componentsCount: number;
    stateUsage: 'none' | 'local' | 'global';
    updateFrequency: number;
}

export interface SystemNode extends FrontendNodeBase {
    kind: 'system';

    pagesCount: number;
    description?: string;
}

export interface UIComponentNode extends FrontendNodeBase {
    kind: 'ui_component';

    componentType: 'input' | 'table' | 'button' | 'custom';
    nestedComponents: number;
    propsCount: number;
    stateType: 'none' | 'local' | 'context' | 'global';
    renderFrequency: number;
}

export interface StateStoreNode extends FrontendNodeBase {
    kind: 'state_store';

    storeType:
        | 'redux'
        | 'zustand'
        | 'context'
        | 'local_storage'
        | 'session_storage';

    subscribersCount: number;
    updateFrequency: number;
}

export interface APIGatewayNode extends BackendNodeBase {
    kind: 'api_gateway';

    endpointsCount: number;
    requestRate: number;
    authRequired: boolean;
}

export interface ServiceNode extends BaseNode {
    kind: 'service';

    operationsCount: number;
    externalCalls: number;
    stateful: boolean;
}

export interface DatabaseNode extends BaseNode {
    kind: 'database';

    dbType: 'SQL' | 'NoSQL';
    tablesCount: number;
    readWriteRatio: number;
}

export interface CacheNode extends DataNodeBase {
    kind: 'cache';

    cacheType: 'redis' | 'memory';
    hitRate: number;
}

export interface ExternalSystemNode extends DataNodeBase {
    kind: 'external_system';

    systemType:
        | 'auth'
        | 'payment'
        | 'analytics'
        | 'storage'
        | 'notification'
        | 'other';

    protocol: 'REST' | 'GraphQL' | 'SOAP' | 'gRPC';

    reliability: number; // 0..1 (SLA)
    latencyMs: number;

    rateLimit?: number;
}

export type ArchitectureNode =
    | UIPageNode
    | SystemNode
    | UIComponentNode
    | StateStoreNode
    | APIGatewayNode
    | ServiceNode
    | DatabaseNode
    | CacheNode
    | ExternalSystemNode;

export interface ArchitectureNodeData extends Record<string, unknown> {
    node: ArchitectureNode;
    label: string;
}
export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    kind: EdgeKind;

    frequency?: number;
    synchronous?: boolean;
}

export interface ArchitectureGraph {
    meta: {
        name: string;
        version: number;
        createdAt: string;
    };
    nodes: ArchitectureNode[];
    edges: GraphEdge[];
}

export type IssueSeverity = 'info' | 'warning' | 'critical';

export type IssueCategory =
    | 'performance'
    | 'scalability'
    | 'maintainability'
    | 'architecture'
    | 'reliability'
    | 'security';

export interface ArchitectureIssue {
    id: string;
    ruleId?: string;

    severity: IssueSeverity;
    category: IssueCategory;

    title: string;
    description: string;

    affectedNodes: string[]; // node ids
    affectedEdges?: string[];

    recommendation?: string;

    metrics?: Record<string, number>;
}

export interface ArchitectureMetrics {
    totalNodes: number;
    totalEdges: number;

    frontendComplexity: number;
    backendComplexity: number;

    criticalNodesCount: number;

    estimatedRenderPressure: number;
    estimatedApiLoad: number;
    estimatedDataLoad: number;

    stateStoreCount: number;
    maxFanOut: number;
    eventDrivenEdgesCount: number;
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface AnalysisResult {
    summary: {
        score: number; // 0..100
        grade: Grade;
        issuesCount: number;
        criticalIssuesCount: number;
    };

    metrics: ArchitectureMetrics;

    issues: ArchitectureIssue[];
    aiRecommendations: string[];

    generatedAt: string;
    modelVersion: string;
    rulesVersion: string;
}

export interface AnalysisRule {
    id: string;
    description: string;

    appliesTo: NodeKind | 'graph';

    check(graph: ArchitectureGraph): TypeOrNull<ArchitectureIssue[]>;
}
