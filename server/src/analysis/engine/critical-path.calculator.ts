import { ANALYSIS_CONFIG } from '../analysis.config.js';
import type { ArchitectureNodeDto } from '../dto/architecture-graph.dto.js';
import type { GraphContext } from '../interfaces/index.js';
import { tarjanSCC } from './tarjan-scc.js';

/** Latency в мс из DTO или fallback из конфига по kind. */
export function getNodeLatencyMs(node: ArchitectureNodeDto): number {
  const raw = Number(node['latencyMs']);
  if (Number.isFinite(raw) && raw >= 0) return raw;

  return ANALYSIS_CONFIG.defaultLatencyMs[node.kind] ?? 0;
}

/**
 * Critical path = путь с максимальной суммарной latency (latency-weighted).
 * Используется condensation graph (Tarjan SCC) + DP на DAG за O(V+E).
 */
export function calculateCriticalPath(ctx: GraphContext): {
  totalMs: number;
  pathNodeIds: string[];
} {
  if (ctx.nodes.length === 0) return { totalMs: 0, pathNodeIds: [] };

  const { sccByNode, sccs } = tarjanSCC(ctx);
  const sccIds = sccs.map((_, i) => `scc_${i}`);
  const sccToNodes = new Map(sccIds.map((id, i) => [id, sccs[i]]));

  const sccLatency = new Map<string, number>();
  for (const [sccId, nodeIds] of sccToNodes) {
    let total = 0;
    for (const nid of nodeIds) {
      const node = ctx.nodeById.get(nid);
      if (node) total += getNodeLatencyMs(node);
    }
    sccLatency.set(sccId, total);
  }

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

  const { entryPoints, nodeById } = ctx;
  const entrySccIds = new Set(
    entryPoints
      .filter((id) => nodeById.has(id))
      .map((id) => sccByNode.get(id)!),
  );

  const reachable = new Set<string>();
  if (entrySccIds.size > 0) {
    let wave = Array.from(entrySccIds);
    while (wave.length > 0) {
      const next: string[] = [];
      for (const v of wave) {
        if (reachable.has(v)) continue;
        reachable.add(v);
        for (const w of condensationOut.get(v) ?? []) next.push(w);
      }
      wave = next;
    }
  } else {
    for (const id of sccIds) reachable.add(id);
  }

  const dist = new Map<string, number>();
  const pred = new Map<string, string | null>();

  for (const sccId of topoOrder) {
    if (!reachable.has(sccId)) continue;
    const preds = [...condensationIn.get(sccId)!].filter((p) =>
      reachable.has(p),
    );
    let bestPred: string | null = null;
    let bestDist = 0;
    for (const p of preds) {
      const d = dist.get(p) ?? 0;
      if (d > bestDist) {
        bestDist = d;
        bestPred = p;
      }
    }
    dist.set(sccId, bestDist + (sccLatency.get(sccId) ?? 0));
    pred.set(sccId, bestPred);
  }

  let maxDist = 0;
  let maxScc: string | null = null;
  for (const sccId of reachable) {
    const d = dist.get(sccId) ?? 0;
    if (d > maxDist) {
      maxDist = d;
      maxScc = sccId;
    }
  }
  if (!maxScc) return { totalMs: 0, pathNodeIds: [] };

  const pathSccs: string[] = [];
  let curr: string | null = maxScc;
  while (curr) {
    pathSccs.unshift(curr);
    curr = pred.get(curr) ?? null;
  }

  const pathNodeIds: string[] = [];
  for (const sccId of pathSccs) {
    pathNodeIds.push(...(sccToNodes.get(sccId) ?? []));
  }

  return { totalMs: Math.round(maxDist), pathNodeIds };
}
