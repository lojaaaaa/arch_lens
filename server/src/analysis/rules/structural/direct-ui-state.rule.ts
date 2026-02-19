import { randomUUID } from 'node:crypto';
import type { AnalysisIssue, AnalysisRule, GraphContext } from '../../interfaces/index.js';

export class DirectUiStateRule implements AnalysisRule {
  readonly id = 'P04';
  readonly description = 'Страница напрямую связана со store (минуя компоненты)';

  check(ctx: GraphContext): AnalysisIssue[] {
    const directEdges = ctx.edges.filter((edge) => {
      const source = ctx.nodeById.get(edge.source);
      const target = ctx.nodeById.get(edge.target);
      return source?.kind === 'ui_page' && target?.kind === 'state_store';
    });

    if (directEdges.length === 0) return [];

    return [
      {
        id: randomUUID(),
        severity: 'warning',
        category: 'maintainability',
        title: 'Прямая связь UI с глобальным состоянием',
        description:
          'Страницы напрямую связаны со store. Рекомендуется использовать компоненты как прослойку.',
        affectedNodes: [
          ...new Set(
            directEdges.flatMap((edge) => [edge.source, edge.target]),
          ),
        ],
        recommendation:
          'Добавьте промежуточные UI компоненты между страницами и store.',
      },
    ];
  }
}
