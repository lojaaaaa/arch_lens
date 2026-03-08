import { ANALYSIS_CONFIG } from '../analysis.config.js';
import type { AnalysisIssue, GraphContext } from '../interfaces/index.js';

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface ScoreResult {
  score: number;
  grade: Grade;
  bonus: number;
  penalty: number;
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
    issues.some((i) => i.ruleId === 'S02') ||
    issues.some((i) => i.title.includes('Циклические зависимости'));
  if (!hasCycles) bonus += bonusNoCycles;

  const hasOrphans =
    issues.some((i) => i.ruleId === 'S01') ||
    issues.some((i) => i.title.includes('изолированные узлы'));
  const hasDisconnected =
    issues.some((i) => i.ruleId === 'S08') ||
    issues.some((i) => i.title.includes('Отключённый слой'));
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
 * Вычисляет score и grade.
 * Формула: score = clamp(0, 100, 100 - penalty + bonus).
 * Серьёзные ошибки (critical) влияют сильнее через повышенные штрафы.
 */
export function calculateScore(
  issues: AnalysisIssue[],
  ctx: GraphContext,
): ScoreResult {
  const penalty = computePenalty(issues);
  const bonus = computeBonus(issues, ctx);
  const maxScore = ANALYSIS_CONFIG.scoring.maxScore ?? 100;
  const score = Math.max(
    0,
    Math.min(maxScore, maxScore - penalty + bonus),
  );
  const grade = scoreToGrade(score);

  return { score, grade, bonus, penalty };
}
