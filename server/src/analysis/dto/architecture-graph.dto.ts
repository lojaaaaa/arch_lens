export class PositionDto {
  x: number;
  y: number;
}

export class ArchitectureNodeDto {
  id: string;
  kind: string;
  layer: string;
  position: PositionDto;
  complexity: number;
  criticality: number;
  [key: string]: unknown;
}

export class GraphEdgeDto {
  id: string;
  source: string;
  target: string;
  kind: string;
  frequency?: number;
  synchronous?: boolean;
}

export class GraphMetaDto {
  name: string;
  version: number;
  createdAt: string;
}

export class ArchitectureGraphDto {
  meta: GraphMetaDto;
  nodes: ArchitectureNodeDto[];
  edges: GraphEdgeDto[];
}
