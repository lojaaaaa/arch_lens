import type { GraphContext, AnalysisMetrics } from '../interfaces/index.js';

export function calculateMetrics(ctx: GraphContext): AnalysisMetrics {
  const frontendComplexity = ctx.nodesByLayer.frontend.reduce(
    (sum, node) => sum + (node.complexity ?? 1),
    0,
  );

  const backendComplexity = [
    ...ctx.nodesByLayer.backend,
    ...ctx.nodesByLayer.data,
  ].reduce((sum, node) => sum + (node.complexity ?? 1), 0);

  const criticalNodesCount = ctx.nodes.filter(
    (node) => (node.criticality ?? 0) >= 2,
  ).length;

  const stateStoreCount = ctx.nodesByKind.get('state_store')?.length ?? 0;
  const estimatedRenderPressure = frontendComplexity * (stateStoreCount || 1);

  const estimatedApiLoad = ctx.edges.filter(
    (edge) => edge.kind === 'calls' || edge.kind === 'reads',
  ).length;

  const estimatedDataLoad = ctx.edges.filter(
    (edge) => edge.kind === 'reads' || edge.kind === 'writes',
  ).length;

  return {
    totalNodes: ctx.nodes.length,
    totalEdges: ctx.edges.length,
    frontendComplexity,
    backendComplexity,
    criticalNodesCount,
    estimatedRenderPressure,
    estimatedApiLoad,
    estimatedDataLoad,
  };
}
