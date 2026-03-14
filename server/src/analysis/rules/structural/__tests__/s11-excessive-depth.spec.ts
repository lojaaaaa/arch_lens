import { buildGraphContext } from '../../../engine/graph-context.builder.js';
import { RuleEngine } from '../../../engine/rule-engine.js';
import { structuralRules } from '../index.js';

const pos = { x: 0, y: 0 };

describe('S11 Excessive Depth', () => {
  const engine = new RuleEngine();
  engine.registerAll(structuralRules);

  it('graph with path length 6 → S11 warning', () => {
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
        {
          id: 'B',
          kind: 'service',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'C',
          kind: 'service',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'D',
          kind: 'service',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'E',
          kind: 'service',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'F',
          kind: 'database',
          layer: 'data',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [
        { id: 'e1', source: 'A', target: 'B', kind: 'calls' },
        { id: 'e2', source: 'B', target: 'C', kind: 'calls' },
        { id: 'e3', source: 'C', target: 'D', kind: 'calls' },
        { id: 'e4', source: 'D', target: 'E', kind: 'calls' },
        { id: 'e5', source: 'E', target: 'F', kind: 'writes' },
      ],
      meta: { name: 'chain6', version: 1, createdAt: '' },
    };
    const ctx = buildGraphContext(graph);
    const issues = engine.run(ctx);
    const s11 = issues.filter((issue) => issue.ruleId === 'S11');

    expect(s11).toHaveLength(1);
    expect(s11[0].severity).toBe('warning');
    expect(s11[0].affectedNodes).toContain('A');
    expect(s11[0].affectedNodes).toContain('F');
    expect(s11[0].affectedNodes.length).toBe(6);
  });

  it('graph with path length 4 → S11 absent', () => {
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
        {
          id: 'B',
          kind: 'service',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'C',
          kind: 'service',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'D',
          kind: 'database',
          layer: 'data',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [
        { id: 'e1', source: 'A', target: 'B', kind: 'calls' },
        { id: 'e2', source: 'B', target: 'C', kind: 'calls' },
        { id: 'e3', source: 'C', target: 'D', kind: 'writes' },
      ],
      meta: { name: 'chain4', version: 1, createdAt: '' },
    };
    const ctx = buildGraphContext(graph);
    const issues = engine.run(ctx);
    const s11 = issues.filter((issue) => issue.ruleId === 'S11');

    expect(s11).toHaveLength(0);
  });
});
