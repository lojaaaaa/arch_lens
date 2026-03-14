/**
 * AUTH-008: Тесты Confidence Score
 */
import { calculateConfidenceScore } from '../confidence-score.calculator.js';
import type { ArchitectureGraphDto } from '../../dto/architecture-graph.dto.js';

function makeMeta() {
  return { name: 'Test', version: 1, createdAt: new Date().toISOString() };
}

function makePosition(x: number, y: number) {
  return { x, y };
}

describe('calculateConfidenceScore AUTH-008', () => {
  it('Шаг 1: Граф с заполненными requestRate, reliability → confidence > 0.5', () => {
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
          requestRate: 100,
          latencyMs: 10,
        },
        {
          id: 'ext',
          kind: 'external_system',
          layer: 'backend',
          position: makePosition(100, 0),
          complexity: 1,
          criticality: 1,
          reliability: 0.99,
        },
      ],
      edges: [],
    };
    const conf = calculateConfidenceScore(graph);
    expect(conf).toBeGreaterThanOrEqual(0.5);
  });

  it('Шаг 2: Граф без optional полей → confidence ниже', () => {
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
          id: 'db',
          kind: 'database',
          layer: 'data',
          position: makePosition(100, 0),
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [{ id: 'e1', source: 'gw', target: 'db', kind: 'calls' }],
    };
    const conf = calculateConfidenceScore(graph);
    expect(conf).toBeLessThan(1);
  });

  it('Шаг 3: API возвращает confidenceScore', () => {
    const graph: ArchitectureGraphDto = {
      meta: makeMeta(),
      nodes: [
        {
          id: 'n',
          kind: 'service',
          layer: 'backend',
          position: makePosition(0, 0),
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [],
    };
    const conf = calculateConfidenceScore(graph);
    expect(conf).toBeGreaterThanOrEqual(0);
    expect(conf).toBeLessThanOrEqual(1);
  });
});
