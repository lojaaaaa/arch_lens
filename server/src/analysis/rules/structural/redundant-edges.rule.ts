import { randomUUID } from 'node:crypto';
import type { AnalysisIssue, AnalysisRule, GraphContext } from '../../interfaces/index.js';

export class RedundantEdgesRule implements AnalysisRule {
  readonly id = 'S10';
  readonly description =
    'Дублирующиеся рёбра между одними и теми же узлами — избыточность';

  check(ctx: GraphContext): AnalysisIssue[] {
    const pairToEdges = new Map<string, { edges: string[]; source: string; target: string }>();

    for (const edge of ctx.edges) {
      const key = `${edge.source}|${edge.target}`;
      const existing = pairToEdges.get(key);
      if (existing) {
        existing.edges.push(edge.id);
      } else {
        pairToEdges.set(key, {
          edges: [edge.id],
          source: edge.source,
          target: edge.target,
        });
      }
    }

    const issues: AnalysisIssue[] = [];

    for (const [, data] of pairToEdges) {
      if (data.edges.length < 2) continue;

      issues.push({
        id: randomUUID(),
        severity: 'info',
        category: 'maintainability',
        title: 'Избыточные рёбра',
        description: `Между узлами "${data.source}" и "${data.target}" обнаружено ${data.edges.length} рёбер. Возможна избыточность или дублирование связей.`,
        affectedNodes: [data.source, data.target],
        affectedEdges: data.edges,
        recommendation:
          'Проверьте, нужны ли все эти связи. Возможно, часть из них можно объединить или удалить.',
        metrics: { duplicateCount: data.edges.length },
      });
    }

    return issues;
  }
}
