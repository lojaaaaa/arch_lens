import type {
  ArchitectureNodeDto,
  GraphEdgeDto,
} from '../dto/architecture-graph.dto.js';

/**
 * Pre-computed graph data shared across all rules.
 * Built once per analysis run to avoid redundant computation.
 */
export interface GraphContext {
  nodes: ArchitectureNodeDto[];
  edges: GraphEdgeDto[];

  nodeById: Map<string, ArchitectureNodeDto>;
  incomingCount: Map<string, number>;
  outgoingCount: Map<string, number>;

  adjacency: Map<string, string[]>;

  nodesByLayer: {
    frontend: ArchitectureNodeDto[];
    backend: ArchitectureNodeDto[];
    data: ArchitectureNodeDto[];
  };

  nodesByKind: Map<string, ArchitectureNodeDto[]>;
}
