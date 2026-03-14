import type { AnalysisRule } from '../../interfaces/index.js';
import { RenderPressureRule } from './render-pressure.rule.js';
import { ApiOverloadRule } from './api-overload.rule.js';
import { DbWriteBottleneckRule } from './db-write-bottleneck.rule.js';
import { CacheMissImpactRule } from './cache-miss-impact.rule.js';
import { ExternalDependencyRiskRule } from './external-dependency-risk.rule.js';
import { SyncChainLatencyRule } from './sync-chain-latency.rule.js';
import { L07CriticalPathRule } from './l07-critical-path.rule.js';
import { L08BottleneckRule } from './l08-bottleneck.rule.js';
import { SystemParamsRule } from './system-params.rule.js';

export const loadRules: AnalysisRule[] = [
  new RenderPressureRule(),
  new ApiOverloadRule(),
  new DbWriteBottleneckRule(),
  new CacheMissImpactRule(),
  new ExternalDependencyRiskRule(),
  new SyncChainLatencyRule(),
  new L07CriticalPathRule(),
  new L08BottleneckRule(),
  new SystemParamsRule(),
];
