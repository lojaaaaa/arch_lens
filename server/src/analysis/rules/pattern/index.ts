import type { AnalysisRule } from '../../interfaces/index.js';
import { GodServiceRule } from './god-service.rule.js';
import { TightCouplingRule } from './tight-coupling.rule.js';
import { MissingCacheRule } from './missing-cache.rule.js';
import { DirectUiStateRule } from './direct-ui-state.rule.js';
import { StatefulChainRule } from './stateful-chain.rule.js';
import { ExcessiveNestingRule } from './excessive-nesting.rule.js';
import { NoErrorBoundaryRule } from './no-error-boundary.rule.js';
import { MonolithApiRule } from './monolith-api.rule.js';

export const patternRules: AnalysisRule[] = [
  new GodServiceRule(),
  new TightCouplingRule(),
  new MissingCacheRule(),
  new DirectUiStateRule(),
  new StatefulChainRule(),
  new ExcessiveNestingRule(),
  new NoErrorBoundaryRule(),
  new MonolithApiRule(),
];
