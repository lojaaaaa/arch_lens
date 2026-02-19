import { ANALYSIS_CONFIG } from '../analysis.config.js';
import type { AnalysisIssue, GraphContext } from '../interfaces/index.js';

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface ScoreResult {
  score: number;
  grade: Grade;
  bonus: number;
  penalty: number;
}

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

  const hasCycles = issues.some((i) => i.title.includes('Циклические зависимости'));
  if (!hasCycles) bonus += bonusNoCycles;

  const hasOrphans = issues.some((i) => i.title.includes('изолированные узлы'));
  const hasDisconnected = issues.some((i) => i.title.includes('Отключённый слой'));
  if (!hasOrphans && !hasDisconnected) bonus += bonusAllConnected;

  return bonus;
}

function scoreToGrade(score: number): Grade {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export function calculateScore(
  issues: AnalysisIssue[],
  ctx: GraphContext,
): ScoreResult {
  const penalty = computePenalty(issues);
  const bonus = computeBonus(issues, ctx);
  const score = Math.max(0, Math.min(100, 100 - penalty + bonus));
  const grade = scoreToGrade(score);

  return { score, grade, bonus, penalty };
}
