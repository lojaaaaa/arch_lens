import { randomUUID } from 'node:crypto';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

/**
 * Семантически допустимые комбинации (sourceKind, targetKind) -> edge kinds.
 * reads/writes — доступ к данным (БД, кэш).
 * calls — вызовы сервисов/API.
 * subscribes/emits — событийная модель.
 */
const VALID_EDGE_SEMANTICS: Record<
  string,
  Record<string, readonly string[]>
> = {
  ui_page: {
    ui_component: ['depends_on'],
    system: ['depends_on'],
    api_gateway: ['calls'],
  },
  ui_component: {
    ui_component: ['depends_on'],
    state_store: ['reads', 'writes', 'subscribes'],
    api_gateway: ['calls'],
  },
  state_store: {
    ui_component: ['emits'],
  },
  system: {},
  api_gateway: {
    service: ['calls'],
  },
  service: {
    service: ['calls', 'emits', 'subscribes', 'depends_on'],
    database: ['reads', 'writes'],
    cache: ['reads', 'writes'],
    external_system: ['calls', 'emits'],
  },
  database: {},
  cache: {},
  external_system: {},
};

function isSemanticallyValid(
  sourceKind: string,
  targetKind: string,
  edgeKind: string,
): boolean {
  const allowed = VALID_EDGE_SEMANTICS[sourceKind]?.[targetKind];
  if (!allowed) return false;
  return allowed.includes(edgeKind);
}

const KIND_LABELS: Record<string, string> = {
  reads: 'Чтение',
  writes: 'Запись',
  calls: 'Вызов',
  subscribes: 'Подписка',
  emits: 'Событие',
  depends_on: 'Зависит от',
};

export class EdgeSemanticsRule implements AnalysisRule {
  readonly id = 'P09';
  readonly description =
    'Семантика связей: reads/writes для данных, calls для сервисов';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];

    for (const edge of ctx.edges) {
      const sourceNode = ctx.nodeById.get(edge.source);
      const targetNode = ctx.nodeById.get(edge.target);

      if (!sourceNode || !targetNode) continue;

      const sourceKind = sourceNode.kind;
      const targetKind = targetNode.kind;

      if (!isSemanticallyValid(sourceKind, targetKind, edge.kind)) {
        const kindLabel = KIND_LABELS[edge.kind] ?? edge.kind;
        issues.push({
          id: randomUUID(),
          ruleId: this.id,
          severity: 'warning',
          category: 'architecture',
          title: 'Некорректная семантика связи',
          description: `Связь "${kindLabel}" от ${sourceKind} к ${targetKind} не имеет смысла. Например: reads/writes — для доступа к данным (БД, кэш), calls — для вызовов сервисов.`,
          affectedNodes: [edge.source, edge.target],
          affectedEdges: [edge.id],
          recommendation:
            'Исправьте тип связи в соответствии с семантикой (calls для API, reads/writes для данных).',
        });
      }
    }

    return issues;
  }
}
