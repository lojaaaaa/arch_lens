import type { GraphContext, AnalysisMetrics } from '../interfaces/index.js';
import { deriveNodeComplexity } from './derive-complexity.js';
import { calculateDepth } from './depth-calculator.js';
import { tarjanSCC } from './tarjan-scc.js';

export function calculateMetrics(ctx: GraphContext): AnalysisMetrics {
  const nodeCount = ctx.nodes.length;
  const edgeCount = ctx.edges.length;
  const density =
    nodeCount <= 1 ? 0 : edgeCount / (nodeCount * (nodeCount - 1));
  const depth = calculateDepth(ctx);
  const { sccs } = tarjanSCC(ctx);
  const cycleCount = sccs.filter((scc) => scc.length > 1).length;

  const getComplexity = (node: (typeof ctx.nodes)[0]) =>
    deriveNodeComplexity(node as Parameters<typeof deriveNodeComplexity>[0]);

  const frontendComplexity = ctx.nodesByLayer.frontend.reduce(
    (sum, node) => sum + getComplexity(node),
    0,
  );

  const backendComplexity = [
    ...ctx.nodesByLayer.backend,
    ...ctx.nodesByLayer.data,
  ].reduce((sum, node) => sum + getComplexity(node), 0);

  const criticalNodesCount = ctx.nodes.filter(
    (node) => (node.criticality ?? 0) >= 2,
  ).length;

  const stateStoreCount = ctx.nodesByKind.get('state_store')?.length ?? 0;
  const estimatedRenderPressure = frontendComplexity * (stateStoreCount || 1);

  const apiEdgesCount = ctx.edges.filter(
    (edge) => edge.kind === 'calls' || edge.kind === 'reads',
  ).length;

  const dataEdgesCount = ctx.edges.filter(
    (edge) => edge.kind === 'reads' || edge.kind === 'writes',
  ).length;

  const maxFanOut =
    ctx.nodes.length > 0
      ? Math.max(
          ...ctx.nodes.map((node) => ctx.outgoingCount.get(node.id) ?? 0),
        )
      : 0;

  const totalFanOut = ctx.nodes.reduce(
    (sum, node) => sum + (ctx.outgoingCount.get(node.id) ?? 0),
    0,
  );
  const avgFanOut = ctx.nodes.length > 0 ? totalFanOut / ctx.nodes.length : 0;

  const godIndexByNode: Record<string, number> = {};
  const instabilityByNode: Record<string, number> = {};
  const fanOutByNode: Record<string, number> = {};
  for (const node of ctx.nodes) {
    const fanOut = ctx.outgoingCount.get(node.id) ?? 0;
    const fanIn = ctx.incomingCount.get(node.id) ?? 0;
    fanOutByNode[node.id] = fanOut;
    if (avgFanOut > 0) {
      godIndexByNode[node.id] = fanOut / avgFanOut;
    }
    const sum = fanIn + fanOut;
    instabilityByNode[node.id] = sum > 0 ? fanOut / sum : 0;
  }

  const eventDrivenEdgesCount = ctx.edges.filter(
    (edge) => edge.kind === 'subscribes' || edge.kind === 'emits',
  ).length;

  const callsCount = ctx.edges.filter((edge) => edge.kind === 'calls').length;
  const readsCount = ctx.edges.filter((edge) => edge.kind === 'reads').length;
  const writesCount = ctx.edges.filter((edge) => edge.kind === 'writes').length;
  const subscribesCount = ctx.edges.filter(
    (edge) => edge.kind === 'subscribes',
  ).length;
  const emitsCount = ctx.edges.filter((edge) => edge.kind === 'emits').length;
  const dependsOnCount = ctx.edges.filter(
    (edge) => edge.kind === 'depends_on',
  ).length;

  return {
    totalNodes: nodeCount,
    totalEdges: edgeCount,
    density,
    depth,
    cycleCount,
    frontendComplexity,
    backendComplexity,
    criticalNodesCount,
    estimatedRenderPressure,
    apiEdgesCount,
    dataEdgesCount,
    callsCount,
    readsCount,
    writesCount,
    subscribesCount,
    emitsCount,
    dependsOnCount,
    stateStoreCount,
    maxFanOut,
    eventDrivenEdgesCount,
    avgFanOut,
    godIndexByNode,
    instabilityByNode,
    fanOutByNode,
  };
}
