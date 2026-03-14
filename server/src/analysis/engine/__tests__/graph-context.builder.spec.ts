/**
 * AUTH-018 + AUTH-005: Тесты GraphContext builder
 */
import { buildGraphContext } from '../graph-context.builder.js';
import { calculateMetrics } from '../metrics.calculator.js';
import type { ArchitectureGraphDto } from '../../dto/architecture-graph.dto.js';

function makeMeta() {
  return { name: 'Test', version: 1, createdAt: new Date().toISOString() };
}

function makePosition(x: number, y: number) {
  return { x, y };
}

describe('buildGraphContext', () => {
  it('Шаг 1: возвращает GraphContext с заполненными полями', () => {
    const graph: ArchitectureGraphDto = {
      meta: makeMeta(),
      nodes: [
        {
          id: 'A',
          kind: 'service',
          layer: 'backend',
          position: makePosition(0, 0),
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'B',
          kind: 'service',
          layer: 'backend',
          position: makePosition(100, 0),
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [{ id: 'e1', source: 'A', target: 'B', kind: 'calls' }],
    };
    const ctx = buildGraphContext(graph);

    expect(ctx.nodeById).toBeDefined();
    expect(ctx.outgoingEdges).toBeDefined();
    expect(ctx.incomingEdges).toBeDefined();
    expect(ctx.entryPoints).toBeDefined();
    expect(ctx.nodeById.get('A')).toEqual(graph.nodes[0]);
    expect(ctx.outgoingEdges.get('A')).toHaveLength(1);
    expect(ctx.outgoingEdges.get('A')![0].target).toBe('B');
    expect(ctx.incomingEdges.get('B')).toHaveLength(1);
  });

  it('Шаг 2: поиск соседей по outgoingEdges/incomingEdges — O(1)', () => {
    const graph: ArchitectureGraphDto = {
      meta: makeMeta(),
      nodes: [
        {
          id: 'A',
          kind: 'service',
          layer: 'backend',
          position: makePosition(0, 0),
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'B',
          kind: 'service',
          layer: 'backend',
          position: makePosition(100, 0),
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'C',
          kind: 'service',
          layer: 'backend',
          position: makePosition(200, 0),
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [
        { id: 'e1', source: 'A', target: 'B', kind: 'calls' },
        { id: 'e2', source: 'A', target: 'C', kind: 'calls' },
      ],
    };
    const ctx = buildGraphContext(graph);

    const outA = ctx.outgoingEdges.get('A') ?? [];
    expect(outA).toHaveLength(2);
    expect(outA.map((edge) => edge.target).sort()).toEqual(['B', 'C']);

    const inB = ctx.incomingEdges.get('B') ?? [];
    expect(inB).toHaveLength(1);
    expect(inB[0].source).toBe('A');
  });

  it('Шаг 3: CRUD preset → entryPoints непусты', () => {
    const graph: ArchitectureGraphDto = {
      meta: makeMeta(),
      nodes: [
        {
          id: 'page',
          kind: 'ui_page',
          layer: 'frontend',
          position: makePosition(0, 0),
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'gateway',
          kind: 'api_gateway',
          layer: 'backend',
          position: makePosition(100, 0),
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'svc',
          kind: 'service',
          layer: 'backend',
          position: makePosition(200, 0),
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [
        { id: 'e1', source: 'page', target: 'gateway', kind: 'calls' },
        { id: 'e2', source: 'gateway', target: 'svc', kind: 'calls' },
      ],
    };
    const ctx = buildGraphContext(graph);

    expect(ctx.entryPoints).toContain('page');
    expect(ctx.entryPoints).not.toContain('gateway');
  });

  it('AUTH-005: Depth цепочки Page→Gateway→Service→DB = 4', () => {
    const graph: ArchitectureGraphDto = {
      meta: makeMeta(),
      nodes: [
        {
          id: 'page',
          kind: 'ui_page',
          layer: 'frontend',
          position: makePosition(0, 0),
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'gw',
          kind: 'api_gateway',
          layer: 'backend',
          position: makePosition(100, 0),
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'svc',
          kind: 'service',
          layer: 'backend',
          position: makePosition(200, 0),
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'db',
          kind: 'database',
          layer: 'data',
          position: makePosition(300, 0),
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [
        { id: 'e1', source: 'page', target: 'gw', kind: 'calls' },
        { id: 'e2', source: 'gw', target: 'svc', kind: 'calls' },
        { id: 'e3', source: 'svc', target: 'db', kind: 'calls' },
      ],
    };
    const ctx = buildGraphContext(graph);
    const m = calculateMetrics(ctx);
    expect(m.depth).toBe(4);
  });

  it('AUTH-005: Микросервисы preset → несколько entry points', () => {
    const graph: ArchitectureGraphDto = {
      meta: makeMeta(),
      nodes: [
        {
          id: 'gw',
          kind: 'api_gateway',
          layer: 'backend',
          position: makePosition(0, 0),
          complexity: 1,
          criticality: 1,
        },
        {
          id: 's1',
          kind: 'service',
          layer: 'backend',
          position: makePosition(100, 0),
          complexity: 1,
          criticality: 1,
        },
        {
          id: 's2',
          kind: 'service',
          layer: 'backend',
          position: makePosition(200, 0),
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [
        { id: 'e1', source: 'gw', target: 's1', kind: 'calls' },
        { id: 'e2', source: 'gw', target: 's2', kind: 'calls' },
      ],
    };
    const ctx = buildGraphContext(graph);
    expect(ctx.entryPoints).toContain('gw');
    expect(ctx.entryPoints.length).toBeGreaterThanOrEqual(1);
  });
});
