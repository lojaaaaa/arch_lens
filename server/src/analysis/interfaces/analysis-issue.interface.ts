export type IssueSeverity = 'info' | 'warning' | 'critical';

export type IssueCategory =
  | 'performance'
  | 'scalability'
  | 'maintainability'
  | 'architecture'
  | 'reliability'
  | 'security';

export interface AnalysisIssue {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  description: string;
  affectedNodes: string[];
  affectedEdges?: string[];
  recommendation?: string;
  metrics?: Record<string, number>;
}
