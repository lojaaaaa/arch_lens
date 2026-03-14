import type { AnalysisIssue } from '../../interfaces/index.js';
import { buildGraphContext } from '../graph-context.builder';
import { calculateMetrics } from '../metrics.calculator';
import { calculateScore } from '../score.calculator';

function createIssue(
  severity: AnalysisIssue['severity'],
  ruleId?: string,
): AnalysisIssue {
  return {
    id: 'test-id',
    ruleId,
    severity,
    category: 'architecture',
    title: 'Test',
    description: 'Test',
    affectedNodes: [],
  };
}

describe('calculateScore', () => {
  const emptyCtx = buildGraphContext({
    meta: { name: 'test', version: 1, createdAt: new Date().toISOString() },
    nodes: [
      {
        id: 'a',
        kind: 'service',
        layer: 'backend',
        position: { x: 0, y: 0 },
        complexity: 1,
        criticality: 1,
      },
    ],
    edges: [],
  });

  it('returns 100/A for clean graph with bonuses', () => {
    const ctx = buildGraphContext({
      meta: { name: 'test', version: 1, createdAt: new Date().toISOString() },
      nodes: [
        {
          id: 'g',
          kind: 'api_gateway',
          layer: 'backend',
          position: { x: 0, y: 0 },
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'c',
          kind: 'cache',
          layer: 'data',
          position: { x: 0, y: 0 },
          complexity: 1,
          criticality: 1,
        },
        {
          id: 's',
          kind: 'service',
          layer: 'backend',
          position: { x: 0, y: 0 },
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [
        { id: 'e1', source: 'g', target: 's', kind: 'calls' },
        { id: 'e2', source: 's', target: 'c', kind: 'reads' },
      ],
    });
    const metrics = calculateMetrics(ctx);
    const result = calculateScore([], ctx, metrics);
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.grade).toBe('A');
    expect(result.penalty).toBe(0);
    expect(result.bonus).toBeGreaterThan(0);
  });

  it('critical issues affect score more strongly', () => {
    const oneCritical = [createIssue('critical')];
    const oneWarning = [createIssue('warning')];
    const metrics = calculateMetrics(emptyCtx);

    const r1 = calculateScore(oneCritical, emptyCtx, metrics);
    const r2 = calculateScore(oneWarning, emptyCtx, metrics);

    expect(r1.penalty).toBeGreaterThan(r2.penalty);
    expect(r1.score).toBeLessThan(r2.score);
  });

  it('bad graph with multiple critical gets low score', () => {
    const badIssues: AnalysisIssue[] = [
      createIssue('critical', 'S06'),
      createIssue('critical', 'S02'),
      createIssue('critical', 'S02'),
    ];
    const metrics = calculateMetrics(emptyCtx);
    const result = calculateScore(badIssues, emptyCtx, metrics);
    expect(result.score).toBeLessThan(40);
    expect(result.grade).toBe('F');
  });

  it('fixing issues increases score', () => {
    const metrics = calculateMetrics(emptyCtx);
    const badResult = calculateScore(
      [createIssue('critical'), createIssue('critical')],
      emptyCtx,
      metrics,
    );
    const okResult = calculateScore([createIssue('info')], emptyCtx, metrics);
    expect(okResult.score).toBeGreaterThan(badResult.score);
  });

  it('bonus uses ruleId when present', () => {
    const ctxWithCache = buildGraphContext({
      meta: { name: 'test', version: 1, createdAt: new Date().toISOString() },
      nodes: [
        {
          id: 'c',
          kind: 'cache',
          layer: 'data',
          position: { x: 0, y: 0 },
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [],
    });
    const metrics = calculateMetrics(ctxWithCache);
    const withOrphans = [createIssue('info', 'S01')];
    const result = calculateScore(withOrphans, ctxWithCache, metrics);
    expect(result.bonus).toBeLessThan(14);
  });

  it('high complexity metrics reduce score', () => {
    const ctx = buildGraphContext({
      meta: { name: 'test', version: 1, createdAt: new Date().toISOString() },
      nodes: [
        {
          id: 'p',
          kind: 'ui_page',
          layer: 'frontend',
          position: { x: 0, y: 0 },
          complexity: 1,
          criticality: 3,
          componentsCount: 20,
          stateUsage: 'local',
        },
        {
          id: 'comp',
          kind: 'ui_component',
          layer: 'frontend',
          position: { x: 0, y: 0 },
          complexity: 1,
          criticality: 1,
          nestedComponents: 15,
          propsCount: 20,
        },
        {
          id: 'p2',
          kind: 'ui_page',
          layer: 'frontend',
          position: { x: 0, y: 0 },
          complexity: 1,
          criticality: 1,
          componentsCount: 8,
          stateUsage: 'global',
        },
        {
          id: 's1',
          kind: 'service',
          layer: 'backend',
          position: { x: 0, y: 0 },
          complexity: 1,
          criticality: 2,
          operationsCount: 15,
          externalCalls: 8,
        },
        {
          id: 's2',
          kind: 'service',
          layer: 'backend',
          position: { x: 0, y: 0 },
          complexity: 1,
          criticality: 1,
          operationsCount: 12,
          externalCalls: 5,
        },
        {
          id: 's3',
          kind: 'service',
          layer: 'backend',
          position: { x: 0, y: 0 },
          complexity: 1,
          criticality: 1,
          operationsCount: 18,
          externalCalls: 5,
        },
        {
          id: 's4',
          kind: 'service',
          layer: 'backend',
          position: { x: 0, y: 0 },
          complexity: 1,
          criticality: 1,
          operationsCount: 10,
          externalCalls: 6,
        },
      ],
      edges: [
        { id: 'e1', source: 'p', target: 's1', kind: 'calls' },
        { id: 'e2', source: 'p', target: 'comp', kind: 'depends_on' },
        { id: 'e3', source: 'p2', target: 's1', kind: 'calls' },
        { id: 'e4', source: 's1', target: 's2', kind: 'calls' },
        { id: 'e5', source: 's1', target: 's3', kind: 'calls' },
        { id: 'e6', source: 's1', target: 's4', kind: 'calls' },
      ],
    });
    const metrics = calculateMetrics(ctx);
    expect(metrics.frontendComplexity).toBeGreaterThan(10);
    expect(metrics.backendComplexity).toBeGreaterThan(15);
    const result = calculateScore([], ctx, metrics);
    expect(result.metricsPenalty).toBeGreaterThan(0);
    // metricsPenalty must exceed bonuses (noCycles + allConnected) so score drops
    expect(result.score).toBeLessThan(100);
  });
});
