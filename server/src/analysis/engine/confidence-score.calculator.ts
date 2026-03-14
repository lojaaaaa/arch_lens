import type { ArchitectureGraphDto } from '../dto/architecture-graph.dto.js';

const RELEVANT_NODE_FIELDS: Record<string, string[]> = {
  api_gateway: ['requestRate', 'latencyMs', 'endpointsCount'],
  service: ['latencyMs', 'operationsCount', 'externalCalls', 'capacityRps'],
  database: ['latencyMs', 'readWriteRatio', 'tablesCount'],
  cache: ['latencyMs', 'readWriteRatio', 'hitRate', 'capacityRps'],
  external_system: ['latencyMs', 'reliability', 'rateLimit'],
  system: [
    'targetAvailability',
    'targetThroughputRps',
    'latencySloMs',
    'deploymentModel',
  ],
  ui_page: ['componentsCount', 'updateFrequency', 'stateUsage'],
  ui_component: ['nestedComponents', 'propsCount', 'renderFrequency'],
  state_store: ['subscribersCount', 'updateFrequency'],
};

/**
 * Confidence Score (0–1): availableMetrics / totalMetrics.
 * Показывает, насколько заполнены поля для расчёта анализа.
 * Если нет релевантных узлов (total=0) — возвращаем 0.5 (недостаточно данных).
 */
export function calculateConfidenceScore(graph: ArchitectureGraphDto): number {
  let total = 0;
  let available = 0;

  for (const node of graph.nodes) {
    const fields = RELEVANT_NODE_FIELDS[node.kind];
    if (!fields) continue;
    for (const field of fields) {
      total++;
      const value = node[field];
      if (
        value !== undefined &&
        value !== null &&
        (typeof value !== 'number' || Number.isFinite(value))
      ) {
        available++;
      }
    }
  }

  for (const edge of graph.edges) {
    if (
      edge.kind === 'calls' ||
      edge.kind === 'reads' ||
      edge.kind === 'writes'
    ) {
      total++;
      if (edge.synchronous !== undefined && edge.synchronous !== null) {
        available++;
      }
    }
  }

  if (total === 0) {
    return 0.5;
  }
  return available / total;
}
