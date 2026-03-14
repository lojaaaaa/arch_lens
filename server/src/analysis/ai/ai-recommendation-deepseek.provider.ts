import type {
  AiAnalysisContext,
  AiRecommendationProvider,
} from './ai-recommendation-provider.interface.js';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';
const MAX_TOKENS = 1500;

const GRADE_LABELS: Record<string, string> = {
  A: 'отличная',
  B: 'хорошая',
  C: 'удовлетворительная',
  D: 'слабая',
  F: 'критическая',
};

const STYLE_LABELS: Record<string, string> = {
  layered: 'слоистая',
  microservices: 'микросервисы',
  'event-driven': 'событийная',
  'client-server': 'клиент-сервер',
  monolith: 'монолит',
};

function buildPrompt(ctx: AiAnalysisContext): string {
  const gradeLabel = GRADE_LABELS[ctx.grade] ?? ctx.grade;
  const styleLabel =
    STYLE_LABELS[ctx.architecturalStyle ?? ''] ??
    ctx.architecturalStyle ??
    'не определён';

  const b = ctx.scoreBreakdown;
  const formula = `${b.final} = ${b.maxScore} − ${b.penalty} (issues) − ${b.metricsPenalty} (метрики) + ${b.bonus} (бонус)`;

  const critCount = ctx.issues.filter((i) => i.severity === 'critical').length;
  const warnCount = ctx.issues.filter((i) => i.severity === 'warning').length;
  const infoCount = ctx.issues.filter((i) => i.severity === 'info').length;

  const topIssues = ctx.issues
    .filter((i) => i.severity !== 'info')
    .slice(0, 5)
    .map((i) => `  - [${i.severity}] ${i.title}: ${i.description}`)
    .join('\n');

  const nodeKinds = Object.entries(ctx.nodeKindCounts)
    .map(([kind, count]) => `${kind}: ${count}`)
    .join(', ');

  const edgeKinds = Object.entries(ctx.edgeKindCounts)
    .map(([kind, count]) => `${kind}: ${count}`)
    .join(', ');

  return `Ты — эксперт по архитектуре программного обеспечения. На основе результатов автоматического анализа архитектурной схемы, дай пользователю полезное резюме и рекомендации.

## Результаты анализа

Оценка: ${ctx.score}/100 (${gradeLabel}), грейд ${ctx.grade}
Формула: ${formula}
Риск: ${(ctx.riskScore * 100).toFixed(0)}%
Уверенность в данных: ${(ctx.confidenceScore * 100).toFixed(0)}%
Стиль: ${styleLabel}

Узлы (${ctx.metrics.totalNodes}): ${nodeKinds}
Связи (${ctx.metrics.totalEdges}): ${edgeKinds}

Ключевые метрики:
- Плотность графа: ${ctx.metrics.density.toFixed(3)}
- Глубина: ${ctx.metrics.depth}
- Циклы: ${ctx.metrics.cycleCount}
- Max fan-out: ${ctx.metrics.maxFanOut}, avg fan-out: ${ctx.metrics.avgFanOut.toFixed(1)}
- Сложность frontend: ${ctx.metrics.frontendComplexity}, backend: ${ctx.metrics.backendComplexity}
- Критичных узлов: ${ctx.metrics.criticalNodesCount}

Проблемы: ${critCount} критических, ${warnCount} предупреждений, ${infoCount} информационных
${topIssues ? `Основные:\n${topIssues}` : ''}

## Задача

Напиши ответ на русском языке в таком формате:

1. **Общее впечатление** (2-3 предложения): краткая оценка архитектуры — что хорошо, что вызывает опасения, общий вердикт.

2. **Рекомендации** (3-5 пунктов): конкретные советы по улучшению архитектуры. Объясни ПОЧЕМУ это важно. Не привязывайся к конкретным id узлов — давай общие архитектурные советы.

3. **На что обратить внимание** (1-2 пункта): потенциальные риски или узкие места, которые стоит проверить.

Правила:
- Отвечай на русском
- Каждый пункт рекомендаций начинай с "- "
- Не повторяй проблемы дословно — интерпретируй и объясняй
- Будь полезен: давай советы, которые помогут улучшить архитектуру
- Не пиши "На основе анализа..." и подобные вступления, начинай сразу с контента`;
}

export class AiRecommendationDeepSeekProvider implements AiRecommendationProvider {
  constructor(private readonly apiKey: string) {}

  async getRecommendations(context: AiAnalysisContext): Promise<string[]> {
    try {
      const prompt = buildPrompt(context);
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content:
                'Ты — архитектурный консультант. Даёшь понятные, полезные советы по архитектуре ПО на русском языке. Пиши кратко и по делу.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: MAX_TOKENS,
          temperature: 0.6,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(
          `[AiRecommendation] DeepSeek API error ${response.status}: ${errText.slice(0, 300)}`,
        );
        return [];
      }

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content?.trim() ?? '';

      if (!text) {
        return [];
      }

      const paragraphs = text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      return paragraphs;
    } catch (err) {
      console.warn('[AiRecommendation] DeepSeek request failed:', err);
      return [];
    }
  }
}
