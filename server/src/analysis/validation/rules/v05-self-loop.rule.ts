import type { ArchitectureGraphDto } from '../../dto/architecture-graph.dto.js';
import type { ValidationRule } from '../validation-rule.interface.js';
import type {
  ValidationError,
  ValidationWarning,
} from '../validation-result.interface.js';

/**
 * V05 SelfLoop: edge.source === edge.target → warning
 */
export class V05SelfLoopRule implements ValidationRule {
  readonly ruleId = 'V05';

  check(graph: ArchitectureGraphDto): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const warnings: ValidationWarning[] = [];

    for (const edge of graph.edges) {
      if (edge.source === edge.target) {
        warnings.push({
          ruleId: this.ruleId,
          message: `Self-loop on node "${edge.source}" (edge ${edge.id})`,
          edgeId: edge.id,
          nodeId: edge.source,
          details: { source: edge.source, target: edge.target },
        });
      }
    }

    return { errors: [], warnings };
  }
}
