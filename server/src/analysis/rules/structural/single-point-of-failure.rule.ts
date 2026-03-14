import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
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
    const { criticalityThreshold, fanInThreshold } = ANALYSIS_CONFIG.spof;
    const issues: AnalysisIssue[] = [];

    for (const node of ctx.nodes) {
      const fanIn = ctx.incomingCount.get(node.id) ?? 0;
      const criticality = node.criticality ?? 0;

      if (criticality >= criticalityThreshold && fanIn >= fanInThreshold) {
        issues.push({
          id: randomUUID(),
          ruleId: this.id,
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
