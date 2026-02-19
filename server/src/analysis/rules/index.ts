import type { AnalysisRule } from '../interfaces/index.js';
import { structuralRules } from './structural/index.js';
import { patternRules } from './pattern/index.js';
import { loadRules } from './load/index.js';

export const allRules: AnalysisRule[] = [
  ...structuralRules,
  ...patternRules,
  ...loadRules,
];
