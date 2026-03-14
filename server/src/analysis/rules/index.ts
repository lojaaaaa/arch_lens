import type { AnalysisRule } from '../interfaces/index.js';
import { structuralRules } from './structural/index.js';
import { patternRules } from './pattern/index.js';
import { loadRules } from './load/index.js';

export const allRules: AnalysisRule[] = [
  ...structuralRules,
  ...patternRules,
  ...loadRules,
];

export const RULES_VERSION = '1.0';

/** Для SmellEngine: structural + pattern (архитектурные паттерны) */
export const smellStructuralRules: AnalysisRule[] = [
  ...structuralRules,
  ...patternRules,
];

/** Для SmellEngine: performance (latency, cache, bottleneck, render, api overload) */
export const smellPerformanceRules: AnalysisRule[] = loadRules.filter(
  (rule) => rule.id !== 'L05',
);

/** Для SmellEngine: reliability (L05 External dependency risk) */
export const smellReliabilityRules: AnalysisRule[] = loadRules.filter(
  (rule) => rule.id === 'L05',
);
