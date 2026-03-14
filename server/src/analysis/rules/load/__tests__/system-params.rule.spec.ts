import { buildGraphContext } from '../../../engine/graph-context.builder.js';
import { RuleEngine } from '../../../engine/rule-engine.js';
import { loadRules } from '../index.js';

const pos = { x: 0, y: 0 };

describe('SYS System params (V2-B2)', () => {
  const engine = new RuleEngine();
  engine.registerAll(loadRules);

  it('SLO 200ms, Critical Path > 200ms → SYS warning', () => {
    const graph = {
      meta: { name: 'slo', version: 1, createdAt: '' },
      nodes: [
        {
          id: 'sys',
          kind: 'system',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
          latencySloMs: 200,
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
          id: 's3',
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
      ],
      edges: [
        { id: 'e1', source: 'gw', target: 's1', kind: 'calls' },
        { id: 'e2', source: 's1', target: 's2', kind: 'calls' },
        { id: 'e3', source: 's2', target: 's3', kind: 'calls' },
        { id: 'e4', source: 's3', target: 'db', kind: 'calls' },
      ],
    };
    const ctx = buildGraphContext(graph);
    const issues = engine.run(ctx);
    const sys = issues.filter((issue) => issue.ruleId === 'SYS');

    expect(sys.length).toBeGreaterThanOrEqual(1);
    const sloIssue = sys.find((issue) => issue.metrics?.latencySloMs === 200);
    expect(sloIssue).toBeDefined();
    expect(sloIssue?.severity).toBe('warning');
    expect(sloIssue?.title).toContain('SLO');
  });

  it('targetThroughputRps 100, load 150 → SYS bottleneck warning', () => {
    const graph = {
      meta: { name: 'throughput', version: 1, createdAt: '' },
      nodes: [
        {
          id: 'sys',
          kind: 'system',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
          targetThroughputRps: 100,
        },
        {
          id: 'gw',
          kind: 'api_gateway',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
          requestRate: 150,
        },
        {
          id: 's1',
          kind: 'service',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [{ id: 'e1', source: 'gw', target: 's1', kind: 'calls' }],
    };
    const ctx = buildGraphContext(graph);
    const issues = engine.run(ctx);
    const sys = issues.filter((issue) => issue.ruleId === 'SYS');

    expect(sys.length).toBeGreaterThanOrEqual(1);
    const rpsIssue = sys.find(
      (issue) => issue.metrics?.targetThroughputRps === 100,
    );
    expect(rpsIssue).toBeDefined();
    expect(rpsIssue?.severity).toBe('warning');
    expect(rpsIssue?.title).toContain('throughput');
  });

  it('deploymentModel microservices + 1 service → SYS info', () => {
    const graph = {
      meta: { name: 'deploy', version: 1, createdAt: '' },
      nodes: [
        {
          id: 'sys',
          kind: 'system',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
          deploymentModel: 'microservices',
        },
        {
          id: 's1',
          kind: 'service',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [],
    };
    const ctx = buildGraphContext(graph);
    const issues = engine.run(ctx);
    const sys = issues.filter((issue) => issue.ruleId === 'SYS');

    expect(sys.length).toBeGreaterThanOrEqual(1);
    const deployIssue = sys.find((issue) =>
      issue.title?.includes('развёртыван'),
    );
    expect(deployIssue).toBeDefined();
    expect(deployIssue?.severity).toBe('info');
    expect(deployIssue?.metrics?.serviceCount).toBe(1);
  });

  it('no system node → no SYS issues', () => {
    const graph = {
      meta: { name: 'no-sys', version: 1, createdAt: '' },
      nodes: [
        {
          id: 's1',
          kind: 'service',
          layer: 'backend',
          position: pos,
          complexity: 1,
          criticality: 1,
        },
      ],
      edges: [],
    };
    const ctx = buildGraphContext(graph);
    const issues = engine.run(ctx);
    const sys = issues.filter((issue) => issue.ruleId === 'SYS');
    expect(sys).toHaveLength(0);
  });
});
