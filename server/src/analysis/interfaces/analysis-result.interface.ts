import type { AnalysisIssue } from './analysis-issue.interface.js';

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface AnalysisMetrics {
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

export interface AnalysisResultDto {
  summary: {
    score: number;
    grade: Grade;
    issuesCount: number;
    criticalIssuesCount: number;
  };
  metrics: AnalysisMetrics;
  issues: AnalysisIssue[];
  aiRecommendations: string[];
  generatedAt: string;
  modelVersion: string;
  rulesVersion: string;
}
