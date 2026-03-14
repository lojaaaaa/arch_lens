import type { AnalysisRule } from '../../interfaces/index.js';
import { buildGraphContext } from '../graph-context.builder.js';
import { SmellEngine } from '../smell-engine.js';

const pos = { x: 0, y: 0 };

describe('SmellEngine', () => {
  it('run(structural, ctx) returns array of findings', () => {
    const engine = new SmellEngine();
    const mockRule: AnalysisRule = {
      id: 'MOCK',
      description: 'Test',
      check: () => [
        {
          id: 'f1',
          severity: 'warning',
          category: 'architecture',
          title: 'Test',
          description: 'Test',
          affectedNodes: [],
        },
      ],
    };
    engine.registerStructuralRule(mockRule);

    const graph = {
      nodes: [
        {
          id: 'A',
          kind: 'api_gateway',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [],
      meta: { name: 'test', version: 1, createdAt: '' },
    };
    const ctx = buildGraphContext(graph);
    const findings = engine.run('structural', ctx);

    expect(findings).toHaveLength(1);
    expect(findings[0].id).toBe('f1');
  });

  it('adding new rule requires only registration, no engine changes', () => {
    const engine = new SmellEngine();
    const extraRule: AnalysisRule = {
      id: 'EXTRA',
      description: 'Extra',
      check: () => [
        {
          id: 'e1',
          severity: 'info',
          category: 'architecture',
          title: 'Extra',
          description: 'Extra',
          affectedNodes: [],
        },
      ],
    };

    engine.registerStructuralRule(extraRule);

    const graph = {
      nodes: [
        {
          id: 'N',
          kind: 'service',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [],
      meta: { name: 't', version: 1, createdAt: '' },
    };
    const ctx = buildGraphContext(graph);
    const findings = engine.run('structural', ctx);

    expect(findings.some((f) => f.id === 'e1')).toBe(true);
  });

  it('runAll(ctx) runs all categories and returns concatenated issues', () => {
    const engine = new SmellEngine();
    engine.registerStructuralRule({
      id: 'S',
      description: 'S',
      check: () => [
        {
          id: 's1',
          severity: 'warning',
          category: 'architecture',
          title: 'S',
          description: '',
          affectedNodes: [],
        },
      ],
    });
    engine.registerPerformanceRule({
      id: 'P',
      description: 'P',
      check: () => [
        {
          id: 'p1',
          severity: 'info',
          category: 'performance',
          title: 'P',
          description: '',
          affectedNodes: [],
        },
      ],
    });
    engine.registerReliabilityRule({
      id: 'R',
      description: 'R',
      check: () => [
        {
          id: 'r1',
          severity: 'critical',
          category: 'reliability',
          title: 'R',
          description: '',
          affectedNodes: [],
        },
      ],
    });

    const graph = {
      nodes: [
        {
          id: 'N',
          kind: 'service',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [],
      meta: { name: 't', version: 1, createdAt: '' },
    };
    const ctx = buildGraphContext(graph);
    const all = engine.runAll(ctx);

    expect(all).toHaveLength(3);
    expect(all.map((f) => f.id)).toEqual(
      expect.arrayContaining(['s1', 'p1', 'r1']),
    );
  });
});
