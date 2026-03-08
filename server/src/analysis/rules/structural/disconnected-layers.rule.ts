import { randomUUID } from 'node:crypto';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class DisconnectedLayersRule implements AnalysisRule {
  readonly id = 'S08';
  readonly description =
    'Слои без связей с другими слоями — возможная архитектурная ошибка';

  check(ctx: GraphContext): AnalysisIssue[] {
    const layers = ['frontend', 'backend', 'data'] as const;
    const layersWithCrossConnections = new Set<string>();

    for (const edge of ctx.edges) {
      const sourceNode = ctx.nodeById.get(edge.source);
      const targetNode = ctx.nodeById.get(edge.target);
      if (sourceNode && targetNode && sourceNode.layer !== targetNode.layer) {
        layersWithCrossConnections.add(sourceNode.layer);
        layersWithCrossConnections.add(targetNode.layer);
      }
    }

    const issues: AnalysisIssue[] = [];

    for (const layer of layers) {
      const layerNodes = ctx.nodesByLayer[layer] ?? [];
      if (layerNodes.length === 0) continue;
      if (layersWithCrossConnections.has(layer)) continue;

      issues.push({
        id: randomUUID(),
        ruleId: this.id,
        severity: 'warning',
        category: 'architecture',
        title: 'Отключённый слой',
        description: `Слой "${layer}" содержит узлы, но не имеет связей с другими слоями. Данный слой изолирован от остальной архитектуры.`,
        affectedNodes: layerNodes.map((n) => n.id),
        recommendation:
          'Убедитесь, что слой должен быть изолирован. Если нет — добавьте связи с другими слоями (frontend↔backend↔data).',
      });
    }

    return issues;
  }
}
