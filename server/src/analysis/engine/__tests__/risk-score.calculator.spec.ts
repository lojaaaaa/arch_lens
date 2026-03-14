/**
 * AUTH-007: Тесты Risk Score
 */
import { buildGraphContext } from '../graph-context.builder.js';
import { calculateMetrics } from '../metrics.calculator.js';
import { calculateRiskScore } from '../risk-score.calculator.js';
import type { ArchitectureGraphDto } from '../../dto/architecture-graph.dto.js';

function makeMeta() {
  return { name: 'Test', version: 1, createdAt: new Date().toISOString() };
}

function makePosition(x: number, y: number) {
  return { x, y };
}

describe('calculateRiskScore AUTH-007', () => {
  it('Шаг 1: Граф без проблем → riskScore < 0.3', () => {
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
          id: 's2',
          kind: 'service',
          layer: 'backend',
          position: makePosition(300, 0),
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'db',
          kind: 'database',
          layer: 'data',
          position: makePosition(400, 0),
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [
        { id: 'e1', source: 'page', target: 'gw', kind: 'calls' },
        { id: 'e2', source: 'gw', target: 'svc', kind: 'calls' },
      ],
    };
    const ctx = buildGraphContext(graph);
    const metrics = calculateMetrics(ctx);
    const risk = calculateRiskScore(metrics, ctx);
    expect(risk).toBeLessThan(0.3);
  });

  it('Шаг 2: Граф с циклами, high fan-out → riskScore выше', () => {
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
        { id: 'e2', source: 'B', target: 'C', kind: 'calls' },
        { id: 'e3', source: 'C', target: 'A', kind: 'calls' },
        { id: 'e4', source: 'A', target: 'D', kind: 'calls' },
        { id: 'e5', source: 'A', target: 'E', kind: 'calls' },
        { id: 'e6', source: 'A', target: 'F', kind: 'calls' },
        { id: 'e7', source: 'A', target: 'G', kind: 'calls' },
      ],
    };
    const ctx = buildGraphContext(graph);
    const metrics = calculateMetrics(ctx);
    const risk = calculateRiskScore(metrics, ctx);
    expect(risk).toBeGreaterThan(0.3);
  });
});
