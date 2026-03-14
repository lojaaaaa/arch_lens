import { randomUUID } from 'node:crypto';
import { getEntryPoints, propagateLoad } from '../../engine/index.js';
import { getNodeCapacityRps } from '../../engine/capacity.helpers.js';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

function getEntryRequestRate(
  ctx: GraphContext,
  entryId: string,
): number | null {
  const node = ctx.nodeById.get(entryId);
  if (!node) return null;
  if (node.kind === 'api_gateway') {
    const rate = Number(node['requestRate']);
    return Number.isFinite(rate) && rate > 0 ? rate : null;
  }
  if (node.kind === 'ui_page') {
    const rate = Number(node['updateFrequency']);
    return Number.isFinite(rate) && rate > 0 ? rate : null;
  }
  return null;
}

export class L08BottleneckRule implements AnalysisRule {
  readonly id = 'L08';
  readonly description = 'Узел-узкое место (utilization > 1)';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const entryPoints = getEntryPoints(ctx);

    const allLoadByNode = new Map<string, number>();

    for (const entryId of entryPoints) {
      const requestRate = getEntryRequestRate(ctx, entryId);
      if (requestRate == null) continue;

      const load = propagateLoad(ctx, entryId, requestRate);
      for (const [nodeId, nodeLoad] of load) {
        allLoadByNode.set(nodeId, (allLoadByNode.get(nodeId) ?? 0) + nodeLoad);
      }
    }

    for (const node of ctx.nodes) {
      const capacity = getNodeCapacityRps(node);
      if (capacity == null || capacity <= 0) continue;

      const load = allLoadByNode.get(node.id) ?? 0;
      const utilization = load / capacity;
      if (utilization <= 1) continue;

      issues.push({
        id: randomUUID(),
        ruleId: this.id,
        severity: 'critical',
        category: 'performance',
        title: 'Узел-узкое место',
        description: `Utilization узла "${node.id}" (${utilization.toFixed(2)}) превышает 1. Load=${load} rps, Capacity=${capacity} rps.`,
        affectedNodes: [node.id],
        recommendation:
          'Увеличьте пропускную способность узла или распределите нагрузку.',
        metrics: { load, capacity, utilization },
      });
    }

    return issues;
  }
}
