import type {
  AiAnalysisContext,
  AiRecommendationProvider,
} from './ai-recommendation-provider.interface.js';

/** Моковые данные для демонстрации UI (используется при отсутствии GROQ_API_KEY) */
const MOCK_RECOMMENDATIONS: string[] = [
  '**Общее впечатление**\n\nАрхитектура выглядит в целом сбалансированной. Слоистая структура (Frontend → Backend → Data) соблюдена. Основные риски связаны с количеством найденных проблем и метриками — снижение оценки за счёт issues и метрик указывает на зоны для улучшения.',
  '**Рекомендации**\n\n- Добавьте кэш между сервисами и базами данных для снижения нагрузки на БД при частых чтениях.\n- Рассмотрите введение API Gateway для централизованной маршрутизации и аутентификации.\n- Убедитесь, что синхронные цепочки вызовов не слишком длинные — при необходимости разбейте на асинхронные потоки.\n- Проверьте наличие error boundary и обработки ошибок на стороне клиента при вызове API.',
  '**На что обратить внимание**\n\n- Высокий fan-out у отдельных узлов может указывать на потенциальные узкие места при масштабировании.\n- При наличии внешних систем предусмотрите fallback и circuit breaker.',
];

export class AiRecommendationStubProvider implements AiRecommendationProvider {
  /* eslint-disable @typescript-eslint/no-unused-vars -- stub implements interface but ignores args */
  getRecommendations(_context: AiAnalysisContext): Promise<string[]> {
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return Promise.resolve(MOCK_RECOMMENDATIONS);
  }
}
