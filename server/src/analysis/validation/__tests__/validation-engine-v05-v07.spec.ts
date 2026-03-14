/**
 * AUTH-003: Тесты ValidationEngine V05–V07
 */
import { ValidationEngine } from '../validation-engine.js';
import type { ArchitectureGraphDto } from '../../dto/architecture-graph.dto.js';

function makeMeta() {
  return { name: 'Test', version: 1, createdAt: new Date().toISOString() };
}

function makePosition(x: number, y: number) {
  return { x, y };
}

describe('ValidationEngine V05–V07', () => {
  const engine = new ValidationEngine();

  it('Шаг 1: Граф с self-loop A→A → warnings содержит V05', () => {
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
      ],
      edges: [
        {
          id: 'e1',
          source: 'A',
          target: 'A',
          kind: 'calls',
        },
      ],
    };
    const result = engine.run(graph);
    expect(result.warnings.some((warning) => warning.ruleId === 'V05')).toBe(
      true,
    );
    expect(
      result.warnings.find((warning) => warning.ruleId === 'V05')?.message,
    ).toContain('Self-loop');
  });

  it('Шаг 2: api_gateway с requestRate=-1 → warnings содержит V06', () => {
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
          requestRate: -1,
        },
      ],
      edges: [],
    };
    const result = engine.run(graph);
    expect(result.warnings.some((warning) => warning.ruleId === 'V06')).toBe(
      true,
    );
    expect(
      result.warnings.find((warning) => warning.ruleId === 'V06')?.message,
    ).toContain('requestRate');
  });
});
