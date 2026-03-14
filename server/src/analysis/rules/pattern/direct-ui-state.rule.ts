import { randomUUID } from 'node:crypto';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class DirectUiStateRule implements AnalysisRule {
  readonly id = 'P04';
  readonly description = 'Прямая связь UI с глобальным состоянием';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    for (const edge of ctx.edges) {
      const source = ctx.nodeById.get(edge.source);
      const target = ctx.nodeById.get(edge.target);
      if (source?.kind === 'ui_page' && target?.kind === 'state_store') {
        issues.push({
          id: randomUUID(),
          ruleId: this.id,
          severity: 'warning',
          category: 'maintainability',
          title: 'Прямая связь UI с глобальным состоянием',
          description:
            'Страницы напрямую связаны со store. Рекомендуется использовать компоненты как прослойку.',
          affectedNodes: [edge.source, edge.target],
          affectedEdges: [edge.id],
          recommendation:
            'Добавьте UI-компоненты между страницами и store — для переиспользуемости и тестирования.',
        });
      }
    }
    return issues;
  }
}
