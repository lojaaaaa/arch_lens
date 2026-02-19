import type { ArchitectureGraphDto } from '../dto/architecture-graph.dto.js';
import type { AnalysisIssue } from '../interfaces/analysis-issue.interface.js';

export interface AiRecommendationProvider {
  getRecommendations(
    graph: ArchitectureGraphDto,
    issues: AnalysisIssue[],
  ): Promise<string[]>;
}
