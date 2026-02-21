import { Inject, Injectable } from '@nestjs/common';

import type { AiRecommendationProvider } from './ai/index.js';
import type { ArchitectureGraphDto } from './dto/architecture-graph.dto.js';
import {
  RuleEngine,
  buildGraphContext,
  calculateMetrics,
  calculateScore,
} from './engine/index.js';
import type { AnalysisResultDto } from './interfaces/index.js';
import { allRules, RULES_VERSION } from './rules/index.js';

@Injectable()
export class AnalysisService {
  private readonly modelVersion = '1.0';
  private readonly engine: RuleEngine;

  constructor(
    @Inject('AiRecommendationProvider')
    private readonly aiProvider: AiRecommendationProvider,
  ) {
    this.engine = new RuleEngine();
    this.engine.registerAll(allRules);
  }

  async analyze(graph: ArchitectureGraphDto): Promise<AnalysisResultDto> {
    const context = buildGraphContext(graph);
    const issues = this.engine.run(context);
    const metrics = calculateMetrics(context);
    const { score, grade } = calculateScore(issues, context);

    const criticalCount = issues.filter(
      (i) => i.severity === 'critical',
    ).length;

    const aiRecommendations = await this.aiProvider.getRecommendations(
      graph,
      issues,
    );

    return {
      summary: {
        score,
        grade,
        issuesCount: issues.length,
        criticalIssuesCount: criticalCount,
      },
      metrics,
      issues,
      aiRecommendations,
      generatedAt: new Date().toISOString(),
      modelVersion: this.modelVersion,
      rulesVersion: RULES_VERSION,
    };
  }
}
