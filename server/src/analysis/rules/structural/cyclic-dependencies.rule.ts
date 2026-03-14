import { randomUUID } from 'node:crypto';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class CyclicDependenciesRule implements AnalysisRule {
  readonly id = 'S02';
  readonly description = 'Циклы в графе зависимостей';

  check(ctx: GraphContext): AnalysisIssue[] {
    const cycles = this.detectCycles(ctx);

    if (cycles.length === 0) return [];

    return [
      {
        id: randomUUID(),
        ruleId: this.id,
        severity: 'critical',
        category: 'architecture',
        title: 'Циклические зависимости',
        description: `Обнаружены циклы в графе: ${cycles
          .map((cycle) => cycle.join(' → '))
          .join('; ')}`,
        affectedNodes: [...new Set(cycles.flat())],
        recommendation: 'Разорвите циклические зависимости.',
      },
    ];
  }

  private detectCycles(ctx: GraphContext): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];
    const pathIndex = new Map<string, number>();

    const visit = (nodeId: string): void => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);
      pathIndex.set(nodeId, path.length - 1);

      const neighbors = ctx.adjacency.get(nodeId) ?? [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visit(neighbor);
        } else if (recursionStack.has(neighbor)) {
          const startIndex = pathIndex.get(neighbor) ?? 0;
          cycles.push(path.slice(startIndex));
        }
      }

      path.pop();
      pathIndex.delete(nodeId);
      recursionStack.delete(nodeId);
    };

    for (const node of ctx.nodes) {
      if (!visited.has(node.id)) {
        visit(node.id);
      }
    }

    return cycles;
  }
}
