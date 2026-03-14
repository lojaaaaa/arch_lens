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
    for (const node of databases) {
      const ratio = Number(node['readWriteRatio']) || 0;
      if (ratio >= ANALYSIS_CONFIG.pattern.missingCacheReadWriteRatio) {
        const hasCacheConnection = ctx.edges.some(
          (edge) =>
            (edge.source === node.id && cacheIds.has(edge.target)) ||
            (edge.target === node.id && cacheIds.has(edge.source)),
        );
        if (!hasCacheConnection) {
          issues.push({
            id: randomUUID(),
            severity: 'warning',
            category: 'performance',
            title: 'Отсутствует кэш для нагруженной базы данных',
            description: `База данных "${node.id}" имеет высокий readWriteRatio (${ratio}), но не связана с кэшем.`,
            affectedNodes: [node.id],
            recommendation:
              'Добавьте кэш между сервисом и БД — снизит нагрузку при частых чтениях.',
            metrics: { readWriteRatio: ratio },
          });
        }
      }
    }
    return issues;
  }
}
