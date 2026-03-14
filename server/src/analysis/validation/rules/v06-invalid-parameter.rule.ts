import type { ArchitectureGraphDto } from '../../dto/architecture-graph.dto.js';
import type { ValidationRule } from '../validation-rule.interface.js';
import type {
  ValidationError,
  ValidationWarning,
} from '../validation-result.interface.js';

/**
 * V06 InvalidParameter: requestRate < 0, reliability ∉ [0,1] → warning
 */
export class V06InvalidParameterRule implements ValidationRule {
  readonly ruleId = 'V06';

  check(graph: ArchitectureGraphDto): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const warnings: ValidationWarning[] = [];

    for (const node of graph.nodes) {
      const requestRate = node['requestRate'];
      if (requestRate !== undefined && typeof requestRate === 'number') {
        if (requestRate < 0 || !Number.isFinite(requestRate)) {
          warnings.push({
            ruleId: this.ruleId,
            message: `Node "${node.id}": requestRate must be >= 0 (got ${requestRate})`,
            nodeId: node.id,
            details: { requestRate, field: 'requestRate' },
          });
        }
      }

      const reliability = node['reliability'];
      if (reliability !== undefined && typeof reliability === 'number') {
        if (
          !Number.isFinite(reliability) ||
          reliability < 0 ||
          reliability > 1
        ) {
          warnings.push({
            ruleId: this.ruleId,
            message: `Node "${node.id}": reliability must be in [0,1] (got ${reliability})`,
            nodeId: node.id,
            details: { reliability, field: 'reliability' },
          });
        }
      }
    }

    return { errors: [], warnings };
  }
}
