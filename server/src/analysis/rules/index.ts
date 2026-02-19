import type { AnalysisRule } from '../interfaces/index.js';
import { structuralRules } from './structural/index.js';

export const allRules: AnalysisRule[] = [
  ...structuralRules,
];
