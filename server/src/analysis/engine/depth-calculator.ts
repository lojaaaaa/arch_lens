import type { GraphContext } from '../interfaces/index.js';
import { tarjanSCC } from './tarjan-scc.js';

/**
 * Depth = longest path в DAG (condensation graph).
 * SCC collapsed, longest path от entry points.
 */
export function calculateDepth(ctx: GraphContext): number {
  const { entryPoints, nodeById } = ctx;
  if (entryPoints.length === 0 || ctx.nodes.length === 0) return 0;

  const { sccByNode, sccs } = tarjanSCC(ctx);
  const sccIds = sccs.map((_, i) => `scc_${i}`);

  const entrySccIds = new Set(
    entryPoints
      .filter((id) => nodeById.has(id))
      .map((id) => sccByNode.get(id)!),
  );

  const condensationOut = new Map<string, Set<string>>();
  const condensationIn = new Map<string, Set<string>>();
  for (const id of sccIds) {
    condensationOut.set(id, new Set());
    condensationIn.set(id, new Set());
  }
  for (const edge of ctx.edges) {
    const srcScc = sccByNode.get(edge.source);
    const tgtScc = sccByNode.get(edge.target);
    if (!srcScc || !tgtScc || srcScc === tgtScc) continue;
    condensationOut.get(srcScc)!.add(tgtScc);
    condensationIn.get(tgtScc)!.add(srcScc);
  }

  const topoOrder: string[] = [];
  const inDegree = new Map(
    sccIds.map((id) => [id, condensationIn.get(id)!.size]),
  );
  const queue = sccIds.filter((id) => inDegree.get(id) === 0);
  while (queue.length > 0) {
    const v = queue.shift()!;
    topoOrder.push(v);
    for (const w of condensationOut.get(v)!) {
      inDegree.set(w, inDegree.get(w)! - 1);
      if (inDegree.get(w) === 0) queue.push(w);
    }
  }

  const reachable = new Set<string>();
  let wave = Array.from(entrySccIds);
  while (wave.length > 0) {
    const next: string[] = [];
    for (const v of wave) {
      if (reachable.has(v)) continue;
      reachable.add(v);
      for (const w of condensationOut.get(v) ?? []) {
        next.push(w);
      }
    }
    wave = next;
  }

  const depth = new Map<string, number>();
  for (const sccId of topoOrder) {
    if (!reachable.has(sccId)) continue;
    const preds = [...condensationIn.get(sccId)!].filter((p) =>
      reachable.has(p),
    );
    const predDepths = preds.map((p) => depth.get(p) ?? 0);
    const maxPred = predDepths.length > 0 ? Math.max(...predDepths) : 0;
    depth.set(sccId, maxPred + 1);
  }

  let maxDepth = 0;
  for (const sccId of reachable) {
    const d = depth.get(sccId) ?? 0;
    if (d > maxDepth) maxDepth = d;
  }
  return maxDepth;
}

/**
 * Узлы на самом длинном пути (condensation, от entry points).
 * Для S11 Excessive Depth — affectedNodes.
 */
export function getNodesOnLongestPath(ctx: GraphContext): string[] {
  const { entryPoints, nodeById } = ctx;
  if (entryPoints.length === 0 || ctx.nodes.length === 0) return [];

  const { sccByNode, sccs } = tarjanSCC(ctx);
  const sccIds = sccs.map((_, i) => `scc_${i}`);
  const sccToNodes = new Map(sccIds.map((id, i) => [id, sccs[i]]));

  const entrySccIds = new Set(
    entryPoints
      .filter((id) => nodeById.has(id))
      .map((id) => sccByNode.get(id)!),
  );

  const condensationOut = new Map<string, Set<string>>();
  const condensationIn = new Map<string, Set<string>>();
  for (const id of sccIds) {
    condensationOut.set(id, new Set());
    condensationIn.set(id, new Set());
  }
  for (const edge of ctx.edges) {
    const srcScc = sccByNode.get(edge.source);
    const tgtScc = sccByNode.get(edge.target);
    if (!srcScc || !tgtScc || srcScc === tgtScc) continue;
    condensationOut.get(srcScc)!.add(tgtScc);
    condensationIn.get(tgtScc)!.add(srcScc);
  }

  const topoOrder: string[] = [];
  const inDegree = new Map(
    sccIds.map((id) => [id, condensationIn.get(id)!.size]),
  );
  const queue = sccIds.filter((id) => inDegree.get(id) === 0);
  while (queue.length > 0) {
    const v = queue.shift()!;
    topoOrder.push(v);
    for (const w of condensationOut.get(v)!) {
      inDegree.set(w, inDegree.get(w)! - 1);
      if (inDegree.get(w) === 0) queue.push(w);
    }
  }

  const reachable = new Set<string>();
  let wave = Array.from(entrySccIds);
  while (wave.length > 0) {
    const next: string[] = [];
    for (const v of wave) {
      if (reachable.has(v)) continue;
      reachable.add(v);
      for (const w of condensationOut.get(v) ?? []) {
        next.push(w);
      }
    }
    wave = next;
  }

  const depth = new Map<string, number>();
  for (const sccId of topoOrder) {
    if (!reachable.has(sccId)) continue;
    const preds = [...condensationIn.get(sccId)!].filter((p) =>
      reachable.has(p),
    );
    const maxPred =
      preds.length > 0 ? Math.max(...preds.map((p) => depth.get(p) ?? 0)) : 0;
    depth.set(sccId, maxPred + 1);
  }

  let maxDepth = 0;
  let maxScc: string | null = null;
  for (const sccId of reachable) {
    const d = depth.get(sccId) ?? 0;
    if (d > maxDepth) {
      maxDepth = d;
      maxScc = sccId;
    }
  }
  if (!maxScc) return [];

  const pathSccs: string[] = [];
  let curr: string | null = maxScc;
  while (curr) {
    pathSccs.unshift(curr);
    const preds: string[] = [...condensationIn.get(curr)!].filter((p) =>
      reachable.has(p),
    );
    const currDepth = depth.get(curr) ?? 0;
    const prevPred: string | undefined = preds.find(
      (p: string) => (depth.get(p) ?? 0) === currDepth - 1,
    );
    curr = prevPred ?? null;
  }

  const nodes: string[] = [];
  for (const sccId of pathSccs) {
    nodes.push(...(sccToNodes.get(sccId) ?? []));
  }
  return nodes;
}
