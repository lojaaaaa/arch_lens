import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import { deriveNodeComplexity } from '../../engine/derive-complexity.js';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class RenderPressureRule implements AnalysisRule {
  readonly id = 'L01';
  readonly description = 'Высокая нагрузка на рендеринг';

  check(ctx: GraphContext): AnalysisIssue[] {
    const frontendComplexity = ctx.nodesByLayer.frontend.reduce(
      (sum, node) =>
        sum +
        deriveNodeComplexity(
          node as Parameters<typeof deriveNodeComplexity>[0],
        ),
      0,
    );
    const stateStoreCount = (ctx.nodesByKind.get('state_store') ?? []).length;
    const pressure = frontendComplexity * stateStoreCount;

    if (pressure <= ANALYSIS_CONFIG.load.renderPressureThreshold) return [];

    const frontendIds = ctx.nodesByLayer.frontend.map((node) => node.id);

    return [
      {
        id: randomUUID(),
        ruleId: this.id,
        severity: 'warning',
        category: 'performance',
        title: 'Высокая нагрузка на рендеринг',
        description: `Нагрузка рендеринга (${pressure}) превышает порог. Комплексность фронтенда × количество сторов = ${frontendComplexity} × ${stateStoreCount}.`,
        affectedNodes: frontendIds,
        recommendation:
          'Уменьшите количество сторов состояния или упростите компоненты.',
        metrics: { renderPressure: pressure },
      },
    ];
  }
}
