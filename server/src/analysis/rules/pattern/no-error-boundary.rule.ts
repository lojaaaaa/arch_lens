import { randomUUID } from 'node:crypto';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class NoErrorBoundaryRule implements AnalysisRule {
  readonly id = 'P07';
  readonly description = 'Нет обработки ошибок при вызове API';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const gatewayIds = new Set(
      (ctx.nodesByKind.get('api_gateway') ?? []).map((node) => node.id),
    );
    const reportedFrontends = new Set<string>();
    for (const edge of ctx.edges) {
      if (edge.kind === 'calls' && gatewayIds.has(edge.target)) {
        const source = ctx.nodeById.get(edge.source);
        if (
          source?.layer === 'frontend' &&
          !reportedFrontends.has(edge.source)
        ) {
          reportedFrontends.add(edge.source);
          issues.push({
            id: randomUUID(),
            ruleId: this.id,
            severity: 'info',
            category: 'reliability',
            title: 'Нет обработки ошибок при вызове API',
            description: `Фронтенд-узел "${edge.source}" вызывает API Gateway. Убедитесь в наличии error boundary и обработки ошибок.`,
            affectedNodes: [edge.source],
            affectedEdges: [edge.id],
            recommendation:
              'Добавьте обработку ошибок и fallback-логику при вызове API.',
          });
        }
      }
    }
    return issues;
  }
}
