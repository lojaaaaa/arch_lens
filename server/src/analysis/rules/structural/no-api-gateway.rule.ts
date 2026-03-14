import { randomUUID } from 'node:crypto';
import type {
  AnalysisIssue,
  AnalysisRule,
  GraphContext,
} from '../../interfaces/index.js';

export class NoApiGatewayRule implements AnalysisRule {
  readonly id = 'S07';
  readonly description =
    'Сервисы без API Gateway — отсутствует единая точка входа';

  check(ctx: GraphContext): AnalysisIssue[] {
    const services = ctx.nodes.filter((node) => node.kind === 'service');
    const hasGateway = ctx.nodes.some((node) => node.kind === 'api_gateway');

    if (services.length === 0 || hasGateway) return [];

    return [
      {
        id: randomUUID(),
        ruleId: this.id,
        severity: 'warning',
        category: 'architecture',
        title: 'Отсутствует API Gateway',
        description:
          'В архитектуре присутствуют сервисы, но нет API Gateway. Это может усложнить маршрутизацию запросов, авторизацию и мониторинг.',
        affectedNodes: services.map((node) => node.id),
        recommendation:
          'Добавьте API Gateway между клиентом и сервисами — для централизованной маршрутизации, аутентификации и агрегации запросов.',
      },
    ];
  }
}
