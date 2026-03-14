import type { ArchitectureNodeDto } from '../dto/architecture-graph.dto.js';

/** Capacity (rps) из DTO или assumption. 0 = нет данных, правило не срабатывает. */
export function getNodeCapacityRps(node: ArchitectureNodeDto): number | null {
  switch (node.kind) {
    case 'api_gateway': {
      const rate = Number(node['requestRate']);
      return Number.isFinite(rate) && rate > 0 ? rate : null;
    }
    case 'external_system': {
      const rate = Number(node['rateLimit']);
      return Number.isFinite(rate) && rate > 0 ? rate : null;
    }
    case 'service':
    case 'database':
      return 1000;
    default:
      return null;
  }
}
