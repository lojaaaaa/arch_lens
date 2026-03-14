import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class DbWriteBottleneckRule implements AnalysisRule {
  readonly id = 'L03';
  readonly description = 'Узкое место записи в базу данных';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const dbs = ctx.nodesByKind.get('database') ?? [];

    for (const db of dbs) {
      const raw = Number(db['readWriteRatio']);
      const readWriteRatio = Number.isFinite(raw) ? raw : 1;
      const writesCount = ctx.edges.filter(
        (edge) => edge.target === db.id && edge.kind === 'writes',
      ).length;

      if (
        readWriteRatio < ANALYSIS_CONFIG.load.dbLowReadWriteRatio &&
        writesCount > ANALYSIS_CONFIG.load.dbWriteEdgesThreshold
      ) {
        issues.push({
          id: randomUUID(),
          severity: 'critical',
          category: 'performance',
          title: 'Узкое место записи в базу данных',
          description: `База "${db.id}" имеет низкий readWriteRatio (${readWriteRatio}) и ${writesCount} рёбер записи.`,
          affectedNodes: [db.id],
          recommendation:
            'Добавьте кэш, batch-записи или рассмотрите шардирование.',
          metrics: { writesCount, readWriteRatio },
        });
      }
    }

    return issues;
  }
}
