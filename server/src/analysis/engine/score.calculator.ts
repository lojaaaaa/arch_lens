import { ANALYSIS_CONFIG } from '../analysis.config.js';
import type {
  AnalysisIssue,
  AnalysisMetrics,
  GraphContext,
} from '../interfaces/index.js';

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface ScoreResult {
  score: number;
  grade: Grade;
  bonus: number;
  penalty: number;
  metricsPenalty: number;
}

/**
 * Штрафы за issues. Critical влияет сильнее (≈3× warning).
 * Формула: penalty = Σ(penaltyInfo|Warning|Critical по severity каждого issue).
 */
function computePenalty(issues: AnalysisIssue[]): number {
  const { penaltyInfo, penaltyWarning, penaltyCritical } =
    ANALYSIS_CONFIG.scoring;

  let penalty = 0;

  for (const issue of issues) {
    switch (issue.severity) {
      case 'info':
        penalty += penaltyInfo;
        break;
      case 'warning':
        penalty += penaltyWarning;
        break;
      case 'critical':
        penalty += penaltyCritical;
        break;
    }
  }

  return penalty;
}

/**
 * Бонусы за хорошие практики. Проверка по ruleId (надёжнее подстрок в title).
 * Формула: score = max(0, min(100, 100 - penalty + bonus)).
 */
function computeBonus(issues: AnalysisIssue[], ctx: GraphContext): number {
  const {
    bonusCachePresent,
    bonusGatewayPresent,
    bonusNoCycles,
    bonusAllConnected,
  } = ANALYSIS_CONFIG.scoring;

  let bonus = 0;

  const hasCacheNodes = (ctx.nodesByKind.get('cache') ?? []).length > 0;
  if (hasCacheNodes) bonus += bonusCachePresent;

  const hasGateway = (ctx.nodesByKind.get('api_gateway') ?? []).length > 0;
  if (hasGateway) bonus += bonusGatewayPresent;

  const hasCycles =
    issues.some((issue) => issue.ruleId === 'S02') ||
    issues.some((issue) => issue.title.includes('Циклические зависимости'));
  if (!hasCycles) bonus += bonusNoCycles;

  const hasOrphans =
    issues.some((issue) => issue.ruleId === 'S01') ||
    issues.some((issue) => issue.title.includes('изолированные узлы'));
  const hasDisconnected =
    issues.some((issue) => issue.ruleId === 'S08') ||
    issues.some((issue) => issue.title.includes('Отключённый слой'));
  if (!hasOrphans && !hasDisconnected) bonus += bonusAllConnected;

  return bonus;
}

/** A≥90, B≥75, C≥60, D≥40, F<40 */
function scoreToGrade(score: number): Grade {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

/**
 * Штраф за плохие метрики. Свойства узлов и структурные метрики влияют на оценку.
 * Формула: за каждое превышение порога — доля от maxScore (metricsWeight).
 */
function computeMetricsPenalty(metrics: AnalysisMetrics): number {
  const maxScore = ANALYSIS_CONFIG.scoring.maxScore ?? 100;
  const weight =
    (ANALYSIS_CONFIG.scoring as { metricsWeight?: number }).metricsWeight ??
    0.35;
  const thresholds =
    (
      ANALYSIS_CONFIG.scoring as {
        metricsThresholds?: Record<string, number>;
      }
    ).metricsThresholds ?? {};

  const t = thresholds;
  let penalty = 0;
  const maxPenalty = maxScore * weight;

  if ((metrics.frontendComplexity ?? 0) > (t.frontendComplexity ?? 15)) {
    const excess = metrics.frontendComplexity - (t.frontendComplexity ?? 15);
    penalty += Math.min(excess * 2, maxPenalty * 0.2);
  }
  if ((metrics.backendComplexity ?? 0) > (t.backendComplexity ?? 20)) {
    const excess = metrics.backendComplexity - (t.backendComplexity ?? 20);
    penalty += Math.min(excess * 1.5, maxPenalty * 0.2);
  }
  if ((metrics.depth ?? 0) > (t.depth ?? 5)) {
    const excess = metrics.depth - (t.depth ?? 5);
    penalty += Math.min(excess * 3, maxPenalty * 0.15);
  }
  if ((metrics.maxFanOut ?? 0) > (t.maxFanOut ?? 6)) {
    const excess = metrics.maxFanOut - (t.maxFanOut ?? 6);
    penalty += Math.min(excess * 2, maxPenalty * 0.15);
  }
  if ((metrics.cycleCount ?? 0) > (t.cycleCount ?? 0)) {
    penalty += Math.min(metrics.cycleCount * 8, maxPenalty * 0.2);
  }
  if ((metrics.criticalNodesCount ?? 0) > (t.criticalNodesCount ?? 2)) {
    const excess = metrics.criticalNodesCount - (t.criticalNodesCount ?? 2);
    penalty += Math.min(excess * 4, maxPenalty * 0.1);
  }
  if ((metrics.estimatedRenderPressure ?? 0) > (t.renderPressure ?? 15)) {
    const excess = metrics.estimatedRenderPressure - (t.renderPressure ?? 15);
    penalty += Math.min(excess * 0.5, maxPenalty * 0.1);
  }

  return Math.min(penalty, maxPenalty);
}

/**
 * Вычисляет score и grade.
 * Формула: score = clamp(0, 100, 100 - penalty - metricsPenalty + bonus).
 * Issues и метрики (сложность, глубина, coupling и т.д.) влияют на оценку.
 */
export function calculateScore(
  issues: AnalysisIssue[],
  ctx: GraphContext,
  metrics: AnalysisMetrics,
): ScoreResult {
  const penalty = computePenalty(issues);
  const bonus = computeBonus(issues, ctx);
  const metricsPenalty = computeMetricsPenalty(metrics);
  const maxScore = ANALYSIS_CONFIG.scoring.maxScore ?? 100;
  const score = Math.max(
    0,
    Math.min(maxScore, maxScore - penalty - metricsPenalty + bonus),
  );
  const grade = scoreToGrade(score);

  return { score, grade, bonus, penalty, metricsPenalty };
}
