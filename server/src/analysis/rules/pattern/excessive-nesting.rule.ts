import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import type { AnalysisIssue, AnalysisRule, GraphContext } from '../../interfaces/index.js';

export class ExcessiveNestingRule implements AnalysisRule {
  readonly id = 'P06';
  readonly description = 'Чрезмерная вложенность компонентов';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const components = ctx.nodesByKind.get('ui_component') ?? [];
    for (const node of components) {
      const nested = Number(node['nestedComponents']) || 0;
      if (nested > ANALYSIS_CONFIG.pattern.excessiveNestingThreshold) {
        issues.push({
          id: randomUUID(),
          severity: 'warning',
          category: 'maintainability',
          title: 'Чрезмерная вложенность компонентов',
          description: `Компонент "${node.id}" содержит ${nested} вложенных компонентов.`,
          affectedNodes: [node.id],
          recommendation: 'Разбейте компонент на более мелкие переиспользуемые части.',
          metrics: { nestedComponents: nested },
        });
      }
    }
    return issues;
  }
}
