import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class HighFanInRule implements AnalysisRule {
  readonly id = 'S04';
  readonly description = 'Узел с чрезмерным количеством входящих связей';

  check(ctx: GraphContext): AnalysisIssue[] {
    const { highFanInThreshold } = ANALYSIS_CONFIG.structural;
    const issues: AnalysisIssue[] = [];

    for (const [nodeId, count] of ctx.incomingCount) {
      if (count < highFanInThreshold) continue;

      issues.push({
        id: randomUUID(),
        severity: 'warning',
        category: 'reliability',
        title: 'Слишком много входящих связей у узла',
        description: `Узел "${nodeId}" имеет ${count} входящих связей. Это создаёт риск единой точки отказа.`,
        affectedNodes: [nodeId],
        recommendation:
          'Рассмотрите балансировку нагрузки или репликацию узла.',
      });
    }

    return issues;
  }
}
