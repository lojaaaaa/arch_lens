import { randomUUID } from 'node:crypto';
import type { AnalysisIssue, AnalysisRule, GraphContext } from '../../interfaces/index.js';

export class NoApiGatewayRule implements AnalysisRule {
  readonly id = 'S07';
  readonly description = 'Сервисы без API Gateway — отсутствует единая точка входа';

  check(ctx: GraphContext): AnalysisIssue[] {
    const services = ctx.nodes.filter((n) => n.kind === 'service');
    const hasGateway = ctx.nodes.some((n) => n.kind === 'api_gateway');

    if (services.length === 0 || hasGateway) return [];

    return [
      {
        id: randomUUID(),
        severity: 'warning',
        category: 'architecture',
        title: 'Отсутствует API Gateway',
        description:
          'В архитектуре присутствуют сервисы, но нет API Gateway. Это может усложнить маршрутизацию запросов, авторизацию и мониторинг.',
        affectedNodes: services.map((n) => n.id),
        recommendation:
          'Рассмотрите добавление API Gateway для централизованной маршрутизации, аутентификации и агрегации запросов к сервисам.',
      },
    ];
  }
}
