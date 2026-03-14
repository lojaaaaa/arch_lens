/**
 * AUTH-002: Тесты ValidationEngine V01–V04
 */
import { ValidationEngine } from '../validation-engine.js';
import type { ArchitectureGraphDto } from '../../dto/architecture-graph.dto.js';

function makeMeta() {
  return { name: 'Test', version: 1, createdAt: new Date().toISOString() };
}

function makePosition(x: number, y: number) {
  return { x, y };
}

describe('ValidationEngine V01–V04', () => {
  const engine = new ValidationEngine();

  it('Шаг 1: Граф с edge на несуществующий node → errors содержит V01', () => {
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
          target: 'MISSING',
          kind: 'calls',
        },
      ],
    };
    const result = engine.run(graph);
    expect(result.errors.some((error) => error.ruleId === 'V01')).toBe(true);
    expect(
      result.errors.find((error) => error.ruleId === 'V01')?.message,
    ).toContain('MISSING');
  });

  it('Шаг 2: Граф с ui_page→database → warnings содержит V02', () => {
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
          id: 'db',
          kind: 'database',
          layer: 'data',
          position: makePosition(100, 0),
          complexity: 1,
          criticality: 2,
        },
      ],
      edges: [
        {
          id: 'e1',
          source: 'page',
          target: 'db',
          kind: 'reads',
        },
      ],
    };
    const result = engine.run(graph);
    expect(result.warnings.some((w) => w.ruleId === 'V02')).toBe(true);
    expect(result.warnings.find((w) => w.ruleId === 'V02')?.message).toContain(
      'frontend→data',
    );
  });

  it('Шаг 3: Граф с двумя нодами с одним id → errors содержит V03', () => {
    const graph: ArchitectureGraphDto = {
      meta: makeMeta(),
      nodes: [
        {
          id: 'dup',
          kind: 'service',
          layer: 'backend',
          position: makePosition(0, 0),
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'dup',
          kind: 'database',
          layer: 'data',
          position: makePosition(100, 0),
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [],
    };
    const result = engine.run(graph);
    expect(result.errors.some((error) => error.ruleId === 'V03')).toBe(true);
    expect(
      result.errors.find((error) => error.ruleId === 'V03')?.message,
    ).toContain('dup');
  });

  it('Шаг 4: Граф с двумя одинаковыми рёбрами A→B calls → warnings содержит V04', () => {
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
      edges: [
        { id: 'e1', source: 'A', target: 'B', kind: 'calls' },
        { id: 'e2', source: 'A', target: 'B', kind: 'calls' },
      ],
    };
    const result = engine.run(graph);
    expect(result.warnings.some((warning) => warning.ruleId === 'V04')).toBe(
      true,
    );
    expect(
      result.warnings.find((warning) => warning.ruleId === 'V04')?.message,
    ).toContain('Duplicate');
  });

  it('Валидный граф → errors пуст, normalizedGraph присутствует', () => {
    const graph: ArchitectureGraphDto = {
      meta: makeMeta(),
      nodes: [
        {
          id: 'A',
          kind: 'api_gateway',
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
    const result = engine.run(graph);
    expect(result.errors).toHaveLength(0);
    expect(result.normalizedGraph).toBeDefined();
    expect(result.normalizedGraph).toEqual(graph);
  });
});
