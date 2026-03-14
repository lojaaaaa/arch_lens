import { buildGraphContext } from '../graph-context.builder.js';
import { propagateLoad } from '../load-propagation.js';

const pos = { x: 0, y: 0 };

describe('propagateLoad', () => {
  it('chain A→B→C: B and C get load=100 when requestRate=100 on A', () => {
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
      ],
      edges: [
        { id: 'e1', source: 'A', target: 'B', kind: 'calls' },
        { id: 'e2', source: 'B', target: 'C', kind: 'calls' },
      ],
      meta: { name: 'chain', version: 1, createdAt: '' },
    };
    const ctx = buildGraphContext(graph);
    const load = propagateLoad(ctx, 'A', 100);
    expect(load.get('A')).toBe(100);
    expect(load.get('B')).toBe(100);
    expect(load.get('C')).toBe(100);
  });

  it('branching A→B, A→C: B and C receive load by frequency (proportional)', () => {
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
      ],
      edges: [
        { id: 'e1', source: 'A', target: 'B', kind: 'calls', frequency: 0.5 },
        { id: 'e2', source: 'A', target: 'C', kind: 'calls', frequency: 0.5 },
      ],
      meta: { name: 'branch', version: 1, createdAt: '' },
    };
    const ctx = buildGraphContext(graph);
    const load = propagateLoad(ctx, 'A', 100);
    expect(load.get('A')).toBe(100);
    expect(load.get('B')).toBe(50);
    expect(load.get('C')).toBe(50);
  });

  it('graph with cycle: load does not loop infinitely', () => {
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
      ],
      edges: [
        { id: 'e1', source: 'A', target: 'B', kind: 'calls' },
        { id: 'e2', source: 'B', target: 'C', kind: 'calls' },
        { id: 'e3', source: 'C', target: 'B', kind: 'calls' },
      ],
      meta: { name: 'cycle', version: 1, createdAt: '' },
    };
    const ctx = buildGraphContext(graph);
    const load = propagateLoad(ctx, 'A', 100);
    expect(load.get('A')).toBe(100);
    expect(load.get('B')).toBe(100);
    expect(load.get('C')).toBe(100);
    expect(load.size).toBe(3);
  });
});
