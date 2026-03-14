import { z } from 'zod';

const issueSeveritySchema = z.enum(['info', 'warning', 'critical']);

const issueCategorySchema = z.enum([
    'performance',
    'scalability',
    'maintainability',
    'architecture',
    'reliability',
    'security',
]);

const architectureIssueSchema = z.object({
    id: z.string(),
    ruleId: z.string().optional(),
    severity: issueSeveritySchema,
    category: issueCategorySchema,
    title: z.string(),
    description: z.string(),
    affectedNodes: z.array(z.string()),
    affectedEdges: z.array(z.string()).optional(),
    recommendation: z.string().optional(),
    metrics: z.record(z.string(), z.number()).optional(),
});

const architectureMetricsSchema = z.object({
    totalNodes: z.number(),
    totalEdges: z.number(),
    density: z.number().optional().default(0),
    depth: z.number().optional().default(0),
    cycleCount: z.number().optional().default(0),
    frontendComplexity: z.number(),
    backendComplexity: z.number(),
    criticalNodesCount: z.number(),
    estimatedRenderPressure: z.number(),
    estimatedApiLoad: z.number(),
    estimatedDataLoad: z.number(),
    callsCount: z.number().optional().default(0),
    readsCount: z.number().optional().default(0),
    writesCount: z.number().optional().default(0),
    subscribesCount: z.number().optional().default(0),
    emitsCount: z.number().optional().default(0),
    dependsOnCount: z.number().optional().default(0),
    stateStoreCount: z.number().optional().default(0),
    maxFanOut: z.number().optional().default(0),
    eventDrivenEdgesCount: z.number().optional().default(0),
    avgFanOut: z.number().optional().default(0),
    godIndexByNode: z.record(z.string(), z.number()).optional().default({}),
    instabilityByNode: z.record(z.string(), z.number()).optional().default({}),
    fanOutByNode: z.record(z.string(), z.number()).optional().default({}),
});

const gradeSchema = z.enum(['A', 'B', 'C', 'D', 'F']);

export const analysisResultSchema = z.object({
    summary: z.object({
        score: z.number(),
        grade: gradeSchema,
        riskScore: z.number().optional().default(0),
        confidenceScore: z.number().optional().default(1),
        issuesCount: z.number(),
        criticalIssuesCount: z.number(),
        architecturalStyle: z.string().optional(),
    }),
    metrics: architectureMetricsSchema,
    issues: z.array(architectureIssueSchema),
    aiRecommendations: z.array(z.string()).default([]),
    generatedAt: z.string(),
    modelVersion: z.string(),
    rulesVersion: z.string(),
});
