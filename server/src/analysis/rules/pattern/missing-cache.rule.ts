import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import type { AnalysisIssue, AnalysisRule, GraphContext } from '../../interfaces/index.js';

export class MissingCacheRule implements AnalysisRule {
  readonly id = 'P03';
  readonly description = 'Отсутствует кэш для нагруженной базы данных';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const databases = ctx.nodesByKind.get('database') ?? [];
    const cacheIds = new Set(
      (ctx.nodesByKind.get('cache') ?? []).map((n) => n.id),
    );
    for (const node of databases) {
      const ratio = Number(node['readWriteRatio']) || 0;
      if (ratio >= ANALYSIS_CONFIG.pattern.missingCacheReadWriteRatio) {
        const hasCacheConnection = ctx.edges.some(
          (e) =>
            (e.source === node.id && cacheIds.has(e.target)) ||
            (e.target === node.id && cacheIds.has(e.source)),
        );
        if (!hasCacheConnection) {
          issues.push({
            id: randomUUID(),
            severity: 'warning',
            category: 'performance',
            title: 'Отсутствует кэш для нагруженной базы данных',
            description: `База данных "${node.id}" имеет высокий readWriteRatio (${ratio}), но не связана с кэшем.`,
            affectedNodes: [node.id],
            recommendation: 'Добавьте слой кэширования для снижения нагрузки на БД.',
            metrics: { readWriteRatio: ratio },
          });
        }
      }
    }
    return issues;
  }
}
