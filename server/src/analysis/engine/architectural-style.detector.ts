import type { GraphContext } from '../interfaces/index.js';
import type { AnalysisMetrics } from '../interfaces/analysis-result.interface.js';

export type ArchitecturalStyle =
  | 'layered'
  | 'microservices'
  | 'event-driven'
  | 'client-server'
  | 'monolith'
  | 'unknown';

/**
 * Определение архитектурного стиля по эвристикам:
 * service count, event edges ratio, has gateway, density, depth.
 */
export function detectArchitectureStyle(
  ctx: GraphContext,
  metrics: AnalysisMetrics,
): ArchitecturalStyle {
  const serviceCount = ctx.nodesByKind.get('service')?.length ?? 0;
  const hasGateway = ctx.nodes.some((node) => node.kind === 'api_gateway');
  const hasFrontend = ctx.nodesByLayer.frontend.length > 0;
  const hasBackend = ctx.nodesByLayer.backend.length > 0;
  const hasData = ctx.nodesByLayer.data.length > 0;

  const totalEdges = metrics.totalEdges || ctx.edges.length;
  const eventRatio =
    totalEdges > 0 ? metrics.eventDrivenEdgesCount / totalEdges : 0;

  if (metrics.eventDrivenEdgesCount >= 1 && eventRatio > 0.08) {
    return 'event-driven';
  }

  if (serviceCount >= 2 && hasGateway && metrics.density < 0.25) {
    return 'microservices';
  }

  if (hasGateway && hasFrontend && hasBackend && hasData) {
    if (serviceCount === 1 && metrics.depth <= 4) {
      return 'client-server';
    }
    return 'layered';
  }

  if (serviceCount === 1 && !hasGateway) {
    return 'monolith';
  }

  if (metrics.density > 0.4) {
    return 'monolith';
  }

  if (hasGateway && serviceCount >= 1) {
    return serviceCount >= 2 ? 'microservices' : 'client-server';
  }

  return 'unknown';
}
