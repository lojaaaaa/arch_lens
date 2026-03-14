import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import type { AiRecommendationProvider } from './ai/index.js';
import type { ArchitectureGraphDto } from './dto/architecture-graph.dto.js';
import {
  SmellEngine,
  buildGraphContext,
  calculateConfidenceScore,
  calculateMetrics,
  calculateRiskScore,
  calculateScore,
  detectArchitectureStyle,
} from './engine/index.js';
import type { AnalysisResultDto } from './interfaces/index.js';
import {
  RULES_VERSION,
  smellStructuralRules,
  smellPerformanceRules,
  smellReliabilityRules,
} from './rules/index.js';
import { ValidationEngine } from './validation/index.js';

@Injectable()
export class AnalysisService {
  private readonly modelVersion = '1.0';
  private readonly smellEngine: SmellEngine;
  private readonly validationEngine = new ValidationEngine();

  constructor(
    @Inject('AiRecommendationProvider')
    private readonly aiProvider: AiRecommendationProvider,
  ) {
    this.smellEngine = new SmellEngine();
    this.smellEngine.registerStructuralRules(smellStructuralRules);
    this.smellEngine.registerPerformanceRules(smellPerformanceRules);
    this.smellEngine.registerReliabilityRules(smellReliabilityRules);
  }

  async analyze(graph: ArchitectureGraphDto): Promise<AnalysisResultDto> {
    const validation = this.validationEngine.run(graph);
    if (validation.errors.length > 0) {
      throw new BadRequestException({
        message: 'Model validation failed',
        validation,
      });
    }

    const graphToUse = validation.normalizedGraph ?? graph;
    const context = buildGraphContext(graphToUse);
    const issues = this.smellEngine.runAll(context);
    const metrics = calculateMetrics(context);
    const { score, grade } = calculateScore(issues, context, metrics);
    const riskScore = calculateRiskScore(metrics, context, issues);
    const confidenceScore = calculateConfidenceScore(graphToUse);
    const architecturalStyle = detectArchitectureStyle(context, metrics);

    const criticalCount = issues.filter(
      (issue) => issue.severity === 'critical',
    ).length;

    const aiRecommendations = await this.aiProvider.getRecommendations(
      graphToUse,
      issues,
    );

    return {
      summary: {
        score,
        grade,
        riskScore,
        confidenceScore,
        issuesCount: issues.length,
        criticalIssuesCount: criticalCount,
        architecturalStyle,
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
