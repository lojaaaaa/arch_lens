import { randomUUID } from 'node:crypto';
import { ANALYSIS_CONFIG } from '../../analysis.config.js';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class SyncChainLatencyRule implements AnalysisRule {
  readonly id = 'L06';
  readonly description = 'Длинная цепочка синхронных вызовов';

  check(ctx: GraphContext): AnalysisIssue[] {
    const syncEdges = ctx.edges.filter(
      (edge) => edge.synchronous === true || edge.kind === 'calls',
    );

    const outgoing = new Map<string, string[]>();
    for (const edge of syncEdges) {
      const list = outgoing.get(edge.source) ?? [];
      list.push(edge.target);
      outgoing.set(edge.source, list);
    }

    let maxChain: string[] = [];

    const dfs = (
      nodeId: string,
      visited: Set<string>,
      path: string[],
    ): void => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      path.push(nodeId);

      if (path.length > maxChain.length) {
        maxChain = [...path];
      }

      const next = outgoing.get(nodeId) ?? [];
      for (const nextNode of next) {
        dfs(nextNode, new Set(visited), [...path]);
      }
    };

    for (const node of ctx.nodes) {
      dfs(node.id, new Set(), []);
    }

    if (maxChain.length < ANALYSIS_CONFIG.load.syncChainLengthThreshold)
      return [];

    const estimatedLatencyMs = maxChain.length * 100;

    return [
      {
        id: randomUUID(),
        severity: 'warning',
        category: 'performance',
        title: 'Длинная цепочка синхронных вызовов',
        description: `Обнаружена цепочка из ${maxChain.length} синхронных вызовов. Оценочная латентность ~${estimatedLatencyMs} мс.`,
        affectedNodes: maxChain,
        recommendation:
          'Разбейте цепочку на асинхронные этапы или введите очереди.',
        metrics: {
          chainLength: maxChain.length,
          estimatedLatencyMs,
        },
      },
    ];
  }
}
