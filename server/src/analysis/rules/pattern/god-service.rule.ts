import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class GodServiceRule implements AnalysisRule {
  readonly id = 'P01';
  readonly description = 'God Service — сервис перегружен ответственностью';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const services = ctx.nodesByKind.get('service') ?? [];
    const { godServiceOpsThreshold, godServiceExternalCallsThreshold } =
      ANALYSIS_CONFIG.pattern;

    for (const node of services) {
      const ops = Number(node['operationsCount']) || 0;
      const ext = Number(node['externalCalls']) || 0;

      const opsExceeded = ops > godServiceOpsThreshold;
      const extExceeded = ext > godServiceExternalCallsThreshold;

      if (!opsExceeded && !extExceeded) continue;

      const severity = opsExceeded && extExceeded ? 'critical' : 'warning';
      const reason =
        opsExceeded && extExceeded
          ? `слишком много операций (${ops}) и внешних вызовов (${ext})`
          : opsExceeded
            ? `слишком много операций (${ops})`
            : `слишком много внешних вызовов (${ext})`;

      issues.push({
        id: randomUUID(),
        ruleId: this.id,
        severity,
        category: 'maintainability',
        title: 'God Service — сервис перегружен ответственностью',
        description: `Сервис "${node.id}" имеет ${reason}.`,
        affectedNodes: [node.id],
        recommendation:
          'Разбейте сервис на более мелкие модули с чёткой ответственностью.',
        metrics: { operationsCount: ops, externalCalls: ext },
      });
    }
    return issues;
  }
}
