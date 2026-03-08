import { randomUUID } from 'node:crypto';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class FrontendDbDirectRule implements AnalysisRule {
  readonly id = 'S06';
  readonly description = 'Прямое обращение фронтенда к БД — нарушение слоёв';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];

    for (const edge of ctx.edges) {
      if (edge.kind !== 'reads' && edge.kind !== 'writes') continue;

      const sourceNode = ctx.nodeById.get(edge.source);
      const targetNode = ctx.nodeById.get(edge.target);

      if (!sourceNode || !targetNode) continue;
      if (sourceNode.layer !== 'frontend') continue;
      if (targetNode.kind !== 'database') continue;

      issues.push({
        id: randomUUID(),
        severity: 'critical',
        category: 'security',
        title: 'Прямое обращение фронтенда к БД',
        description: `Узел фронтенда "${edge.source}" напрямую обращается к БД "${edge.target}". Это создаёт риски безопасности.`,
        affectedNodes: [edge.source, edge.target],
        affectedEdges: [edge.id],
        recommendation:
          'Обратитесь к данным через бэкенд-сервис — для безопасности и разделения слоёв.',
      });
    }

    return issues;
  }
}
