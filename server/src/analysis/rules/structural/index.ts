import type { AnalysisRule } from '../../interfaces/index.js';
import { OrphanNodesRule } from './orphan-nodes.rule.js';
import { CyclicDependenciesRule } from './cyclic-dependencies.rule.js';
import { HighFanOutRule } from './high-fan-out.rule.js';
import { DirectUiStateRule } from './direct-ui-state.rule.js';

export const structuralRules: AnalysisRule[] = [
  new OrphanNodesRule(),
  new CyclicDependenciesRule(),
  new HighFanOutRule(),
  new DirectUiStateRule(),
];
