import type { ArchitectureNodeDto } from '../dto/architecture-graph.dto.js';

function readPositiveNumber(
  node: ArchitectureNodeDto,
  field: string,
): number | null {
  const raw = Number(node[field]);
  return Number.isFinite(raw) && raw > 0 ? raw : null;
}

/** Capacity (rps) из DTO (`capacityRps`) или kind-specific fallback. null = нет данных. */
export function getNodeCapacityRps(node: ArchitectureNodeDto): number | null {
  const explicit = readPositiveNumber(node, 'capacityRps');
  if (explicit !== null) return explicit;

  switch (node.kind) {
    case 'external_system':
      return readPositiveNumber(node, 'rateLimit');
    case 'api_gateway':
    case 'service':
    case 'database':
    case 'cache':
      return null;
    default:
      return null;
  }
}
