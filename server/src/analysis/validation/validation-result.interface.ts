import type { ArchitectureGraphDto } from '../dto/architecture-graph.dto.js';

/**
 * Ошибка валидации — блокирует запуск анализа.
 */
export interface ValidationError {
  ruleId: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
  /** source-target-kind для рёбер */
  details?: Record<string, unknown>;
}

/**
 * Предупреждение валидации — не блокирует анализ.
 */
export interface ValidationWarning {
  ruleId: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
  details?: Record<string, unknown>;
}

/**
 * Результат валидации модели архитектуры.
 * Анализ выполняется только при errors.length === 0.
 */
export interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  /** Нормализованный граф — только если errors.length === 0 */
  normalizedGraph?: ArchitectureGraphDto;
}
