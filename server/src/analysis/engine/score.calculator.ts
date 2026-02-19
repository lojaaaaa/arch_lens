import { ANALYSIS_CONFIG } from '../analysis.config.js';
import type { AnalysisIssue } from '../interfaces/index.js';

export function calculateScore(issues: AnalysisIssue[]): number {
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

  return Math.max(0, Math.min(100, 100 - penalty));
}
