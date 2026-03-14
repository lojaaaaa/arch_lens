/**
 * Derive complexity из kind-specific полей (V2-A1).
 * NODE-PROPERTIES-DESIGN: service=ops+external+stateful, api_gateway=endpoints, ui_page=components+state, и т.д.
 * Нормализация raw → 1–5 по порогам из analysis.config.
 */

import { ANALYSIS_CONFIG } from '../analysis.config.js';
import type { ArchitectureNodeDto } from '../dto/architecture-graph.dto.js';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeToScale(raw: number, scale: readonly number[]): number {
  const thresholds =
    scale && scale.length >= 2 ? scale : [0, 5, 10, 15, 20, 25];
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (raw < thresholds[i + 1]) {
      return clamp(i + 1, 1, 5);
    }
  }
  return 5;
}

/**
 * Вычисляет complexity (1–5) из kind-specific полей узла.
 * При отсутствии данных — fallback на node.complexity ?? 1.
 */
function toNum(x: unknown): number {
  const value = Number(x);
  return Number.isFinite(value) ? value : 0;
}

export function deriveNodeComplexity(
  node: ArchitectureNodeDto & Record<string, unknown>,
): number {
  const cfg = (ANALYSIS_CONFIG as { deriveComplexity?: unknown })
    .deriveComplexity as
    | {
        scale?: readonly number[];
        maxRaw?: number;
        service?: unknown;
        uiPage?: unknown;
        uiComponent?: unknown;
      }
    | undefined;
  const scale = cfg?.scale ?? ([0, 5, 10, 15, 20, 25] as const);
  const maxRaw = cfg?.maxRaw ?? 25;

  let raw = 0;
  let hasData = false;

  switch (node.kind) {
    case 'service': {
      const ops = toNum(node.operationsCount);
      const ext = toNum(node.externalCalls);
      const stateful = node.stateful === true ? 1 : 0;
      const t =
        (cfg?.service as {
          ops?: number;
          external?: number;
          stateful?: number;
        }) ?? {};
      raw = ops + ext + stateful * (t.stateful ?? 2);
      hasData = ops > 0 || ext > 0;
      break;
    }
    case 'api_gateway': {
      const ep = toNum(node.endpointsCount);
      raw = ep;
      hasData = ep > 0;
      break;
    }
    case 'ui_page': {
      const comp = toNum(node.componentsCount);
      const stateBonus = node.stateUsage && node.stateUsage !== 'none' ? 1 : 0;
      const t =
        (cfg?.uiPage as { components?: number; stateBonus?: number }) ?? {};
      raw = comp + stateBonus * (t.stateBonus ?? 1);
      hasData = comp > 0 || stateBonus > 0;
      break;
    }
    case 'ui_component': {
      const nested = toNum(node.nestedComponents);
      const props = toNum(node.propsCount);
      const stateBonus = node.stateType && node.stateType !== 'none' ? 1 : 0;
      const t =
        (cfg?.uiComponent as {
          nested?: number;
          props?: number;
          stateBonus?: number;
        }) ?? {};
      raw = nested + Math.floor(props / 2) + stateBonus * (t.stateBonus ?? 1);
      hasData = nested > 0 || props > 0 || stateBonus > 0;
      break;
    }
    case 'state_store': {
      const sub = toNum(node.subscribersCount);
      raw = sub;
      hasData = sub > 0;
      break;
    }
    case 'database': {
      const tables = toNum(node.tablesCount);
      raw = tables;
      hasData = tables > 0;
      break;
    }
    case 'cache':
    case 'external_system':
    case 'system':
    default:
      raw = 1;
      hasData = false;
      break;
  }

  raw = Math.min(raw, maxRaw);
  if (hasData) {
    return normalizeToScale(raw, scale);
  }
  return clamp(toNum(node.complexity) || 1, 1, 5);
}
