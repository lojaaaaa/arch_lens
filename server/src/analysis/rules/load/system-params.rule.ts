/**
 * V2-B2: Влияние системных параметров System node на анализ.
 * - targetAvailability vs расчётная availability → warning если хуже
 * - targetThroughputRps vs load → bottleneck если превышено
 * - latencySloMs vs Critical Path → warning если путь > SLO
 * - deploymentModel vs фактическая структура → consistency check
 */

import { randomUUID } from 'node:crypto';
import {
  calculateCriticalPath,
  getEntryPoints,
  propagateLoad,
} from '../../engine/index.js';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

function getSystemNode(ctx: GraphContext) {
  return ctx.nodes.find((node) => node.kind === 'system') as
    | ((typeof ctx.nodes)[0] & {
        targetAvailability?: number;
        targetThroughputRps?: number;
        latencySloMs?: number;
        deploymentModel?: string;
      })
    | undefined;
}

function getEntryRequestRate(
  ctx: GraphContext,
  entryId: string,
): number | null {
  const node = ctx.nodeById.get(entryId);
  if (!node) return null;
  if (node.kind === 'api_gateway') {
    const rate = Number(node['requestRate']);
    return Number.isFinite(rate) && rate > 0 ? rate : null;
  }
  if (node.kind === 'ui_page') {
    const rate = Number(node['updateFrequency']);
    return Number.isFinite(rate) && rate > 0 ? rate : null;
  }
  return null;
}

/** Грубая оценка availability: произведение reliability внешних систем. */
function estimateSystemAvailability(ctx: GraphContext): number | null {
  const externals = ctx.nodes.filter((node) => node.kind === 'external_system');
  if (externals.length === 0) return null;
  let product = 1;
  let hasData = false;
  for (const ext of externals) {
    const reliability = Number(ext['reliability']);
    if (Number.isFinite(reliability) && reliability >= 0 && reliability <= 1) {
      product *= reliability;
      hasData = true;
    }
  }
  return hasData ? product : null;
}

export class SystemParamsRule implements AnalysisRule {
  readonly id = 'SYS';
  readonly description = 'Системные параметры vs факт';

  check(ctx: GraphContext): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const systemNode = getSystemNode(ctx);

    if (!systemNode) return [];

    const { totalMs, pathNodeIds } = calculateCriticalPath(ctx);
    const serviceCount = ctx.nodes.filter(
      (node) => node.kind === 'service',
    ).length;

    // latencySloMs vs Critical Path
    const latencySlo = Number(systemNode.latencySloMs);
    if (
      Number.isFinite(latencySlo) &&
      latencySlo > 0 &&
      totalMs > latencySlo &&
      pathNodeIds.length > 0
    ) {
      issues.push({
        id: randomUUID(),
        ruleId: this.id,
        severity: 'warning',
        category: 'performance',
        title: 'Critical Path превышает SLO',
        description: `Критический путь (${Math.round(totalMs)} мс) превышает заданный SLO (${latencySlo} мс).`,
        affectedNodes: pathNodeIds,
        recommendation:
          'Упростите цепочку вызовов, введите кэширование или асинхронные этапы.',
        metrics: { criticalPathMs: totalMs, latencySloMs: latencySlo },
      });
    }

    // targetThroughputRps vs load
    const targetRps = Number(systemNode.targetThroughputRps);
    if (Number.isFinite(targetRps) && targetRps > 0) {
      const allLoadByNode = new Map<string, number>();
      for (const entryId of getEntryPoints(ctx)) {
        const requestRate = getEntryRequestRate(ctx, entryId);
        if (requestRate == null) continue;
        const load = propagateLoad(ctx, entryId, requestRate);
        for (const [nodeId, nodeLoad] of load) {
          allLoadByNode.set(
            nodeId,
            (allLoadByNode.get(nodeId) ?? 0) + nodeLoad,
          );
        }
      }
      let maxLoad = 0;
      let maxLoadNodeId: string | null = null;
      for (const [nodeId, load] of allLoadByNode) {
        if (load > maxLoad) {
          maxLoad = load;
          maxLoadNodeId = nodeId;
        }
      }
      if (maxLoad > targetRps && maxLoadNodeId) {
        issues.push({
          id: randomUUID(),
          ruleId: this.id,
          severity: 'warning',
          category: 'performance',
          title: 'Нагрузка превышает целевой throughput',
          description: `Макс. нагрузка (${Math.round(maxLoad)} rps) превышает целевой throughput (${targetRps} rps).`,
          affectedNodes: [maxLoadNodeId],
          recommendation:
            'Увеличьте целевой throughput или оптимизируйте архитектуру.',
          metrics: { load: maxLoad, targetThroughputRps: targetRps },
        });
      }
    }

    // targetAvailability vs расчётная availability
    const targetAvail = Number(systemNode.targetAvailability);
    if (Number.isFinite(targetAvail) && targetAvail > 0 && targetAvail <= 1) {
      const estimated = estimateSystemAvailability(ctx);
      if (estimated != null && estimated < targetAvail) {
        issues.push({
          id: randomUUID(),
          ruleId: this.id,
          severity: 'warning',
          category: 'reliability',
          title: 'Расчётная доступность ниже целевой',
          description: `Оценка доступности (${(estimated * 100).toFixed(1)}%) ниже целевой (${(targetAvail * 100).toFixed(1)}%). Проверьте reliability внешних систем.`,
          affectedNodes: ctx.nodes
            .filter((node) => node.kind === 'external_system')
            .map((node) => node.id),
          recommendation:
            'Увеличьте reliability внешних систем или снизьте зависимость от них.',
          metrics: {
            estimatedAvailability: estimated,
            targetAvailability: targetAvail,
          },
        });
      }
    }

    // deploymentModel vs структура
    const model = systemNode.deploymentModel;
    if (model === 'microservices' && serviceCount < 2) {
      issues.push({
        id: randomUUID(),
        ruleId: this.id,
        severity: 'info',
        category: 'architecture',
        title: 'Несоответствие модели развёртывания',
        description: `Указана модель "Микросервисы", но найден только ${serviceCount} сервис.`,
        affectedNodes: systemNode.id ? [systemNode.id] : [],
        recommendation: 'Добавьте сервисы или измените модель на "Монолит".',
        metrics: { serviceCount },
      });
    }
    if (model === 'monolith' && serviceCount > 5) {
      issues.push({
        id: randomUUID(),
        ruleId: this.id,
        severity: 'info',
        category: 'architecture',
        title: 'Несоответствие модели развёртывания',
        description: `Указана модель "Монолит", но найдено ${serviceCount} сервисов. Возможно, архитектура ближе к микросервисам.`,
        affectedNodes: systemNode.id ? [systemNode.id] : [],
        recommendation:
          'Уточните модель развёртывания или упростите архитектуру.',
        metrics: { serviceCount },
      });
    }

    return issues;
  }
}
