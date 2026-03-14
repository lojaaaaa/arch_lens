import { buildGraphContext } from '../../../engine/graph-context.builder.js';
import { RuleEngine } from '../../../engine/rule-engine.js';
import { loadRules } from '../index.js';

const pos = { x: 0, y: 0 };

describe('L07 Critical path, L08 Bottleneck', () => {
  const engine = new RuleEngine();
  engine.registerAll(loadRules);

  it('long chain with latency assumptions → L07 warning', () => {
    const nodes = [
      {
        id: 'gw',
        kind: 'api_gateway',
        layer: 'backend',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `s${i}`,
        kind: 'service',
        layer: 'backend',
        position: pos,
        complexity: 1,
        criticality: 1,
      })),
      {
        id: 'db',
        kind: 'database',
        layer: 'data',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
    ];
    const edges = [
      { id: 'e0', source: 'gw', target: 's0', kind: 'calls' },
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `e${i + 1}`,
        source: `s${i}`,
        target: i < 9 ? `s${i + 1}` : 'db',
        kind: 'calls' as const,
      })),
    ];
    const graph = {
      nodes,
      edges,
      meta: { name: 'chain', version: 1, createdAt: '' },
    };
    const ctx = buildGraphContext(graph);
    const issues = engine.run(ctx);
    const l07 = issues.filter((issue) => issue.ruleId === 'L07');

    expect(l07).toHaveLength(1);
    expect(l07[0].severity).toBe('warning');
  });

  it('API Gateway with requestRate=50, load=60 → L08 critical', () => {
    const graph = {
      nodes: [
        {
          id: 'page',
          kind: 'ui_page',
          layer: 'frontend',
          position: pos,
          complexity: 1,
          criticality: 1,
          updateFrequency: 60,
        },
        {
          id: 'gw',
          kind: 'api_gateway',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
          capacityRps: 50,
        },
      ],
      edges: [{ id: 'e1', source: 'page', target: 'gw', kind: 'calls' }],
      meta: { name: 'bottleneck', version: 1, createdAt: '' },
    };
    const ctx = buildGraphContext(graph);
    const issues = engine.run(ctx);
    const l08 = issues.filter((issue) => issue.ruleId === 'L08');

    expect(l08).toHaveLength(1);
    expect(l08[0].severity).toBe('critical');
    expect(l08[0].affectedNodes).toContain('gw');
  });

  it('graph without latency/load data → L07/L08 no false positives', () => {
    const graph = {
      nodes: [
        {
          id: 'gw',
          kind: 'api_gateway',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
          requestRate: 100,
        },
        {
          id: 'db',
          kind: 'database',
          layer: 'data',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [{ id: 'e1', source: 'gw', target: 'db', kind: 'calls' }],
      meta: { name: 'minimal', version: 1, createdAt: '' },
    };
    const ctx = buildGraphContext(graph);
    const issues = engine.run(ctx);
    const l07 = issues.filter((issue) => issue.ruleId === 'L07');
    const l08 = issues.filter((issue) => issue.ruleId === 'L08');

    expect(l07).toHaveLength(0);
    expect(l08).toHaveLength(0);
  });
});
