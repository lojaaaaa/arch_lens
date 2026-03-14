import type { GraphContext } from '../interfaces/index.js';
import { tarjanSCC } from './tarjan-scc.js';

/** Веса по типу связи (V2-C1): calls/reads=1, writes=0.5, subscribes/emits=0.3, depends_on=0 */
const EDGE_KIND_WEIGHTS: Record<string, number> = {
  calls: 1,
  reads: 1,
  writes: 0.5,
  subscribes: 0.3,
  emits: 0.3,
  depends_on: 0,
};

/**
 * Load propagation: topological order (DAG condensation) from entry points.
 * Load(target) = Σ (Load(pred) × Σ edgeWeight(pred→target)).
 * edgeWeight = (frequency ?? 1) × kindWeight.
 * calls/reads=1.0, writes=0.5, subscribes/emits=0.3, depends_on=0 (V2-C1).
 */
export function propagateLoad(
  ctx: GraphContext,
  entryPointId: string,
  requestRate: number,
): Map<string, number> {
  const loadByNode = new Map<string, number>();
  if (!ctx.nodeById.has(entryPointId) || requestRate <= 0) {
    return loadByNode;
  }

  const { sccByNode, sccs } = tarjanSCC(ctx);
  const sccIds = sccs.map((_, i) => `scc_${i}`);
  const nodeToScc = sccByNode;

  const sccToNodes = new Map<string, string[]>();
  for (let i = 0; i < sccs.length; i++) {
    sccToNodes.set(`scc_${i}`, sccs[i]);
  }

  const sccEdges = new Map<
    string,
    Array<{
      target: string;
      sourceNode: string;
      targetNode: string;
      freq: number;
    }>
  >();
  for (const edge of ctx.edges) {
    const srcScc = nodeToScc.get(edge.source);
    const tgtScc = nodeToScc.get(edge.target);
    if (!srcScc || !tgtScc || srcScc === tgtScc) continue;
    const kindWeight = EDGE_KIND_WEIGHTS[edge.kind] ?? 0;
    const freq = (edge.frequency ?? 1) * kindWeight;
    const list = sccEdges.get(srcScc) ?? [];
    list.push({
      target: tgtScc,
      sourceNode: edge.source,
      targetNode: edge.target,
      freq,
    });
    sccEdges.set(srcScc, list);
  }

  const condensationIn = new Map<string, string[]>();
  for (const id of sccIds) condensationIn.set(id, []);
  for (const [src, arr] of sccEdges) {
    for (const { target } of arr) {
      condensationIn.get(target)!.push(src);
    }
  }

  const inDegree = new Map(
    sccIds.map((id) => [id, condensationIn.get(id)!.length]),
  );
  const topoOrder: string[] = [];
  const queue = sccIds.filter((id) => inDegree.get(id) === 0);
  while (queue.length > 0) {
    const currentScc = queue.shift()!;
    topoOrder.push(currentScc);
    for (const { target } of sccEdges.get(currentScc) ?? []) {
      inDegree.set(target, inDegree.get(target)! - 1);
      if (inDegree.get(target) === 0) queue.push(target);
    }
  }

  const loadByScc = new Map<string, number>();
  const entryScc = nodeToScc.get(entryPointId);
  if (entryScc) {
    loadByScc.set(entryScc, requestRate);
    for (const nid of sccToNodes.get(entryScc) ?? []) {
      loadByNode.set(nid, requestRate);
    }
  }

  for (const sccId of topoOrder) {
    if (sccId === entryScc) continue;
    const incoming = condensationIn.get(sccId) ?? [];
    let load = 0;
    for (const predScc of incoming) {
      const predLoad = loadByScc.get(predScc) ?? 0;
      const edges = sccEdges.get(predScc) ?? [];
      const toThis = edges.filter((edge) => edge.target === sccId);
      const sumFreqToThis = toThis.reduce((sum, edge) => sum + edge.freq, 0);
      load += predLoad * sumFreqToThis;
    }
    if (load > 0) {
      loadByScc.set(sccId, load);
      for (const nid of sccToNodes.get(sccId) ?? []) {
        loadByNode.set(nid, load);
      }
    }
  }

  return loadByNode;
}
