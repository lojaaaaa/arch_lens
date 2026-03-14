import type { ArchitectureGraphDto } from '../../dto/architecture-graph.dto.js';

const pos = { x: 0, y: 0 };
const meta = (name: string) => ({ name, version: 1, createdAt: '' });

/** CRUD preset: System → Page → Gateway → Service → DB + Cache */
export function buildCrudGraph(): ArchitectureGraphDto {
  return {
    meta: meta('crud'),
    nodes: [
      {
        id: 'system',
        kind: 'system',
        layer: 'frontend',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
      {
        id: 'page',
        kind: 'ui_page',
        layer: 'frontend',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
      {
        id: 'gateway',
        kind: 'api_gateway',
        layer: 'backend',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
      {
        id: 'service',
        kind: 'service',
        layer: 'backend',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
      {
        id: 'db',
        kind: 'database',
        layer: 'data',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
      {
        id: 'cache',
        kind: 'cache',
        layer: 'data',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
    ],
    edges: [
      { id: 'e1', source: 'page', target: 'system', kind: 'depends_on' },
      { id: 'e2', source: 'page', target: 'gateway', kind: 'calls' },
      { id: 'e3', source: 'gateway', target: 'service', kind: 'calls' },
      { id: 'e4', source: 'service', target: 'db', kind: 'reads' },
      { id: 'e5', source: 'service', target: 'db', kind: 'writes' },
      { id: 'e6', source: 'service', target: 'cache', kind: 'reads' },
      { id: 'e7', source: 'service', target: 'cache', kind: 'writes' },
    ],
  };
}

/** Anti-pattern preset: цикл, no gateway, god service, orphan, high fan-out. */
export function buildAntiPatternGraph(): ArchitectureGraphDto {
  return {
    meta: meta('anti-pattern'),
    nodes: [
      {
        id: 'system',
        kind: 'system',
        layer: 'frontend',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
      {
        id: 'page',
        kind: 'ui_page',
        layer: 'frontend',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
      {
        id: 'db',
        kind: 'database',
        layer: 'data',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
      {
        id: 'god',
        kind: 'service',
        layer: 'backend',
        position: pos,
        complexity: 1,
        criticality: 1,
        operationsCount: 15,
        externalCalls: 8,
      },
      {
        id: 'db1',
        kind: 'database',
        layer: 'data',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
      {
        id: 'db2',
        kind: 'database',
        layer: 'data',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
      {
        id: 'cache',
        kind: 'cache',
        layer: 'data',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
      {
        id: 'orphan',
        kind: 'service',
        layer: 'backend',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
      {
        id: 'a',
        kind: 'service',
        layer: 'backend',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
      {
        id: 'b',
        kind: 'service',
        layer: 'backend',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
      {
        id: 'c',
        kind: 'service',
        layer: 'backend',
        position: pos,
        complexity: 1,
        criticality: 1,
      },
    ],
    edges: [
      { id: 'e1', source: 'page', target: 'god', kind: 'calls' },
      { id: 'e2', source: 'page', target: 'system', kind: 'depends_on' },
      { id: 'e3', source: 'god', target: 'db1', kind: 'reads' },
      { id: 'e4', source: 'god', target: 'db1', kind: 'writes' },
      { id: 'e5', source: 'god', target: 'db2', kind: 'reads' },
      { id: 'e6', source: 'god', target: 'db2', kind: 'writes' },
      { id: 'e7', source: 'god', target: 'cache', kind: 'reads' },
      { id: 'e8', source: 'god', target: 'cache', kind: 'writes' },
      { id: 'e9', source: 'god', target: 'db', kind: 'reads' },
      { id: 'e10', source: 'a', target: 'b', kind: 'calls' },
      { id: 'e11', source: 'b', target: 'c', kind: 'calls' },
      { id: 'e12', source: 'c', target: 'a', kind: 'calls' },
    ],
  };
}
