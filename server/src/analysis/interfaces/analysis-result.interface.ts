import type { AnalysisIssue } from './analysis-issue.interface.js';

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface AnalysisMetrics {
  totalNodes: number;
  totalEdges: number;
  /** S3: density = |E| / (|V|*(|V|-1)) */
  density: number;
  /** S4: longest path в DAG (condensation) */
  depth: number;
  /** S5: Tarjan SCC с size > 1 */
  cycleCount: number;
  frontendComplexity: number;
  backendComplexity: number;
  criticalNodesCount: number;
  estimatedRenderPressure: number;
  apiEdgesCount: number;
  dataEdgesCount: number;
  /** V2-C2: счётчики по типам связей */
  callsCount: number;
  readsCount: number;
  writesCount: number;
  subscribesCount: number;
  emitsCount: number;
  dependsOnCount: number;
  stateStoreCount: number;
  maxFanOut: number;
  eventDrivenEdgesCount: number;
  /** C5: avgFanOut = Σ fanOut / |V| */
  avgFanOut: number;
  /** X2: godIndex(v) = fanOut(v) / avgFanOut */
  godIndexByNode: Record<string, number>;
  /** C5: instability(v) = fanOut/(fanIn+fanOut), доступна для узлов */
  instabilityByNode: Record<string, number>;
  /** fanOut по nodeId — для визуализации на графе */
  fanOutByNode: Record<string, number>;
}

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

export interface AnalysisResultDto {
  summary: {
    score: number;
    grade: Grade;
    riskScore: number;
    confidenceScore: number;
    issuesCount: number;
    criticalIssuesCount: number;
    /** Архитектурный стиль (информационно, не влияет на score) */
    architecturalStyle?: string;
  };
  scoreBreakdown: ScoreBreakdown;
  issueImpacts: IssueImpact[];
  metrics: AnalysisMetrics;
  issues: AnalysisIssue[];
  /** Рекомендации по best practices (не влияют на score, нельзя задать в модели) */
  bestPractices: string[];
  aiRecommendations: string[];
  generatedAt: string;
  modelVersion: string;
  rulesVersion: string;
}
