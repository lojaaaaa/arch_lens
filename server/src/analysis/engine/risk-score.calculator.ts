import { ANALYSIS_CONFIG } from '../analysis.config.js';
import type {
  AnalysisIssue,
  AnalysisMetrics,
  GraphContext,
} from '../interfaces/index.js';

/** normalize(x) = min(x / threshold, 1) для стабильности */
function normalize(x: number, threshold: number): number {
  if (threshold <= 0) return 0;
  return Math.min(x / threshold, 1);
}

/** SPOF count: criticality ≥ 2 AND fanIn ≥ 3 */
function countSpof(ctx: GraphContext): number {
  const { criticalityThreshold, fanInThreshold } = ANALYSIS_CONFIG.spof;
  let count = 0;
  for (const node of ctx.nodes) {
    const criticality = node.criticality ?? 0;
    const fanIn = ctx.incomingCount.get(node.id) ?? 0;
    if (criticality >= criticalityThreshold && fanIn >= fanInThreshold) {
      count++;
    }
  }
  return count;
}

/**
 * Architecture Risk Score (0–1, выше = хуже).
 * Coupling, depth, cycles, SPOF, bottleneck (L08), external risk (L05).
 * Раньше bottleneck и external были 0 — теперь учитываются через issues.
 */
export function calculateRiskScore(
  metrics: AnalysisMetrics,
  ctx: GraphContext,
  issues: AnalysisIssue[] = [],
): number {
  const {
    fanOutThreshold,
    depthThreshold,
    densityThreshold,
    spofThreshold,
    weightCoupling,
    weightDepth,
    weightSpof,
    weightBottleneck,
    weightExternal,
  } = ANALYSIS_CONFIG.risk;

  const couplingNorm = Math.min(metrics.density / densityThreshold, 1);
  const fanOutNorm = normalize(metrics.maxFanOut, fanOutThreshold);
  const depthNorm = normalize(metrics.depth, depthThreshold);
  const cycleNorm = metrics.cycleCount > 0 ? 1 : 0;
  const spofCount = countSpof(ctx);
  const spofNorm = normalize(spofCount, spofThreshold);

  const hasBottleneck = issues.some(
    (issue) => issue.ruleId === 'L08' || issue.ruleId === 'L03',
  );
  const bottleneckNorm = hasBottleneck ? 1 : 0;

  const hasExternalRisk = issues.some((issue) => issue.ruleId === 'L05');
  const externalRiskNorm = hasExternalRisk ? 1 : 0;

  const riskScore =
    weightCoupling * Math.max(couplingNorm, fanOutNorm) +
    weightDepth * Math.max(depthNorm, cycleNorm) +
    weightSpof * spofNorm +
    weightBottleneck * bottleneckNorm +
    weightExternal * externalRiskNorm;

  return Math.min(1, Math.max(0, riskScore));
}
