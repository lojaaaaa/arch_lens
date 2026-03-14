import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import type {
  AiAnalysisContext,
  AiRecommendationProvider,
} from './ai/index.js';
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
import { ANALYSIS_CONFIG } from './analysis.config.js';
import type {
  AnalysisResultDto,
  GraphContext,
  IssueImpact,
  ScoreBreakdown,
} from './interfaces/index.js';
import type { AnalysisIssue } from './interfaces/analysis-issue.interface.js';
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
    const { score, grade, penalty, metricsPenalty, bonus } = calculateScore(
      issues,
      context,
      metrics,
    );
    const riskScore = calculateRiskScore(metrics, context, issues);
    const confidenceScore = calculateConfidenceScore(graphToUse);
    const architecturalStyle = detectArchitectureStyle(context, metrics);

    const criticalCount = issues.filter(
      (issue) => issue.severity === 'critical',
    ).length;

    const bestPractices = this.generateBestPractices(context);

    const scoreBreakdown: ScoreBreakdown = {
      maxScore: ANALYSIS_CONFIG.scoring.maxScore,
      penalty,
      metricsPenalty: Math.round(metricsPenalty * 10) / 10,
      bonus,
      final: score,
    };

    const nodeKindCounts: Record<string, number> = {};
    for (const node of graphToUse.nodes) {
      nodeKindCounts[node.kind] = (nodeKindCounts[node.kind] ?? 0) + 1;
    }
    const edgeKindCounts: Record<string, number> = {};
    for (const edge of graphToUse.edges) {
      edgeKindCounts[edge.kind] = (edgeKindCounts[edge.kind] ?? 0) + 1;
    }

    const aiContext: AiAnalysisContext = {
      score,
      grade,
      riskScore,
      confidenceScore,
      architecturalStyle,
      scoreBreakdown,
      metrics,
      issues,
      bestPractices,
      nodeKindCounts,
      edgeKindCounts,
    };

    const aiRecommendations =
      await this.aiProvider.getRecommendations(aiContext);

    const issueImpacts = this.computeIssueImpacts(issues, score);

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
      scoreBreakdown,
      issueImpacts,
      metrics,
      issues,
      bestPractices,
      aiRecommendations,
      generatedAt: new Date().toISOString(),
      modelVersion: this.modelVersion,
      rulesVersion: RULES_VERSION,
    };
  }

  private computeIssueImpacts(
    issues: AnalysisIssue[],
    currentScore: number,
  ): IssueImpact[] {
    const { penaltyInfo, penaltyWarning, penaltyCritical, maxScore } =
      ANALYSIS_CONFIG.scoring;

    const severityPenalty: Record<string, number> = {
      info: penaltyInfo,
      warning: penaltyWarning,
      critical: penaltyCritical,
    };

    return issues.map((issue) => {
      const pts = severityPenalty[issue.severity] ?? 0;
      const potentialScore = Math.min(maxScore, currentScore + pts);
      return {
        issueId: issue.id,
        ruleId: issue.ruleId ?? '',
        title: issue.title,
        severity: issue.severity,
        penaltyPoints: pts,
        potentialGain: potentialScore - currentScore,
      };
    });
  }

  private generateBestPractices(ctx: GraphContext): string[] {
    const tips: string[] = [];

    const gatewayIds = new Set(
      (ctx.nodesByKind.get('api_gateway') ?? []).map((n) => n.id),
    );
    const frontendCallsApi = ctx.edges.some(
      (e) =>
        e.kind === 'calls' &&
        gatewayIds.has(e.target) &&
        ctx.nodeById.get(e.source)?.layer === 'frontend',
    );
    if (frontendCallsApi) {
      tips.push(
        'Фронтенд вызывает API Gateway — убедитесь в наличии error boundary, retry-логики и обработки ошибок на стороне клиента.',
      );
    }

    const hasExternals =
      (ctx.nodesByKind.get('external_system') ?? []).length > 0;
    if (hasExternals) {
      tips.push(
        'Архитектура зависит от внешних систем — рекомендуется предусмотреть fallback, circuit breaker и таймауты для каждой внешней зависимости.',
      );
    }

    const statefulServices = (ctx.nodesByKind.get('service') ?? []).filter(
      (n) => n['stateful'] === true,
    );
    if (statefulServices.length > 0) {
      tips.push(
        `Обнаружено ${statefulServices.length} stateful-сервис(ов) — рассмотрите стратегию персистентности состояния и горизонтального масштабирования.`,
      );
    }

    return tips;
  }
}
