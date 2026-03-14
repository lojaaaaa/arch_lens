import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class MissingCacheRule implements AnalysisRule {
  readonly id = 'P03';
  readonly description = 'Отсутствует кэш для нагруженной базы данных';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const databases = ctx.nodesByKind.get('database') ?? [];
    const cacheIds = new Set(
      (ctx.nodesByKind.get('cache') ?? []).map((node) => node.id),
    );

    const serviceReadsCache = new Set<string>();
    for (const edge of ctx.edges) {
      if (edge.kind === 'reads' && cacheIds.has(edge.target)) {
        serviceReadsCache.add(edge.source);
      }
    }

    for (const db of databases) {
      const ratio = Number(db['readWriteRatio']) || 0;
      if (ratio < ANALYSIS_CONFIG.pattern.missingCacheReadWriteRatio) continue;

      const readersOfDb = ctx.edges
        .filter((edge) => edge.target === db.id && edge.kind === 'reads')
        .map((edge) => edge.source);

      const someReaderUsesCache = readersOfDb.some((srcId) =>
        serviceReadsCache.has(srcId),
      );

      if (!someReaderUsesCache) {
        issues.push({
          id: randomUUID(),
          ruleId: this.id,
          severity: 'warning',
          category: 'performance',
          title: 'Отсутствует кэш для нагруженной базы данных',
          description: `База данных "${db.id}" имеет высокий readWriteRatio (${ratio}), но сервисы, читающие из неё, не используют кэш.`,
          affectedNodes: [db.id, ...readersOfDb],
          recommendation:
            'Добавьте кэш-узел и свяжите сервис с ним через reads — это снизит нагрузку на БД при частых чтениях.',
          metrics: { readWriteRatio: ratio },
        });
      }
    }
    return issues;
  }
}
