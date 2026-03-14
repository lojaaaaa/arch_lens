import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class TightCouplingRule implements AnalysisRule {
  readonly id = 'P02';
  readonly description = 'Сильная связанность между узлами';

  check(ctx: GraphContext): AnalysisIssue[] {
    const threshold = ANALYSIS_CONFIG.pattern.tightCouplingEdgeThreshold;
    const pairCount = new Map<string, number>();
    for (const edge of ctx.edges) {
      const key = [edge.source, edge.target].sort().join('|');
      pairCount.set(key, (pairCount.get(key) ?? 0) + 1);
    }
    const issues: AnalysisIssue[] = [];
    for (const [key, count] of pairCount.entries()) {
      if (count >= threshold) {
        const [nodeA, nodeB] = key.split('|');
        issues.push({
          id: randomUUID(),
          ruleId: this.id,
          severity: 'warning',
          category: 'maintainability',
          title: 'Сильная связанность между узлами',
          description: `Узлы "${nodeA}" и "${nodeB}" связаны ${count} рёбрами — высокая степень связанности.`,
          affectedNodes: [nodeA, nodeB],
          recommendation:
            'Рассмотрите введение промежуточного слоя или уменьшение связей.',
          metrics: { edgeCount: count },
        });
      }
    }
    return issues;
  }
}
