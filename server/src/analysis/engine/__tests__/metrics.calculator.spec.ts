/**
 * AUTH-004: Тесты MetricsStore S1–S5
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

describe('calculateMetrics AUTH-004', () => {
  it('Шаг 1: Граф 5 нод, 4 ребра → density корректна', () => {
    const graph: ArchitectureGraphDto = {
      meta: makeMeta(),
      nodes: [1, 2, 3, 4, 5].map((i) => ({
        id: `n${i}`,
        kind: 'service',
        layer: 'backend',
        position: makePosition(i * 50, 0),
        complexity: 1,
        criticality: 1,
      })),
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', kind: 'calls' },
        { id: 'e2', source: 'n2', target: 'n3', kind: 'calls' },
        { id: 'e3', source: 'n3', target: 'n4', kind: 'calls' },
        { id: 'e4', source: 'n4', target: 'n5', kind: 'calls' },
      ],
    };
    const ctx = buildGraphContext(graph);
    const m = calculateMetrics(ctx);
    expect(m.totalNodes).toBe(5);
    expect(m.totalEdges).toBe(4);
    expect(m.density).toBeCloseTo(4 / (5 * 4), 6);
    expect(m.density).toBe(0.2);
  });

  it('Шаг 2: Граф с циклом A→B→C→A → cycleCount >= 1', () => {
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
        { id: 'e2', source: 'B', target: 'C', kind: 'calls' },
        { id: 'e3', source: 'C', target: 'A', kind: 'calls' },
      ],
    };
    const ctx = buildGraphContext(graph);
    const m = calculateMetrics(ctx);
    expect(m.cycleCount).toBeGreaterThanOrEqual(1);
  });

  it('AUTH-006: Граф с одним узлом fanOut=6 → godIndex > 2', () => {
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
        {
          id: 'D',
          kind: 'service',
          layer: 'backend',
          position: makePosition(300, 0),
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'E',
          kind: 'service',
          layer: 'backend',
          position: makePosition(400, 0),
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'F',
          kind: 'service',
          layer: 'backend',
          position: makePosition(500, 0),
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'G',
          kind: 'service',
          layer: 'backend',
          position: makePosition(600, 0),
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [
        { id: 'e1', source: 'A', target: 'B', kind: 'calls' },
        { id: 'e2', source: 'A', target: 'C', kind: 'calls' },
        { id: 'e3', source: 'A', target: 'D', kind: 'calls' },
        { id: 'e4', source: 'A', target: 'E', kind: 'calls' },
        { id: 'e5', source: 'A', target: 'F', kind: 'calls' },
        { id: 'e6', source: 'A', target: 'G', kind: 'calls' },
        { id: 'e7', source: 'B', target: 'C', kind: 'calls' },
      ],
    };
    const ctx = buildGraphContext(graph);
    const m = calculateMetrics(ctx);
    expect(m.avgFanOut).toBeDefined();
    expect(m.godIndexByNode['A']).toBeGreaterThan(2);
    expect(m.instabilityByNode['A']).toBeDefined();
  });

  it('Шаг 3: CRUD preset → density, depth в ответе', () => {
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
    expect(m.density).toBeDefined();
    expect(m.depth).toBeDefined();
    expect(m.cycleCount).toBeDefined();
    expect(m.depth).toBe(4);
  });
});
