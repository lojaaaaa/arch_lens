import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import type { AnalysisIssue, AnalysisRule, GraphContext } from '../../interfaces/index.js';

export class GodServiceRule implements AnalysisRule {
  readonly id = 'P01';
  readonly description = 'God Service — сервис перегружен ответственностью';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const services = ctx.nodesByKind.get('service') ?? [];
    for (const node of services) {
      const ops = Number(node['operationsCount']) || 0;
      const ext = Number(node['externalCalls']) || 0;
      if (ops > ANALYSIS_CONFIG.pattern.godServiceOpsThreshold && ext > ANALYSIS_CONFIG.pattern.godServiceExternalCallsThreshold) {
        issues.push({
          id: randomUUID(),
          severity: 'critical',
          category: 'maintainability',
          title: 'God Service — сервис перегружен ответственностью',
          description: `Сервис "${node.id}" имеет слишком много операций (${ops}) и внешних вызовов (${ext}).`,
          affectedNodes: [node.id],
          recommendation:
            'Разбейте сервис на более мелкие модули с чёткой ответственностью.',
          metrics: { operationsCount: ops, externalCalls: ext },
        });
      }
    }
    return issues;
  }
}
