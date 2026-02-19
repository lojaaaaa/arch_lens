import type { AnalysisIssue } from './analysis-issue.interface.js';
import type { GraphContext } from './graph-context.interface.js';

export interface AnalysisRule {
  readonly id: string;
  readonly description: string;

  check(context: GraphContext): AnalysisIssue[];
}
