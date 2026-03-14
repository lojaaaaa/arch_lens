import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class ApiOverloadRule implements AnalysisRule {
  readonly id = 'L02';
  readonly description = 'Перегрузка API Gateway';

  check(ctx: GraphContext): AnalysisIssue[] {
    const gateways = ctx.nodesByKind.get('api_gateway') ?? [];
    const totalRate = gateways.reduce(
      (sum, gw) => sum + (Number(gw['requestRate']) || 0),
      0,
    );

    const threshold = ANALYSIS_CONFIG.load.apiOverloadThreshold;
    if (totalRate <= threshold) return [];

    return [
      {
        id: randomUUID(),
        ruleId: this.id,
        severity: 'warning',
        category: 'scalability',
        title: 'Перегрузка API Gateway',
        description: `Суммарная нагрузка (${totalRate} req/s) на API Gateway превышает порог (${threshold}).`,
        affectedNodes: gateways.map((g) => g.id),
        recommendation:
          'Масштабируйте Gateway или распределите нагрузку между несколькими инстансами.',
        metrics: { totalRequestRate: totalRate },
      },
    ];
  }
}
