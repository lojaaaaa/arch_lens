import { randomUUID } from 'node:crypto';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class RedundantEdgesRule implements AnalysisRule {
  readonly id = 'S10';
  readonly description =
    'Дублирующиеся рёбра между одними и теми же узлами — избыточность';

  check(ctx: GraphContext): AnalysisIssue[] {
    const groupToEdges = new Map<
      string,
      { edges: string[]; source: string; target: string; kind: string }
    >();

    for (const edge of ctx.edges) {
      const key = `${edge.source}|${edge.target}|${edge.kind}`;
      const existing = groupToEdges.get(key);
      if (existing) {
        existing.edges.push(edge.id);
      } else {
        groupToEdges.set(key, {
          edges: [edge.id],
          source: edge.source,
          target: edge.target,
          kind: edge.kind,
        });
      }
    }

    const dataKinds = new Set(['database', 'cache']);
    const dataEdgeKinds = new Set(['reads', 'writes']);
    const issues: AnalysisIssue[] = [];

    for (const [, data] of groupToEdges) {
      if (data.edges.length < 2) continue;

      const target = ctx.nodeById.get(data.target);
      if (
        target &&
        dataKinds.has(target.kind) &&
        dataEdgeKinds.has(data.kind)
      ) {
        continue;
      }

      issues.push({
        id: randomUUID(),
        ruleId: this.id,
        severity: 'info',
        category: 'maintainability',
        title: 'Избыточные рёбра',
        description: `Между узлами "${data.source}" и "${data.target}" обнаружено ${data.edges.length} рёбер типа "${data.kind}". Возможна избыточность.`,
        affectedNodes: [data.source, data.target],
        affectedEdges: data.edges,
        recommendation:
          'Проверьте, нужны ли все эти связи одного типа. Возможно, часть из них можно объединить или удалить.',
        metrics: { duplicateCount: data.edges.length },
      });
    }

    return issues;
  }
}
