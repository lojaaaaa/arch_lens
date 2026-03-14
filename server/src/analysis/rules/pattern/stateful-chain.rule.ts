import { randomUUID } from 'node:crypto';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class StatefulChainRule implements AnalysisRule {
  readonly id = 'P05';
  readonly description = 'Цепочка stateful-сервисов';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const services = ctx.nodesByKind.get('service') ?? [];
    const statefulIds = new Set(
      services
        .filter((node) => node['stateful'] === true)
        .map((node) => node.id),
    );
    const reportedPairs = new Set<string>();
    for (const edge of ctx.edges) {
      if (
        edge.kind === 'calls' &&
        statefulIds.has(edge.source) &&
        statefulIds.has(edge.target)
      ) {
        const pair = [edge.source, edge.target].sort().join('|');
        if (!reportedPairs.has(pair)) {
          reportedPairs.add(pair);
          issues.push({
            id: randomUUID(),
            ruleId: this.id,
            severity: 'warning',
            category: 'scalability',
            title: 'Цепочка stateful-сервисов',
            description: `Stateful-сервисы "${edge.source}" и "${edge.target}" связаны вызовами — затрудняет горизонтальное масштабирование.`,
            affectedNodes: [edge.source, edge.target],
            affectedEdges: [edge.id],
            recommendation:
              'Рассмотрите вынос состояния во внешние хранилища или stateless-архитектуру.',
          });
        }
      }
    }
    return issues;
  }
}
