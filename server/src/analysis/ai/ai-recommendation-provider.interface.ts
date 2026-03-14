import type {
  AnalysisMetrics,
  ScoreBreakdown,
} from '../interfaces/analysis-result.interface.js';
import type { AnalysisIssue } from '../interfaces/analysis-issue.interface.js';

export interface AiAnalysisContext {
  score: number;
  grade: string;
  riskScore: number;
  confidenceScore: number;
  architecturalStyle?: string;
  scoreBreakdown: ScoreBreakdown;
  metrics: AnalysisMetrics;
  issues: AnalysisIssue[];
  bestPractices: string[];
  nodeKindCounts: Record<string, number>;
  edgeKindCounts: Record<string, number>;
}

export interface AiRecommendationProvider {
  getRecommendations(context: AiAnalysisContext): Promise<string[]>;
}
