import type {
  ArchitectureGraphDto,
  GraphEdgeDto,
} from '../dto/architecture-graph.dto.js';
import type { GraphContext } from '../interfaces/index.js';

/**
 * Entry points: api_gateway без входящих от frontend, ui_page без входящих.
 * AUTH-005: getEntryPoints(ctx) возвращает entryPointIds.
 */
export function getEntryPoints(ctx: GraphContext): string[] {
  return ctx.entryPoints;
}

function getEntryPointsFromGraph(
  nodes: ArchitectureGraphDto['nodes'],
  incomingEdges: Map<string, GraphEdgeDto[]>,
  nodeById: Map<string, (typeof nodes)[0]>,
): string[] {
  const entryPoints: string[] = [];

  for (const node of nodes) {
    const incoming = incomingEdges.get(node.id) ?? [];

    if (node.kind === 'ui_page' && incoming.length === 0) {
      entryPoints.push(node.id);
      continue;
    }

    if (node.kind === 'api_gateway') {
      const hasIncomingFromFrontend = incoming.some((edge) => {
        const src = nodeById.get(edge.source);
        return src?.layer === 'frontend';
      });
      if (!hasIncomingFromFrontend) {
        entryPoints.push(node.id);
      }
    }
  }

  return entryPoints;
}

export function buildGraphContext(graph: ArchitectureGraphDto): GraphContext {
  const { nodes, edges } = graph;

  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  const incomingCount = new Map<string, number>();
  const outgoingCount = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  const outgoingEdges = new Map<string, GraphEdgeDto[]>();
  const incomingEdges = new Map<string, GraphEdgeDto[]>();

  for (const edge of edges) {
    outgoingCount.set(edge.source, (outgoingCount.get(edge.source) ?? 0) + 1);
    incomingCount.set(edge.target, (incomingCount.get(edge.target) ?? 0) + 1);

    const outList = outgoingEdges.get(edge.source) ?? [];
    outList.push(edge);
    outgoingEdges.set(edge.source, outList);

    const inList = incomingEdges.get(edge.target) ?? [];
    inList.push(edge);
    incomingEdges.set(edge.target, inList);

    const neighbors = adjacency.get(edge.source) ?? [];
    neighbors.push(edge.target);
    adjacency.set(edge.source, neighbors);
  }

  const entryPoints = getEntryPointsFromGraph(nodes, incomingEdges, nodeById);

  const nodesByLayer = {
    frontend: nodes.filter((node) => node.layer === 'frontend'),
    backend: nodes.filter((node) => node.layer === 'backend'),
    data: nodes.filter((node) => node.layer === 'data'),
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
    outgoingEdges,
    incomingEdges,
    entryPoints,
    incomingCount,
    outgoingCount,
    adjacency,
    nodesByLayer,
    nodesByKind,
  };
}
