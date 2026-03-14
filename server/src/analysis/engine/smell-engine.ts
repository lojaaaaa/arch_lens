import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../interfaces/index.js';

export type RuleCategory = 'structural' | 'performance' | 'reliability';

/**
 * SmellEngine — централизованный запуск правил по категориям.
 * Добавление нового правила — только регистрация, без изменения engine.
 */
export class SmellEngine {
  private readonly structuralRules: AnalysisRule[] = [];
  private readonly performanceRules: AnalysisRule[] = [];
  private readonly reliabilityRules: AnalysisRule[] = [];

  registerStructuralRule(rule: AnalysisRule): void {
    this.structuralRules.push(rule);
  }

  registerPerformanceRule(rule: AnalysisRule): void {
    this.performanceRules.push(rule);
  }

  registerReliabilityRule(rule: AnalysisRule): void {
    this.reliabilityRules.push(rule);
  }

  registerStructuralRules(rules: AnalysisRule[]): void {
    for (const rule of rules) this.registerStructuralRule(rule);
  }

  registerPerformanceRules(rules: AnalysisRule[]): void {
    for (const rule of rules) this.registerPerformanceRule(rule);
  }

  registerReliabilityRules(rules: AnalysisRule[]): void {
    for (const rule of rules) this.registerReliabilityRule(rule);
  }

  run(category: RuleCategory, context: GraphContext): AnalysisIssue[] {
    const rules =
      category === 'structural'
        ? this.structuralRules
        : category === 'performance'
          ? this.performanceRules
          : this.reliabilityRules;

    const issues: AnalysisIssue[] = [];
    for (const rule of rules) {
      issues.push(...rule.check(context));
    }
    return issues;
  }

  runAll(context: GraphContext): AnalysisIssue[] {
    return [
      ...this.run('structural', context),
      ...this.run('performance', context),
      ...this.run('reliability', context),
    ];
  }

  get registeredStructuralRules(): readonly AnalysisRule[] {
    return this.structuralRules;
  }

  get registeredPerformanceRules(): readonly AnalysisRule[] {
    return this.performanceRules;
  }

  get registeredReliabilityRules(): readonly AnalysisRule[] {
    return this.reliabilityRules;
  }
}
