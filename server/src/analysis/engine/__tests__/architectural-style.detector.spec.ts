import { buildGraphContext } from '../graph-context.builder.js';
import { calculateMetrics } from '../metrics.calculator.js';
import { detectArchitectureStyle } from '../architectural-style.detector.js';
import { buildCrudGraph } from '../../__tests__/calibration/fixtures.js';

const pos = { x: 0, y: 0 };

describe('detectArchitectureStyle', () => {
  it('CRUD preset → layered or client-server', () => {
    const graph = buildCrudGraph();
    const ctx = buildGraphContext(graph);
    const metrics = calculateMetrics(ctx);
    const style = detectArchitectureStyle(ctx, metrics);
    expect(['layered', 'client-server']).toContain(style);
  });

  it('Microservices preset → microservices', () => {
    const graph = {
      meta: { name: 'ms', version: 1, createdAt: '' },
      nodes: [
        {
          id: 'sys',
          kind: 'system',
          layer: 'frontend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'p',
          kind: 'ui_page',
          layer: 'frontend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'gw',
          kind: 'api_gateway',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 's1',
          kind: 'service',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 's2',
          kind: 'service',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'd1',
          kind: 'database',
          layer: 'data',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'd2',
          kind: 'database',
          layer: 'data',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [
        { id: 'e1', source: 'p', target: 'sys', kind: 'depends_on' },
        { id: 'e2', source: 'p', target: 'gw', kind: 'calls' },
        { id: 'e3', source: 'gw', target: 's1', kind: 'calls' },
        { id: 'e4', source: 'gw', target: 's2', kind: 'calls' },
        { id: 'e5', source: 's1', target: 'd1', kind: 'reads' },
        { id: 'e6', source: 's2', target: 'd2', kind: 'reads' },
      ],
    };
    const ctx = buildGraphContext(graph);
    const metrics = calculateMetrics(ctx);
    const style = detectArchitectureStyle(ctx, metrics);
    expect(style).toBe('microservices');
  });

  it('Event-driven preset → event-driven', () => {
    const graph = {
      meta: { name: 'ev', version: 1, createdAt: '' },
      nodes: [
        {
          id: 'p',
          kind: 'ui_page',
          layer: 'frontend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'gw',
          kind: 'api_gateway',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'prod',
          kind: 'service',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'cons',
          kind: 'service',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
        {
          id: 'store',
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
        { id: 'e1', source: 'p', target: 'gw', kind: 'calls' },
        { id: 'e2', source: 'gw', target: 'prod', kind: 'calls' },
        { id: 'e3', source: 'prod', target: 'store', kind: 'writes' },
        { id: 'e4', source: 'prod', target: 'cons', kind: 'emits' },
        { id: 'e5', source: 'cons', target: 'store', kind: 'reads' },
        { id: 'e6', source: 'cons', target: 'cache', kind: 'writes' },
      ],
    };
    const ctx = buildGraphContext(graph);
    const metrics = calculateMetrics(ctx);
    const style = detectArchitectureStyle(ctx, metrics);
    expect(style).toBe('event-driven');
  });
});
