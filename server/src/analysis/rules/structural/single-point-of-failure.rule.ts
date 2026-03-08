import { randomUUID } from 'node:crypto';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class SinglePointOfFailureRule implements AnalysisRule {
  readonly id = 'S09';
  readonly description =
    'Высококритичные узлы с большим числом зависимых — единая точка отказа';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];

    for (const node of ctx.nodes) {
      const fanIn = ctx.incomingCount.get(node.id) ?? 0;
      const criticality = node.criticality ?? 0;

      if (criticality >= 2 && fanIn >= 3) {
        issues.push({
          id: randomUUID(),
          severity: 'critical',
          category: 'reliability',
          title: 'Единая точка отказа',
          description: `Узел "${node.id}" имеет высокую критичность (${criticality}) и большое число зависимых компонентов (fan-in: ${fanIn}). Отказ узла повлияет на множество подсистем.`,
          affectedNodes: [node.id],
          recommendation:
            'Рассмотрите репликацию, шардирование или введение резервного узла для повышения отказоустойчивости.',
          metrics: { criticality, fanIn },
        });
      }
    }

    return issues;
  }
}
