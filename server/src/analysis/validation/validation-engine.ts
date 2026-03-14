import type { ArchitectureGraphDto } from '../dto/architecture-graph.dto.js';
import type { ValidationRule } from './validation-rule.interface.js';
import type { ValidationResult } from './validation-result.interface.js';
import {
  V01InvalidEdgeRule,
  V02InvalidLayerRule,
  V03DuplicateNodeRule,
  V04DuplicateEdgeRule,
  V05SelfLoopRule,
  V06InvalidParameterRule,
  V07OrphanReferenceRule,
} from './rules/index.js';

const DEFAULT_RULES: ValidationRule[] = [
  new V01InvalidEdgeRule(),
  new V02InvalidLayerRule(),
  new V03DuplicateNodeRule(),
  new V04DuplicateEdgeRule(),
  new V05SelfLoopRule(),
  new V06InvalidParameterRule(),
  new V07OrphanReferenceRule(),
];

/**
 * ValidationEngine — запуск правил валидации модели.
 * Возвращает ValidationResult; normalizedGraph заполняется только при errors.length === 0.
 */
export class ValidationEngine {
  constructor(private readonly rules: ValidationRule[] = DEFAULT_RULES) {}

  run(graph: ArchitectureGraphDto): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    for (const rule of this.rules) {
      const result = rule.check(graph);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }

    const validationResult: ValidationResult = {
      errors,
      warnings,
    };

    if (errors.length === 0) {
      validationResult.normalizedGraph = graph;
    }

    return validationResult;
  }
}
