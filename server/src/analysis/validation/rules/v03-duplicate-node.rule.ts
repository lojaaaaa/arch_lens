import type { ArchitectureGraphDto } from '../../dto/architecture-graph.dto.js';
import type { ValidationRule } from '../validation-rule.interface.js';
import type {
  ValidationError,
  ValidationWarning,
} from '../validation-result.interface.js';

/**
 * V03 DuplicateNode: дубликат node.id → critical
 */
export class V03DuplicateNodeRule implements ValidationRule {
  readonly ruleId = 'V03';

  check(graph: ArchitectureGraphDto): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const seen = new Map<string, number[]>();
    const errors: ValidationError[] = [];

    graph.nodes.forEach((node, index) => {
      const indices = seen.get(node.id) ?? [];
      indices.push(index);
      seen.set(node.id, indices);
    });

    for (const [nodeId, indices] of seen) {
      if (indices.length > 1) {
        errors.push({
          ruleId: this.ruleId,
          message: `Duplicate node id: "${nodeId}" (${indices.length} occurrences)`,
          nodeId,
          details: { occurrences: indices.length },
        });
      }
    }

    return { errors, warnings: [] };
  }
}
