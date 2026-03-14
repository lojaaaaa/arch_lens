import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import { calculateCriticalPath } from '../../engine/critical-path.calculator.js';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class L07CriticalPathRule implements AnalysisRule {
  readonly id = 'L07';
  readonly description = 'Критический путь слишком длинный';

  check(ctx: GraphContext): AnalysisIssue[] {
    const { totalMs, pathNodeIds } = calculateCriticalPath(ctx);
    const threshold = ANALYSIS_CONFIG.load.criticalPathMsThreshold;

    if (totalMs <= threshold || pathNodeIds.length === 0) return [];

    return [
      {
        id: randomUUID(),
        ruleId: this.id,
        severity: 'warning',
        category: 'performance',
        title: 'Критический путь слишком длинный',
        description: `Оценочная латентность критического пути (${Math.round(totalMs)} мс) превышает порог (${threshold} мс).`,
        affectedNodes: pathNodeIds,
        recommendation:
          'Упростите цепочку вызовов, введите кэширование или асинхронные этапы.',
        metrics: { criticalPathMs: totalMs, threshold },
      },
    ];
  }
}
