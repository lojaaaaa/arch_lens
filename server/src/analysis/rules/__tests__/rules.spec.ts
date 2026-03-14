import type { ArchitectureGraphDto } from '../../dto/architecture-graph.dto';
import { buildGraphContext } from '../../engine/graph-context.builder';
import { RuleEngine } from '../../engine/rule-engine';
import { FrontendDbDirectRule } from '../structural/frontend-db-direct.rule';
import { OrphanNodesRule } from '../structural/orphan-nodes.rule';
import { CyclicDependenciesRule } from '../structural/cyclic-dependencies.rule';
import { EdgeSemanticsRule } from '../pattern/edge-semantics.rule';

function createNode(
  id: string,
  kind: string,
  layer: string,
  overrides?: Partial<{ complexity: number; criticality: number }>,
) {
  return {
    id,
    kind,
    layer,
    position: { x: 0, y: 0 },
    complexity: overrides?.complexity ?? 1,
    criticality: overrides?.criticality ?? 1,
  };
}

function createEdge(id: string, source: string, target: string, kind: string) {
  return { id, source, target, kind };
}

function createGraph(
  nodes: ArchitectureGraphDto['nodes'],
  edges: ArchitectureGraphDto['edges'],
): ArchitectureGraphDto {
  return {
    meta: { name: 'test', version: 1, createdAt: new Date().toISOString() },
    nodes,
    edges,
  };
}

describe('OrphanNodesRule (S01)', () => {
  const rule = new OrphanNodesRule();

  it('returns no issues when all nodes are connected', () => {
    const graph = createGraph(
      [
        createNode('a', 'service', 'backend'),
        createNode('b', 'database', 'data'),
      ],
      [createEdge('e1', 'a', 'b', 'reads')],
    );
    const ctx = buildGraphContext(graph);
    const issues = rule.check(ctx);
    expect(issues).toHaveLength(0);
  });

  it('returns issue when node has no edges', () => {
    const graph = createGraph(
      [
        createNode('a', 'service', 'backend'),
        createNode('b', 'database', 'data'),
      ],
      [createEdge('e1', 'a', 'b', 'reads')],
    );
    const graphWithOrphan = createGraph(
      [...graph.nodes, createNode('orphan', 'service', 'backend')],
      graph.edges,
    );
    const ctx = buildGraphContext(graphWithOrphan);
    const issues = rule.check(ctx);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe('info');
    expect(issues[0].affectedNodes).toContain('orphan');
  });
});

describe('FrontendDbDirectRule (S06)', () => {
  const rule = new FrontendDbDirectRule();

  it('returns no issues when backend calls database', () => {
    const graph = createGraph(
      [
        createNode('svc', 'service', 'backend'),
        createNode('db', 'database', 'data'),
      ],
      [createEdge('e1', 'svc', 'db', 'reads')],
    );
    const ctx = buildGraphContext(graph);
    const issues = rule.check(ctx);
    expect(issues).toHaveLength(0);
  });

  it('returns critical issue when frontend directly reads from database', () => {
    const graph = createGraph(
      [
        createNode('page', 'ui_page', 'frontend'),
        createNode('db', 'database', 'data'),
      ],
      [createEdge('e1', 'page', 'db', 'reads')],
    );
    const ctx = buildGraphContext(graph);
    const issues = rule.check(ctx);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe('critical');
    expect(issues[0].affectedNodes).toContain('page');
    expect(issues[0].affectedNodes).toContain('db');
  });

  it('returns critical issue when frontend directly writes to database', () => {
    const graph = createGraph(
      [
        createNode('comp', 'ui_component', 'frontend'),
        createNode('db', 'database', 'data'),
      ],
      [createEdge('e1', 'comp', 'db', 'writes')],
    );
    const ctx = buildGraphContext(graph);
    const issues = rule.check(ctx);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe('critical');
  });

  it('ignores frontend→cache (not database)', () => {
    const graph = createGraph(
      [
        createNode('page', 'ui_page', 'frontend'),
        createNode('cache', 'cache', 'data'),
      ],
      [createEdge('e1', 'page', 'cache', 'reads')],
    );
    const ctx = buildGraphContext(graph);
    const issues = rule.check(ctx);
    expect(issues).toHaveLength(0);
  });

  it('negative: fixing graph (routing through backend) removes issue', () => {
    const badGraph = createGraph(
      [
        createNode('page', 'ui_page', 'frontend'),
        createNode('db', 'database', 'data'),
      ],
      [createEdge('e1', 'page', 'db', 'reads')],
    );
    const goodGraph = createGraph(
      [
        createNode('page', 'ui_page', 'frontend'),
        createNode('svc', 'service', 'backend'),
        createNode('db', 'database', 'data'),
      ],
      [
        createEdge('e1', 'page', 'svc', 'calls'),
        createEdge('e2', 'svc', 'db', 'reads'),
      ],
    );
    expect(rule.check(buildGraphContext(badGraph))).toHaveLength(1);
    expect(rule.check(buildGraphContext(goodGraph))).toHaveLength(0);
  });
});

describe('CyclicDependenciesRule (S02)', () => {
  const rule = new CyclicDependenciesRule();

  it('returns no issues when no cycle exists', () => {
    const graph = createGraph(
      [
        createNode('a', 'service', 'backend'),
        createNode('b', 'service', 'backend'),
        createNode('c', 'database', 'data'),
      ],
      [
        createEdge('e1', 'a', 'b', 'calls'),
        createEdge('e2', 'b', 'c', 'reads'),
      ],
    );
    const ctx = buildGraphContext(graph);
    const issues = rule.check(ctx);
    expect(issues).toHaveLength(0);
  });

  it('returns critical issue when cycle exists', () => {
    const graph = createGraph(
      [
        createNode('a', 'service', 'backend'),
        createNode('b', 'service', 'backend'),
      ],
      [
        createEdge('e1', 'a', 'b', 'calls'),
        createEdge('e2', 'b', 'a', 'calls'),
      ],
    );
    const ctx = buildGraphContext(graph);
    const issues = rule.check(ctx);
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues.some((issue) => issue.severity === 'critical')).toBe(true);
  });
});

describe('EdgeSemanticsRule (P09)', () => {
  const rule = new EdgeSemanticsRule();

  it('returns no issues when edge semantics are correct', () => {
    const graph = createGraph(
      [
        createNode('svc', 'service', 'backend'),
        createNode('db', 'database', 'data'),
      ],
      [createEdge('e1', 'svc', 'db', 'reads')],
    );
    const ctx = buildGraphContext(graph);
    const issues = rule.check(ctx);
    expect(issues).toHaveLength(0);
  });

  it('returns warning when service uses calls to database instead of reads/writes', () => {
    const graph = createGraph(
      [
        createNode('svc', 'service', 'backend'),
        createNode('db', 'database', 'data'),
      ],
      [createEdge('e1', 'svc', 'db', 'calls')],
    );
    const ctx = buildGraphContext(graph);
    const issues = rule.check(ctx);
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe('warning');
    expect(issues[0].ruleId).toBe('P09');
    expect(issues[0].title).toContain('семантика');
    expect(issues[0].affectedEdges).toContain('e1');
  });

  it('returns warning for ui_component->database with reads (blocked by S06 as critical)', () => {
    const graph = createGraph(
      [
        createNode('comp', 'ui_component', 'frontend'),
        createNode('db', 'database', 'data'),
      ],
      [createEdge('e1', 'comp', 'db', 'reads')],
    );
    const ctx = buildGraphContext(graph);
    const issues = rule.check(ctx);
    // P09: ui_component has no valid edge to database at all
    expect(issues).toHaveLength(1);
    expect(issues[0].ruleId).toBe('P09');
  });

  it('accepts service->service calls and service->cache reads', () => {
    const graph = createGraph(
      [
        createNode('a', 'service', 'backend'),
        createNode('b', 'service', 'backend'),
        createNode('cache', 'cache', 'data'),
      ],
      [
        createEdge('e1', 'a', 'b', 'calls'),
        createEdge('e2', 'a', 'cache', 'reads'),
      ],
    );
    const ctx = buildGraphContext(graph);
    const issues = rule.check(ctx);
    expect(issues).toHaveLength(0);
  });
});

describe('RuleEngine', () => {
  it('runs multiple rules and aggregates issues', () => {
    const engine = new RuleEngine();
    engine.register(new OrphanNodesRule());
    engine.register(new FrontendDbDirectRule());

    const graph = createGraph(
      [
        createNode('page', 'ui_page', 'frontend'),
        createNode('db', 'database', 'data'),
        createNode('orphan', 'service', 'backend'),
      ],
      [createEdge('e1', 'page', 'db', 'reads')],
    );
    const ctx = buildGraphContext(graph);
    const issues = engine.run(ctx);

    expect(issues.length).toBeGreaterThanOrEqual(2);
    expect(
      issues.some((issue) => issue.title.includes('Прямое обращение')),
    ).toBe(true);
    expect(issues.some((issue) => issue.title.includes('изолированн'))).toBe(
      true,
    );
  });
});
