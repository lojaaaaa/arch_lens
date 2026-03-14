import type { ArchitectureGraphDto } from '../../dto/architecture-graph.dto.js';
import type { ValidationRule } from '../validation-rule.interface.js';
import type {
  ValidationError,
  ValidationWarning,
} from '../validation-result.interface.js';

/**
 * V02 InvalidLayer: frontend→data direct → warning (не блокирует анализ).
 * Архитектурная проблема обнаруживается также правилом S06 (Frontend→DB direct).
 */
export class V02InvalidLayerRule implements ValidationRule {
  readonly ruleId = 'V02';

  check(graph: ArchitectureGraphDto): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
    const warnings: ValidationWarning[] = [];

    for (const edge of graph.edges) {
      const sourceNode = nodeById.get(edge.source);
      const targetNode = nodeById.get(edge.target);
      if (!sourceNode || !targetNode) continue;

      if (sourceNode.layer === 'frontend' && targetNode.layer === 'data') {
        warnings.push({
          ruleId: this.ruleId,
          message: `Invalid layer transition: frontend→data (${edge.source} → ${edge.target})`,
          edgeId: edge.id,
          nodeId: edge.source,
          details: { source: edge.source, target: edge.target },
        });
      }
    }

    return { errors: [], warnings };
  }
}
