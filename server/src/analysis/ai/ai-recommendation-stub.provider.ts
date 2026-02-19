import type { AiRecommendationProvider } from './ai-recommendation-provider.interface.js';
import type { ArchitectureGraphDto } from '../dto/architecture-graph.dto.js';
import type { AnalysisIssue } from '../interfaces/analysis-issue.interface.js';

export class AiRecommendationStubProvider implements AiRecommendationProvider {
  async getRecommendations(
    _graph: ArchitectureGraphDto,
    _issues: AnalysisIssue[],
  ): Promise<string[]> {
    return [];
  }
}
