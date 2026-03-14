import type { ArchitectureGraphDto } from '../../dto/architecture-graph.dto.js';
import type { ValidationRule } from '../validation-rule.interface.js';
import type {
  ValidationError,
  ValidationWarning,
} from '../validation-result.interface.js';

/**
 * V04 DuplicateEdge: дубликат (source, target, kind) → warning
 */
export class V04DuplicateEdgeRule implements ValidationRule {
  readonly ruleId = 'V04';

  check(graph: ArchitectureGraphDto): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    const key = (edge: { source: string; target: string; kind: string }) =>
      `${edge.source}→${edge.target}:${edge.kind}`;
    const seen = new Map<string, string[]>();
    const warnings: ValidationWarning[] = [];

    for (const edge of graph.edges) {
      const k = key(edge);
      const ids = seen.get(k) ?? [];
      ids.push(edge.id);
      seen.set(k, ids);
    }

    for (const [edgeKey, edgeIds] of seen) {
      if (edgeIds.length > 1) {
        warnings.push({
          ruleId: this.ruleId,
          message: `Duplicate edge: ${edgeKey} (${edgeIds.length} occurrences)`,
          edgeId: edgeIds[0],
          details: { edgeKey, count: edgeIds.length, edgeIds },
        });
      }
    }

    return { errors: [], warnings };
  }
}
