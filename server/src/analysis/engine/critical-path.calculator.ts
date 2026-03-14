import type { ArchitectureNodeDto } from '../dto/architecture-graph.dto.js';
import type { GraphContext } from '../interfaces/index.js';
import { getNodesOnLongestPath } from './depth-calculator.js';

/** Latency в мс из DTO или assumption по kind. */
export function getNodeLatencyMs(node: ArchitectureNodeDto): number {
  const raw = Number(node['latencyMs']);
  if (Number.isFinite(raw) && raw >= 0) return raw;

  switch (node.kind) {
    case 'api_gateway':
      return 10;
    case 'service':
      return 50;
    case 'database':
      return 50;
    case 'cache':
      return 3;
    case 'external_system':
      return Number(node['latencyMs']) || 100;
    default:
      return 0;
  }
}

/**
 * Critical path = longest path (по количеству узлов) с суммой latencyMs.
 * Latency из DTO или assumptions.
 */
export function calculateCriticalPath(ctx: GraphContext): {
  totalMs: number;
  pathNodeIds: string[];
} {
  const pathNodeIds = getNodesOnLongestPath(ctx);
  if (pathNodeIds.length === 0) return { totalMs: 0, pathNodeIds: [] };

  let totalMs = 0;
  for (const nodeId of pathNodeIds) {
    const node = ctx.nodeById.get(nodeId);
    if (node) totalMs += getNodeLatencyMs(node);
  }
  return { totalMs, pathNodeIds };
}
