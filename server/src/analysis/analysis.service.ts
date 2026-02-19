/**
 * Architecture analysis service - graph structure analysis, metrics, issues (NestJS).
 */

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ArchitectureGraphDto } from './dto/architecture-graph.dto';

export interface AnalysisIssue {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
  title: string;
  description: string;
  affectedNodes: string[];
  affectedEdges?: string[];
  recommendation?: string;
  metrics?: Record<string, number>;
}

export interface AnalysisMetrics {
  totalNodes: number;
  totalEdges: number;
  frontendComplexity: number;
  backendComplexity: number;
  criticalNodesCount: number;
  estimatedRenderPressure: number;
  estimatedApiLoad: number;
  estimatedDataLoad: number;
}

export interface AnalysisResultDto {
  summary: {
    score: number;
    issuesCount: number;
    criticalIssuesCount: number;
  };
  metrics: AnalysisMetrics;
  issues: AnalysisIssue[];
  generatedAt: string;
  modelVersion: string;
}

@Injectable()
export class AnalysisService {
  private readonly modelVersion = '1.0';

  analyze(graph: ArchitectureGraphDto): AnalysisResultDto {
    const { nodes, edges } = graph;

    const issues: AnalysisIssue[] = [];

    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const incomingCount = new Map<string, number>();
    const outgoingCount = new Map<string, number>();

    for (const edge of edges) {
      outgoingCount.set(edge.source, (outgoingCount.get(edge.source) ?? 0) + 1);
      incomingCount.set(edge.target, (incomingCount.get(edge.target) ?? 0) + 1);
    }

    const frontendComplexity = nodes
      .filter((node) => node.layer === 'frontend')
      .reduce((sum, node) => sum + (node.complexity ?? 1), 0);
    const backendComplexity = nodes
      .filter((node) => node.layer === 'backend' || node.layer === 'data')
      .reduce((sum, node) => sum + (node.complexity ?? 1), 0);
    const criticalNodesCount = nodes.filter(
      (node) => (node.criticality ?? 0) >= 2,
    ).length;

    const maxOutgoing = Math.max(...Array.from(outgoingCount.values()), 1);
    const bottleneckThreshold = Math.max(3, Math.ceil(maxOutgoing * 0.7));

    for (const [nodeId, count] of outgoingCount) {
      if (count >= bottleneckThreshold) {
        // const node = nodeById.get(nodeId);
        issues.push({
          id: randomUUID(),
          severity: count >= 5 ? 'critical' : 'warning',
          category: 'architecture',
          title: 'Слишком много исходящих связей у узла',
          description: `Узел "${nodeId}" имеет ${count} исходящих связей. Это может создавать bottleneck.`,
          affectedNodes: [nodeId],
          recommendation:
            'Рассмотрите декомпозицию узла или вынос части логики.',
        });
      }
    }

    const orphanNodes = nodes.filter(
      (node) =>
        !edges.some(
          (edge) => edge.source === node.id || edge.target === node.id,
        ),
    );
    if (orphanNodes.length > 0) {
      issues.push({
        id: randomUUID(),
        severity: 'info',
        category: 'architecture',
        title: 'Обнаружены изолированные узлы',
        description: `${orphanNodes.length} узел(ов) не связаны с остальной системой.`,
        affectedNodes: orphanNodes.map((node) => node.id),
        recommendation:
          'Проверьте, должны ли эти узлы быть частью архитектуры.',
      });
    }

    const cycles = this.detectCycles(nodes, edges);
    if (cycles.length > 0) {
      issues.push({
        id: randomUUID(),
        severity: 'critical',
        category: 'architecture',
        title: 'Циклические зависимости',
        description: `Обнаружены циклы в графе: ${cycles
          .map((cycle) => cycle.join(' → '))
          .join('; ')}`,
        affectedNodes: [...new Set(cycles.flat())],
        recommendation: 'Разорвите циклические зависимости.',
      });
    }

    const stateStoreNodes = nodes.filter((node) => node.kind === 'state_store');
    const directUiToState = edges.filter((edge) => {
      const sourceNode = nodeById.get(edge.source);
      const targetNode = nodeById.get(edge.target);
      return (
        sourceNode?.kind === 'ui_page' && targetNode?.kind === 'state_store'
      );
    });
    if (directUiToState.length > 0) {
      issues.push({
        id: randomUUID(),
        severity: 'warning',
        category: 'maintainability',
        title: 'Прямая связь UI с глобальным состоянием',
        description:
          'Страницы напрямую связаны со store. Рекомендуется использовать компоненты как прослойку.',
        affectedNodes: [
          ...new Set(
            directUiToState.flatMap((edge) => [edge.source, edge.target]),
          ),
        ],
        recommendation:
          'Добавьте промежуточные UI компоненты между страницами и store.',
      });
    }

    const estimatedRenderPressure =
      frontendComplexity * (stateStoreNodes.length || 1);
    const estimatedApiLoad = edges.filter(
      (edge) => edge.kind === 'calls' || edge.kind === 'reads',
    ).length;
    const estimatedDataLoad = edges.filter(
      (edge) => edge.kind === 'reads' || edge.kind === 'writes',
    ).length;

    const criticalCount = issues.filter(
      (issue) => issue.severity === 'critical',
    ).length;
    const baseScore = 100 - issues.length * 5 - criticalCount * 15;
    const score = Math.max(0, Math.min(100, baseScore));

    return {
      summary: {
        score,
        issuesCount: issues.length,
        criticalIssuesCount: criticalCount,
      },
      metrics: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        frontendComplexity,
        backendComplexity,
        criticalNodesCount,
        estimatedRenderPressure,
        estimatedApiLoad,
        estimatedDataLoad,
      },
      issues,
      generatedAt: new Date().toISOString(),
      modelVersion: this.modelVersion,
    };
  }

  private detectCycles(
    nodes: { id: string }[],
    edges: { source: string; target: string }[],
  ): string[][] {
    const adjacency = new Map<string, string[]>();
    for (const edge of edges) {
      const neighbors = adjacency.get(edge.source) ?? [];
      neighbors.push(edge.target);
      adjacency.set(edge.source, neighbors);
    }

    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];
    const pathIndex = new Map<string, number>();

    const visit = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);
      pathIndex.set(nodeId, path.length - 1);

      const neighbors = adjacency.get(nodeId) ?? [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (visit(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          const startIndex = pathIndex.get(neighbor) ?? 0;
          cycles.push(path.slice(startIndex));
          return true;
        }
      }

      path.pop();
      pathIndex.delete(nodeId);
      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        visit(node.id);
      }
    }

    return cycles;
  }
}
