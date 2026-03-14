/**
 * AUTH-001: Тест импорта validation из analysis модуля
 */
import {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationRule,
} from '../index.js';

describe('validation module import', () => {
  it('should export ValidationResult', () => {
    const result: ValidationResult = {
      errors: [],
      warnings: [],
    };
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('should export ValidationError', () => {
    const err: ValidationError = {
      ruleId: 'V01',
      message: 'test',
    };
    expect(err.ruleId).toBe('V01');
  });

  it('should export ValidationWarning', () => {
    const warn: ValidationWarning = {
      ruleId: 'V04',
      message: 'test',
    };
    expect(warn.ruleId).toBe('V04');
  });

  it('should export ValidationRule interface', () => {
    const rule: ValidationRule = {
      ruleId: 'TEST',
      check: () => ({ errors: [], warnings: [] }),
    };
    expect(rule.ruleId).toBe('TEST');
    expect(rule.check({} as never).errors).toEqual([]);
  });
});
