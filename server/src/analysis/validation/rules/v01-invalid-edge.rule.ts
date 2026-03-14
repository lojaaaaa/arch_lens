import type { ArchitectureGraphDto } from '../../dto/architecture-graph.dto.js';
import type { ValidationRule } from '../validation-rule.interface.js';
import type {
  ValidationError,
  ValidationWarning,
} from '../validation-result.interface.js';

/**
 * V01 InvalidEdge (MissingNode): source или target не в nodes → critical
 */
export class V01InvalidEdgeRule implements ValidationRule {
  readonly ruleId = 'V01';

  check(graph: ArchitectureGraphDto): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const nodeIds = new Set(graph.nodes.map((node) => node.id));
    const errors: ValidationError[] = [];

    for (const edge of graph.edges) {
      const sourceMissing = !nodeIds.has(edge.source);
      const targetMissing = !nodeIds.has(edge.target);
      if (sourceMissing || targetMissing) {
        const missing = [sourceMissing && 'source', targetMissing && 'target']
          .filter(Boolean)
          .join(', ');
        errors.push({
          ruleId: this.ruleId,
          message: `Edge ${edge.id}: ${missing} not in nodes (source: ${edge.source}, target: ${edge.target})`,
          edgeId: edge.id,
          details: { source: edge.source, target: edge.target },
        });
      }
    }

    return { errors, warnings: [] };
  }
}
