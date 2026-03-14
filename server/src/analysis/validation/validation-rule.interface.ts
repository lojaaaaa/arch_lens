import type { ArchitectureGraphDto } from '../dto/architecture-graph.dto.js';
import type {
  ValidationError,
  ValidationWarning,
} from './validation-result.interface.js';

/**
 * Результат проверки одного правила валидации.
 */
export interface ValidationRuleResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Правило валидации модели архитектуры.
 * Каждое правило проверяет граф и возвращает найденные ошибки и предупреждения.
 */
export interface ValidationRule {
  readonly ruleId: string;
  check(graph: ArchitectureGraphDto): ValidationRuleResult;
}
