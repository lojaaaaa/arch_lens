import type { GraphContext } from '../interfaces/index.js';

/**
 * Tarjan's algorithm for strongly connected components.
 * Returns: { sccByNode: Map<nodeId, sccId>, sccs: string[][] }
 */
export function tarjanSCC(ctx: GraphContext): {
  sccByNode: Map<string, string>;
  sccs: string[][];
} {
  const { nodeById, outgoingEdges } = ctx;
  const nodeIds = Array.from(nodeById.keys());
  const index = new Map<string, number>();
  const lowlink = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const sccs: string[][] = [];
  const sccByNode = new Map<string, string>();
  let nextIndex = 0;

  function strongConnect(v: string): void {
    index.set(v, nextIndex);
    lowlink.set(v, nextIndex);
    nextIndex++;
    stack.push(v);
    onStack.add(v);

    const outEdges = outgoingEdges.get(v) ?? [];
    for (const edge of outEdges) {
      const w = edge.target;
      if (!nodeById.has(w)) continue;
      if (!index.has(w)) {
        strongConnect(w);
        lowlink.set(v, Math.min(lowlink.get(v)!, lowlink.get(w)!));
      } else if (onStack.has(w)) {
        lowlink.set(v, Math.min(lowlink.get(v)!, index.get(w)!));
      }
    }

    if (lowlink.get(v) === index.get(v)) {
      const scc: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        scc.push(w);
      } while (w !== v);
      const sccId = `scc_${sccs.length}`;
      for (const n of scc) {
        sccByNode.set(n, sccId);
      }
      sccs.push(scc);
    }
  }

  for (const v of nodeIds) {
    if (!index.has(v)) {
      strongConnect(v);
    }
  }

  return { sccByNode, sccs };
}
