import type { AiRecommendationProvider } from './ai-recommendation-provider.interface.js';
import type { ArchitectureGraphDto } from '../dto/architecture-graph.dto.js';
import type { AnalysisIssue } from '../interfaces/analysis-issue.interface.js';

export class AiRecommendationStubProvider implements AiRecommendationProvider {
  /* eslint-disable @typescript-eslint/no-unused-vars -- stub implements interface but ignores args */
  getRecommendations(
    _graph: ArchitectureGraphDto,
    _issues: AnalysisIssue[],
  ): Promise<string[]> {
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return Promise.resolve([]);
  }
}
