import type { AiRecommendationProvider } from './ai-recommendation-provider.interface.js';
import type { ArchitectureGraphDto } from '../dto/architecture-graph.dto.js';
import type { AnalysisIssue } from '../interfaces/analysis-issue.interface.js';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';
const MAX_TOKENS = 1024;

const NODE_KIND_LABELS: Record<string, string> = {
  ui_page: 'Страница',
  ui_component: 'Компонент',
  state_store: 'Хранилище',
  api_gateway: 'API Gateway',
  service: 'Сервис',
  database: 'База данных',
  cache: 'Кэш',
  external_system: 'Внешняя система',
  system: 'Система',
};

function buildPrompt(
  graph: ArchitectureGraphDto,
  issues: AnalysisIssue[],
): string {
  const nodesSummary = graph.nodes
    .map((node) => {
      const label = NODE_KIND_LABELS[node.kind] ?? node.kind;
      const name = (node as { displayName?: string }).displayName;
      return `- ${label} (id: ${node.id})${name ? ` «${name}»` : ''}`;
    })
    .join('\n');
  const edgesSummary = graph.edges
    .map((edge) => `- ${edge.source} → ${edge.target}: ${edge.kind}`)
    .join('\n');
  const issuesSummary =
    issues.length > 0
      ? issues
          .map(
            (issue) =>
              `[${issue.severity}] ${issue.title}: ${issue.description}` +
              (issue.recommendation
                ? ` Рекомендация: ${issue.recommendation}`
                : ''),
          )
          .join('\n')
      : 'Замечаний нет.';

  return `Ты — эксперт по архитектуре ПО. Проанализируй схему и выдай 2-5 конкретных рекомендаций по улучшению.

Схема:
Узлы:
${nodesSummary}
Связи:
${edgesSummary}

Замечания анализа:
${issuesSummary}

Требования:
- Отвечай на русском
- Каждая рекомендация — отдельный пункт, начинающийся с "-"
- Будь КОНКРЕТЕН: указывай id узлов в скобках, например «добавьте кэш между Service (abc) и Database (xyz)»
- Формулируй как действие: «Сделай X вместо Y», «Добавь Z между A и B»
- Не дублируй замечания, давай доп. советы
- Не пиши вступление и заключение`;
}

export class AiRecommendationDeepSeekProvider implements AiRecommendationProvider {
  constructor(private readonly apiKey: string) {}

  async getRecommendations(
    graph: ArchitectureGraphDto,
    issues: AnalysisIssue[],
  ): Promise<string[]> {
    try {
      const prompt = buildPrompt(graph, issues);
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
                'Ты даёшь краткие архитектурные рекомендации. Формат: «Сделай X вместо Y», «Добавь Z между узлами (id)». Указывай id узлов в скобках. Отвечай только списком пунктов с "-".',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: MAX_TOKENS,
          temperature: 0.5,
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

      const lines = text
        .split('\n')
        .map((line) => line.replace(/^[-•*]\s*/, '').trim())
        .filter((line) => line.length > 10);

      return lines.slice(0, 5);
    } catch (err) {
      console.warn('[AiRecommendation] DeepSeek request failed:', err);
      return [];
    }
  }
}
