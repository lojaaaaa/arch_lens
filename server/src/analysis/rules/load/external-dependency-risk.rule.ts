import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import type { AnalysisIssue, AnalysisRule, GraphContext } from '../../interfaces/index.js';

export class ExternalDependencyRiskRule implements AnalysisRule {
  readonly id = 'L05';
  readonly description = 'Ненадёжная внешняя зависимость на критическом пути';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const externals = ctx.nodesByKind.get('external_system') ?? [];

    for (const ext of externals) {
      const reliability = Number(ext['reliability']) ?? 1;
      if (reliability >= ANALYSIS_CONFIG.load.lowReliability) continue;

      const dependentEdges = ctx.edges.filter(
        (e) => e.target === ext.id || e.source === ext.id,
      );

      for (const edge of dependentEdges) {
        const otherId = edge.source === ext.id ? edge.target : edge.source;
        const other = ctx.nodeById.get(otherId);
        if (!other || (other.criticality ?? 0) < 2) continue;

        issues.push({
          id: randomUUID(),
          severity: 'warning',
          category: 'reliability',
          title: 'Ненадёжная внешняя зависимость на критическом пути',
          description: `Внешняя система "${ext.id}" имеет надёжность ${reliability}. Критический узел "${otherId}" от неё зависит.`,
          affectedNodes: [ext.id, otherId],
          recommendation:
            'Добавьте retry, fallback или резервную реализацию для внешней зависимости.',
          metrics: { reliability },
        });
        break;
      }
    }

    return issues;
  }
}
