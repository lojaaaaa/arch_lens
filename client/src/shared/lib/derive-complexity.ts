import type { ArchitectureNode } from '@/shared/model/types';

const SCALE = [0, 5, 10, 15, 20, 25];

function toNum(x: unknown): number {
    const v = Number(x);
    return Number.isFinite(v) ? v : 0;
}

function normalize(raw: number): number {
    for (let i = 0; i < SCALE.length - 1; i++) {
        if (raw < SCALE[i + 1]) {
            return Math.max(1, Math.min(5, i + 1));
        }
    }
    return 5;
}

export function deriveComplexity(node: ArchitectureNode): number {
    const n = node as ArchitectureNode & Record<string, unknown>;
    let raw = 0;
    let hasData = false;

    switch (node.kind) {
        case 'service': {
            const ops = toNum(n.operationsCount);
            const ext = toNum(n.externalCalls);
            const stateful = n.stateful === true ? 2 : 0;
            raw = ops + ext + stateful;
            hasData = ops > 0 || ext > 0;
            break;
        }
        case 'api_gateway': {
            raw = toNum(n.endpointsCount);
            hasData = raw > 0;
            break;
        }
        case 'ui_page': {
            const comp = toNum(n.componentsCount);
            const stateBonus = n.stateUsage && n.stateUsage !== 'none' ? 1 : 0;
            raw = comp + stateBonus;
            hasData = comp > 0 || stateBonus > 0;
            break;
        }
        case 'ui_component': {
            const nested = toNum(n.nestedComponents);
            const props = toNum(n.propsCount);
            const stateBonus = n.stateType && n.stateType !== 'none' ? 1 : 0;
            raw = nested + Math.floor(props / 2) + stateBonus;
            hasData = nested > 0 || props > 0 || stateBonus > 0;
            break;
        }
        case 'state_store':
            raw = toNum(n.subscribersCount);
            hasData = raw > 0;
            break;
        case 'database':
            raw = toNum(n.tablesCount);
            hasData = raw > 0;
            break;
        default:
            return Math.max(1, Math.min(5, toNum(n.complexity) || 1));
    }

    raw = Math.min(raw, 25);
    return hasData
        ? normalize(raw)
        : Math.max(1, Math.min(5, toNum(n.complexity) || 1));
}
