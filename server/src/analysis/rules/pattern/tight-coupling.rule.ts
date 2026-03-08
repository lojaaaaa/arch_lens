import { randomUUID } from 'node:crypto';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class TightCouplingRule implements AnalysisRule {
  readonly id = 'P02';
  readonly description = 'Сильная связанность между узлами';

  check(ctx: GraphContext): AnalysisIssue[] {
    const pairCount = new Map<string, number>();
    for (const edge of ctx.edges) {
      const key = [edge.source, edge.target].sort().join('|');
      pairCount.set(key, (pairCount.get(key) ?? 0) + 1);
    }
    const issues: AnalysisIssue[] = [];
    for (const [key, count] of pairCount.entries()) {
      if (count >= 3) {
        const [nodeA, nodeB] = key.split('|');
        issues.push({
          id: randomUUID(),
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
