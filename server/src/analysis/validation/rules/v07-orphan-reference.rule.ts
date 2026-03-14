import type { ArchitectureGraphDto } from '../../dto/architecture-graph.dto.js';
import type { ValidationRule } from '../validation-rule.interface.js';
import type {
  ValidationError,
  ValidationWarning,
} from '../validation-result.interface.js';

/**
 * V07 OrphanReference: Edge ссылается на удалённый узел.
 * В текущей модели покрывается V01 InvalidEdge — при отсутствии source/target в nodes
 * V01 уже добавляет critical errors. V07 оставлен для расширяемости (напр. soft-deleted nodes).
 */
export class V07OrphanReferenceRule implements ValidationRule {
  readonly ruleId = 'V07';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- interface requires param
  check(graph: ArchitectureGraphDto): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
  } {
    // Orphan refs = edges to missing nodes. V01 handles this.
    // If we later support "removed" nodes or soft-delete, V07 would check that.
    return { errors: [], warnings: [] };
  }
}
