import { randomUUID } from 'node:crypto';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class OrphanNodesRule implements AnalysisRule {
  readonly id = 'S01';
  readonly description = 'Узлы без связей — возможно, забыты';

  check(ctx: GraphContext): AnalysisIssue[] {
    const orphans = ctx.nodes.filter(
      (node) =>
        !ctx.edges.some(
          (edge) => edge.source === node.id || edge.target === node.id,
        ),
    );

    if (orphans.length === 0) return [];

    return [
      {
        id: randomUUID(),
        ruleId: this.id,
        severity: 'info',
        category: 'architecture',
        title: 'Обнаружены изолированные узлы',
        description: `${orphans.length} узел(ов) не связаны с остальной системой.`,
        affectedNodes: orphans.map((n) => n.id),
        recommendation:
          'Проверьте, должны ли эти узлы быть частью архитектуры.',
      },
    ];
  }
}
