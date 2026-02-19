import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import type { AnalysisIssue, AnalysisRule, GraphContext } from '../../interfaces/index.js';

export class HighFanOutRule implements AnalysisRule {
  readonly id = 'S03';
  readonly description = 'Узел с чрезмерным количеством исходящих связей';

  check(ctx: GraphContext): AnalysisIssue[] {
    const { highFanOutThreshold, highFanOutCriticalThreshold } =
      ANALYSIS_CONFIG.structural;

    const issues: AnalysisIssue[] = [];

    for (const [nodeId, count] of ctx.outgoingCount) {
      if (count < highFanOutThreshold) continue;

      issues.push({
        id: randomUUID(),
        severity: count >= highFanOutCriticalThreshold ? 'critical' : 'warning',
        category: 'architecture',
        title: 'Слишком много исходящих связей у узла',
        description: `Узел "${nodeId}" имеет ${count} исходящих связей. Это может создавать bottleneck.`,
        affectedNodes: [nodeId],
        recommendation:
          'Рассмотрите декомпозицию узла или вынос части логики.',
      });
    }

    return issues;
  }
}
