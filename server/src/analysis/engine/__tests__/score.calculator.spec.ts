import type { AnalysisIssue } from '../../interfaces/index.js';
import { buildGraphContext } from '../graph-context.builder';
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
        { id: 'g', kind: 'api_gateway', layer: 'backend', position: { x: 0, y: 0 }, complexity: 1, criticality: 1 },
        { id: 'c', kind: 'cache', layer: 'data', position: { x: 0, y: 0 }, complexity: 1, criticality: 1 },
        { id: 's', kind: 'service', layer: 'backend', position: { x: 0, y: 0 }, complexity: 1, criticality: 1 },
      ],
      edges: [
        { id: 'e1', source: 'g', target: 's', kind: 'calls' },
        { id: 'e2', source: 's', target: 'c', kind: 'reads' },
      ],
    });
    const result = calculateScore([], ctx);
    expect(result.score).toBe(100);
    expect(result.grade).toBe('A');
    expect(result.penalty).toBe(0);
    expect(result.bonus).toBeGreaterThan(0);
  });

  it('critical issues affect score more strongly', () => {
    const oneCritical = [createIssue('critical')];
    const oneWarning = [createIssue('warning')];

    const r1 = calculateScore(oneCritical, emptyCtx);
    const r2 = calculateScore(oneWarning, emptyCtx);

    expect(r1.penalty).toBeGreaterThan(r2.penalty);
    expect(r1.score).toBeLessThan(r2.score);
  });

  it('bad graph with multiple critical gets low score', () => {
    const badIssues: AnalysisIssue[] = [
      createIssue('critical', 'S06'),
      createIssue('critical', 'S02'),
      createIssue('critical', 'S02'),
    ];
    const result = calculateScore(badIssues, emptyCtx);
    expect(result.score).toBeLessThan(30);
    expect(result.grade).toBe('F');
  });

  it('fixing issues increases score', () => {
    const badResult = calculateScore(
      [createIssue('critical'), createIssue('critical')],
      emptyCtx,
    );
    const okResult = calculateScore([createIssue('info')], emptyCtx);
    expect(okResult.score).toBeGreaterThan(badResult.score);
  });

  it('bonus uses ruleId when present', () => {
    const ctxWithCache = buildGraphContext({
      meta: { name: 'test', version: 1, createdAt: new Date().toISOString() },
      nodes: [
        { id: 'c', kind: 'cache', layer: 'data', position: { x: 0, y: 0 }, complexity: 1, criticality: 1 },
      ],
      edges: [],
    });
    const withOrphans = [createIssue('info', 'S01')];
    const result = calculateScore(withOrphans, ctxWithCache);
    expect(result.bonus).toBeLessThan(14);
  });
});
