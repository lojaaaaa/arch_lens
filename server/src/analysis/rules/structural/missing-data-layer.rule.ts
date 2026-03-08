import { randomUUID } from 'node:crypto';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class MissingDataLayerRule implements AnalysisRule {
  readonly id = 'S05';
  readonly description = 'Сервисы бэкенда без связей с БД или кэшем';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const serviceNodes = ctx.nodesByKind.get('service') ?? [];

    for (const node of serviceNodes) {
      const hasDataConnection = ctx.edges.some((edge) => {
        if (edge.source !== node.id) return false;
        if (edge.kind !== 'reads' && edge.kind !== 'writes') return false;
        const target = ctx.nodeById.get(edge.target);
        return target?.kind === 'database' || target?.kind === 'cache';
      });

      if (!hasDataConnection) {
        issues.push({
          id: randomUUID(),
          severity: 'warning',
          category: 'architecture',
          title: 'Сервис без связей с уровнем данных',
          description: `Сервис "${node.id}" не имеет связей вида reads/writes с БД или кэшем.`,
          affectedNodes: [node.id],
          recommendation:
            'Проверьте, должен ли сервис обращаться к данным и добавьте соответствующие связи.',
        });
      }
    }

    return issues;
  }
}
