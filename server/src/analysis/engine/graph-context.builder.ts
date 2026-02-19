import type { ArchitectureGraphDto } from '../dto/architecture-graph.dto.js';
import type { GraphContext } from '../interfaces/index.js';

export function buildGraphContext(graph: ArchitectureGraphDto): GraphContext {
  const { nodes, edges } = graph;

  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  const incomingCount = new Map<string, number>();
  const outgoingCount = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const edge of edges) {
    outgoingCount.set(edge.source, (outgoingCount.get(edge.source) ?? 0) + 1);
    incomingCount.set(edge.target, (incomingCount.get(edge.target) ?? 0) + 1);

    const neighbors = adjacency.get(edge.source) ?? [];
    neighbors.push(edge.target);
    adjacency.set(edge.source, neighbors);
  }

  const nodesByLayer = {
    frontend: nodes.filter((n) => n.layer === 'frontend'),
    backend: nodes.filter((n) => n.layer === 'backend'),
    data: nodes.filter((n) => n.layer === 'data'),
  };

  const nodesByKind = new Map<string, typeof nodes>();
  for (const node of nodes) {
    const group = nodesByKind.get(node.kind) ?? [];
    group.push(node);
    nodesByKind.set(node.kind, group);
  }

  return {
    nodes,
    edges,
    nodeById,
    incomingCount,
    outgoingCount,
    adjacency,
    nodesByLayer,
    nodesByKind,
  };
}
