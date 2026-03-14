import type { ArchitectureGraphDto } from '../../dto/architecture-graph.dto.js';
import type { ValidationRule } from '../validation-rule.interface.js';
import type {
  ValidationError,
  ValidationWarning,
} from '../validation-result.interface.js';

/**
 * V02 InvalidLayer: frontend→data direct → critical
 * Запрещённый переход слоёв — frontend не должен напрямую обращаться к data.
 */
export class V02InvalidLayerRule implements ValidationRule {
  readonly ruleId = 'V02';

  check(graph: ArchitectureGraphDto): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
    const errors: ValidationError[] = [];

    for (const edge of graph.edges) {
      const sourceNode = nodeById.get(edge.source);
      const targetNode = nodeById.get(edge.target);
      if (!sourceNode || !targetNode) continue;

      if (sourceNode.layer === 'frontend' && targetNode.layer === 'data') {
        errors.push({
          ruleId: this.ruleId,
          message: `Invalid layer transition: frontend→data (${edge.source} → ${edge.target})`,
          edgeId: edge.id,
          nodeId: edge.source,
          details: { source: edge.source, target: edge.target },
        });
      }
    }

    return { errors, warnings: [] };
  }
}
