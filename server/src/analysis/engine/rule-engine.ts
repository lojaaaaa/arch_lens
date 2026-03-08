import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../interfaces/index.js';

export class RuleEngine {
  private readonly rules: AnalysisRule[] = [];

  register(rule: AnalysisRule): void {
    this.rules.push(rule);
  }

  registerAll(rules: AnalysisRule[]): void {
    for (const rule of rules) {
      this.register(rule);
    }
  }

  run(context: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];

    for (const rule of this.rules) {
      const found = rule.check(context);
      issues.push(...found);
    }

    return issues;
  }

  get registeredRules(): readonly AnalysisRule[] {
    return this.rules;
  }
}
