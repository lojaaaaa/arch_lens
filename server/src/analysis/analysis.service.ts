import { Injectable } from '@nestjs/common';

import type { ArchitectureGraphDto } from './dto/architecture-graph.dto.js';
import {
  RuleEngine,
  buildGraphContext,
  calculateMetrics,
  calculateScore,
} from './engine/index.js';
import type { AnalysisResultDto } from './interfaces/index.js';
import { allRules } from './rules/index.js';

@Injectable()
export class AnalysisService {
  private readonly modelVersion = '1.0';
  private readonly engine: RuleEngine;

  constructor() {
    this.engine = new RuleEngine();
    this.engine.registerAll(allRules);
  }

  analyze(graph: ArchitectureGraphDto): AnalysisResultDto {
    const context = buildGraphContext(graph);
    const issues = this.engine.run(context);
    const metrics = calculateMetrics(context);
    const { score, grade } = calculateScore(issues, context);

    const criticalCount = issues.filter(
      (i) => i.severity === 'critical',
    ).length;

    return {
      summary: {
        score,
        grade,
        issuesCount: issues.length,
        criticalIssuesCount: criticalCount,
      },
      metrics,
      issues,
      generatedAt: new Date().toISOString(),
      modelVersion: this.modelVersion,
    };
  }
}
