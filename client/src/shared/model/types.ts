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

export type DeploymentModel = 'monolith' | 'microservices' | 'hybrid';

export interface SystemNode extends FrontendNodeBase {
    kind: 'system';

    pagesCount: number;
    description?: string;

    targetAvailability?: number;
    targetThroughputRps?: number;
    latencySloMs?: number;
    deploymentModel?: DeploymentModel;
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

    /** Опционально: задержка (мс). Critical Path. */
    latencyMs?: number;
    /** Опционально: доступность 0–1 (99.9% = 0.999). */
    availability?: number;
    /** Опционально: пропускная способность (rps). */
    capacityRps?: number;
}

export interface ServiceNode extends BaseNode {
    kind: 'service';

    operationsCount: number;
    externalCalls: number;
    stateful: boolean;

    latencyMs?: number;
    capacityRps?: number;
}

export interface DatabaseNode extends BaseNode {
    kind: 'database';

    dbType: 'SQL' | 'NoSQL';
    tablesCount: number;
    readWriteRatio: number;

    latencyMs?: number;
    availability?: number;
}

export interface CacheNode extends DataNodeBase {
    kind: 'cache';

    cacheType: 'redis' | 'memory';
    hitRate: number;

    latencyMs?: number;
    capacityRps?: number;
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
    density?: number;
    depth?: number;
    cycleCount?: number;
    frontendComplexity: number;
    backendComplexity: number;

    criticalNodesCount: number;

    estimatedRenderPressure: number;
    apiEdgesCount: number;
    dataEdgesCount: number;

    callsCount?: number;
    readsCount?: number;
    writesCount?: number;
    subscribesCount?: number;
    emitsCount?: number;
    dependsOnCount?: number;
    stateStoreCount: number;
    maxFanOut: number;
    eventDrivenEdgesCount: number;
    avgFanOut?: number;
    godIndexByNode?: Record<string, number>;
    instabilityByNode?: Record<string, number>;
    fanOutByNode?: Record<string, number>;
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface ScoreBreakdown {
    maxScore: number;
    penalty: number;
    metricsPenalty: number;
    bonus: number;
    final: number;
}

export interface IssueImpact {
    issueId: string;
    ruleId: string;
    title: string;
    severity: string;
    penaltyPoints: number;
    potentialGain: number;
}

export interface AnalysisResult {
    summary: {
        score: number;
        grade: Grade;
        riskScore?: number;
        confidenceScore?: number;
        issuesCount: number;
        criticalIssuesCount: number;
        architecturalStyle?: string;
    };

    scoreBreakdown?: ScoreBreakdown;
    issueImpacts?: IssueImpact[];

    metrics: ArchitectureMetrics;

    issues: ArchitectureIssue[];
    bestPractices: string[];
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
