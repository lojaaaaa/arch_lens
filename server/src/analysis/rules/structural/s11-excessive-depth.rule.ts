import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import {
  calculateDepth,
  getNodesOnLongestPath,
} from '../../engine/depth-calculator.js';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class S11ExcessiveDepthRule implements AnalysisRule {
  readonly id = 'S11';
  readonly description = 'Чрезмерная глубина архитектуры';

  check(ctx: GraphContext): AnalysisIssue[] {
    const depth = calculateDepth(ctx);
    const threshold = ANALYSIS_CONFIG.structural.architectureDepthThreshold;

    if (depth <= threshold) return [];

    const affectedNodes = getNodesOnLongestPath(ctx);

    return [
      {
        id: randomUUID(),
        ruleId: this.id,
        severity: 'warning',
        category: 'architecture',
        title: 'Чрезмерная глубина архитектуры',
        description: `Глубина графа (${depth}) превышает порог (${threshold}). Упростите цепочки вызовов.`,
        affectedNodes,
        recommendation:
          'Упростите цепочки зависимостей, введите промежуточные слои или кэширование.',
        metrics: { depth, threshold },
      },
    ];
  }
}
