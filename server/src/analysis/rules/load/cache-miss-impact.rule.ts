import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class CacheMissImpactRule implements AnalysisRule {
  readonly id = 'L04';
  readonly description = 'Низкий hit rate кэша при высокой нагрузке на БД';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const caches = ctx.nodesByKind.get('cache') ?? [];

    for (const cache of caches) {
      const raw = Number(cache['hitRate']);
      const hitRate = Number.isFinite(raw) ? raw : 1;
      if (hitRate >= ANALYSIS_CONFIG.load.cacheLowHitRate) continue;

      const cacheEdges = ctx.edges.filter(
        (edge) => edge.source === cache.id || edge.target === cache.id,
      );
      const connectedIds = new Set<string>();
      for (const edge of cacheEdges) {
        connectedIds.add(edge.source);
        connectedIds.add(edge.target);
      }
      connectedIds.delete(cache.id);

      for (const nodeId of connectedIds) {
        const node = ctx.nodeById.get(nodeId);
        if (node?.kind !== 'database') continue;

        const dbReadsCount = ctx.edges.filter(
          (edge) => edge.target === nodeId && edge.kind === 'reads',
        ).length;

        if (dbReadsCount > ANALYSIS_CONFIG.load.cacheDbReadsThreshold) {
          issues.push({
            id: randomUUID(),
            severity: 'warning',
            category: 'performance',
            title: 'Низкий hit rate кэша при высокой нагрузке на БД',
            description: `Кэш "${cache.id}" имеет hitRate ${hitRate}, связанная БД "${nodeId}" получает ${dbReadsCount} read-запросов.`,
            affectedNodes: [cache.id, nodeId],
            recommendation:
              'Увеличьте hit rate кэша или добавьте дополнительные уровни кэширования.',
            metrics: { hitRate, dbReadsCount },
          });
          break;
        }
      }
    }

    return issues;
  }
}
