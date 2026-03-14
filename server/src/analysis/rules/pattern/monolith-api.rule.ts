import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class MonolithApiRule implements AnalysisRule {
  readonly id = 'P08';
  readonly description = 'Монолитный API Gateway';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const gateways = ctx.nodesByKind.get('api_gateway') ?? [];
    for (const node of gateways) {
      const endpoints = Number(node['endpointsCount']) || 0;
      if (endpoints > ANALYSIS_CONFIG.pattern.monolithApiEndpointsThreshold) {
        issues.push({
          id: randomUUID(),
          ruleId: this.id,
          severity: 'warning',
          category: 'scalability',
          title: 'Монолитный API Gateway',
          description: `API Gateway "${node.id}" содержит ${endpoints} эндпоинтов — риск монолитной структуры.`,
          affectedNodes: [node.id],
          recommendation:
            'Рассмотрите разделение Gateway на несколько специализированных.',
          metrics: { endpointsCount: endpoints },
        });
      }
    }
    return issues;
  }
}
