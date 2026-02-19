import type { AnalysisIssue } from './analysis-issue.interface.js';

export interface AnalysisMetrics {
  totalNodes: number;
  totalEdges: number;
  frontendComplexity: number;
  backendComplexity: number;
  criticalNodesCount: number;
  estimatedRenderPressure: number;
  estimatedApiLoad: number;
  estimatedDataLoad: number;
}

export interface AnalysisResultDto {
  summary: {
    score: number;
    issuesCount: number;
    criticalIssuesCount: number;
  };
  metrics: AnalysisMetrics;
  issues: AnalysisIssue[];
  generatedAt: string;
  modelVersion: string;
}
