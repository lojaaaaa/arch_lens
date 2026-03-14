import { Injectable } from '@nestjs/common';
import * as path from 'node:path';
import PDFDocument from 'pdfkit';
import type {
  AnalysisResultDto,
  AnalysisMetrics,
} from '../interfaces/analysis-result.interface.js';
import type { AnalysisIssue } from '../interfaces/analysis-issue.interface.js';

const SEVERITY_LABELS: Record<string, string> = {
  info: 'Инфо',
  warning: 'Внимание',
  critical: 'Критично',
};

const CATEGORY_LABELS: Record<string, string> = {
  performance: 'Производительность',
  scalability: 'Масштабируемость',
  maintainability: 'Поддерживаемость',
  architecture: 'Архитектура',
  reliability: 'Надёжность',
  security: 'Безопасность',
};

const STYLE_LABELS: Record<string, string> = {
  layered: 'Слоистая',
  microservices: 'Микросервисы',
  'event-driven': 'Событийная',
  'client-server': 'Клиент-сервер',
  monolith: 'Монолит',
  unknown: 'Не определён',
};

function riskLabel(risk: number): string {
  if (risk < 0.3) return 'низкий';
  if (risk < 0.6) return 'умеренный';
  return 'высокий';
}

function pct(v: number): string {
  return `${(v * 100).toFixed(0)}%`;
}

const FONT_DIR = path.join(process.cwd(), 'assets', 'fonts');
const FONT_REGULAR = path.join(FONT_DIR, 'Roboto-Regular.ttf');
const FONT_ITALIC = path.join(FONT_DIR, 'Roboto-Italic.ttf');

const PAGE_MARGIN = 40;
const COL_LEFT = PAGE_MARGIN;
const PAGE_WIDTH = 595.28;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

const COLOR_TITLE = '#111111';
const COLOR_HEADING = '#222222';
const COLOR_TEXT = '#333333';
const COLOR_MUTED = '#888888';
const COLOR_ACCENT = '#1a73e8';
const COLOR_CRITICAL = '#dc2626';
const COLOR_WARNING = '#d97706';
const COLOR_DIVIDER = '#e5e7eb';

@Injectable()
export class PdfReportService {
  async generate(result: AnalysisResultDto): Promise<Buffer> {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 40, left: PAGE_MARGIN, right: PAGE_MARGIN },
      info: {
        Title: 'ArchLens — Отчёт анализа',
        Author: 'ArchLens',
        Subject: `Анализ: ${result.summary.grade} (${result.summary.score}/100)`,
      },
    });

    doc.registerFont('Regular', FONT_REGULAR);
    doc.registerFont('Italic', FONT_ITALIC);
    doc.font('Regular');

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    this.renderTitle(doc, result);
    this.renderSummary(doc, result);
    this.renderScoreBreakdown(doc, result);
    this.renderMetrics(doc, result.metrics);
    this.renderIssues(doc, result.issues);
    this.renderBestPractices(doc, result.bestPractices);
    this.renderAiRecommendations(doc, result.aiRecommendations);

    doc.end();

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });
  }

  private renderTitle(doc: PDFKit.PDFDocument, result: AnalysisResultDto) {
    doc
      .font('Regular')
      .fontSize(20)
      .fillColor(COLOR_TITLE)
      .text('ArchLens — Отчёт анализа архитектуры', COL_LEFT, doc.y);

    doc.moveDown(0.3);

    doc
      .fontSize(8)
      .fillColor(COLOR_MUTED)
      .text(
        `${result.generatedAt}  ·  модель v${result.modelVersion}  ·  правила v${result.rulesVersion}`,
      );

    doc.moveDown(1);
    this.drawLine(doc);
    doc.moveDown(0.8);
  }

  private renderSummary(doc: PDFKit.PDFDocument, result: AnalysisResultDto) {
    const { summary, issues } = result;

    this.sectionHeading(doc, 'Сводка');

    const gradeColor =
      summary.grade === 'A' || summary.grade === 'B'
        ? '#16a34a'
        : summary.grade === 'C'
          ? '#d97706'
          : '#dc2626';

    const gradeY = doc.y;
    doc
      .font('Regular')
      .fontSize(36)
      .fillColor(gradeColor)
      .text(summary.grade, COL_LEFT, gradeY, { width: 50 });

    const scoreX = COL_LEFT + 60;
    doc
      .fontSize(18)
      .fillColor(COLOR_TEXT)
      .text(`${summary.score} / 100`, scoreX, gradeY + 2);

    const styleLabel =
      STYLE_LABELS[summary.architecturalStyle ?? ''] ??
      summary.architecturalStyle ??
      '—';

    doc
      .fontSize(10)
      .fillColor(COLOR_MUTED)
      .text(`Стиль: ${styleLabel}`, scoreX, gradeY + 26);

    doc.y = gradeY + 50;
    doc.moveDown(0.4);

    const INFO_X = COL_LEFT;
    const infoY = doc.y;
    const COL_W = CONTENT_WIDTH / 3;

    doc.fontSize(9).fillColor(COLOR_MUTED);
    doc.text('Риск', INFO_X, infoY, { width: COL_W });
    doc.text('Уверенность', INFO_X + COL_W, infoY, { width: COL_W });
    doc.text('Проблемы', INFO_X + COL_W * 2, infoY, { width: COL_W });

    const valY = infoY + 14;
    doc.fontSize(11).fillColor(COLOR_TEXT);
    doc.text(
      `${pct(summary.riskScore)} (${riskLabel(summary.riskScore)})`,
      INFO_X,
      valY,
      { width: COL_W },
    );
    doc.text(pct(summary.confidenceScore), INFO_X + COL_W, valY, {
      width: COL_W,
    });

    const criticalCount = issues.filter(
      (i) => i.severity === 'critical',
    ).length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    const infoCount = issues.filter((i) => i.severity === 'info').length;

    const issuesText =
      [
        criticalCount > 0 ? `${criticalCount} крит.` : null,
        warningCount > 0 ? `${warningCount} вним.` : null,
        infoCount > 0 ? `${infoCount} инфо` : null,
      ]
        .filter(Boolean)
        .join(', ') || 'Нет';

    doc.text(issuesText, INFO_X + COL_W * 2, valY, { width: COL_W });

    doc.y = valY + 20;

    doc.moveDown(1);
    this.drawLine(doc);
    doc.moveDown(0.8);
  }

  private renderScoreBreakdown(
    doc: PDFKit.PDFDocument,
    result: AnalysisResultDto,
  ) {
    const breakdown = result.scoreBreakdown;
    if (!breakdown) return;

    this.sectionHeading(doc, 'Разбивка оценки');

    doc
      .font('Regular')
      .fontSize(11)
      .fillColor(COLOR_TEXT)
      .text(
        `${breakdown.final} = ${breakdown.maxScore} − ${breakdown.penalty} (issues) − ${breakdown.metricsPenalty} (метрики) + ${breakdown.bonus} (бонус)`,
        COL_LEFT,
      );

    doc.moveDown(0.6);

    const impacts = result.issueImpacts ?? [];
    if (impacts.length > 0) {
      const sorted = [...impacts].sort(
        (a, b) => b.potentialGain - a.potentialGain,
      );
      const top = sorted.slice(0, 5);

      doc
        .font('Regular')
        .fontSize(10)
        .fillColor(COLOR_HEADING)
        .text('Потенциал улучшения (топ-5)', COL_LEFT);
      doc.moveDown(0.2);

      for (const imp of top) {
        if (doc.y > 740) doc.addPage();
        const color =
          imp.severity === 'critical'
            ? COLOR_CRITICAL
            : imp.severity === 'warning'
              ? COLOR_WARNING
              : COLOR_ACCENT;

        doc
          .fontSize(9)
          .fillColor(color)
          .text(`[${imp.ruleId}] ${imp.title}`, COL_LEFT + 8, doc.y, {
            width: CONTENT_WIDTH - 80,
            continued: false,
          });

        doc
          .fillColor('#16a34a')
          .text(
            `+${imp.potentialGain} баллов`,
            COL_LEFT + CONTENT_WIDTH - 70,
            doc.y - 11,
            {
              width: 70,
              align: 'right',
            },
          );

        doc.moveDown(0.1);
      }
    }

    doc.moveDown(0.6);
    this.drawLine(doc);
    doc.moveDown(0.8);
  }

  private renderMetrics(doc: PDFKit.PDFDocument, metrics: AnalysisMetrics) {
    this.sectionHeading(doc, 'Метрики');

    const VALUE_X = COL_LEFT + 260;
    const ROW_HEIGHT = 16;

    const groups: { title: string; rows: [string, string][] }[] = [
      {
        title: 'Структура',
        rows: [
          ['Узлы', String(metrics.totalNodes)],
          ['Связи', String(metrics.totalEdges)],
          ['Плотность графа', metrics.density.toFixed(3)],
          ['Глубина (longest path)', String(metrics.depth)],
          ['Циклы (SCC)', String(metrics.cycleCount)],
        ],
      },
      {
        title: 'Связность',
        rows: [
          ['Max Fan-Out', String(metrics.maxFanOut)],
          ['Avg Fan-Out', metrics.avgFanOut.toFixed(2)],
          ['Критичных узлов', String(metrics.criticalNodesCount)],
        ],
      },
      {
        title: 'Сложность',
        rows: [
          ['Frontend сложность', String(metrics.frontendComplexity)],
          ['Backend сложность', String(metrics.backendComplexity)],
          ['Render Pressure', String(metrics.estimatedRenderPressure)],
        ],
      },
      {
        title: 'Нагрузка (рёбра)',
        rows: [
          ['API рёбер (calls + reads)', String(metrics.apiEdgesCount)],
          ['Data рёбер (reads + writes)', String(metrics.dataEdgesCount)],
          ['calls', String(metrics.callsCount)],
          ['reads', String(metrics.readsCount)],
          ['writes', String(metrics.writesCount)],
          ['subscribes', String(metrics.subscribesCount)],
          ['emits', String(metrics.emitsCount)],
          ['depends_on', String(metrics.dependsOnCount)],
          ['State Stores', String(metrics.stateStoreCount)],
          ['Event-driven рёбер', String(metrics.eventDrivenEdgesCount)],
        ],
      },
    ];

    for (const group of groups) {
      if (doc.y > 700) doc.addPage();

      doc
        .font('Regular')
        .fontSize(10)
        .fillColor(COLOR_HEADING)
        .text(group.title, COL_LEFT, doc.y);
      doc.moveDown(0.2);

      for (const [label, value] of group.rows) {
        if (doc.y > 750) doc.addPage();
        const y = doc.y;

        doc
          .fontSize(9)
          .fillColor(COLOR_MUTED)
          .text(label, COL_LEFT + 8, y, { width: 240 });
        doc
          .fontSize(9)
          .fillColor(COLOR_TEXT)
          .text(value, VALUE_X, y, { width: 100, align: 'right' });

        doc.y = y + ROW_HEIGHT;
      }

      doc.moveDown(0.4);
    }

    doc.moveDown(0.4);
    this.drawLine(doc);
    doc.moveDown(0.8);
  }

  private renderIssues(doc: PDFKit.PDFDocument, issues: AnalysisIssue[]) {
    if (issues.length === 0) return;

    this.sectionHeading(doc, `Проблемы (${issues.length})`);

    const sorted = [...issues].sort((a, b) => {
      const order: Record<string, number> = {
        critical: 0,
        warning: 1,
        info: 2,
      };
      return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
    });

    for (let i = 0; i < sorted.length; i++) {
      const issue = sorted[i];
      if (doc.y > 700) {
        doc.addPage();
      }

      const severityColor =
        issue.severity === 'critical'
          ? COLOR_CRITICAL
          : issue.severity === 'warning'
            ? COLOR_WARNING
            : COLOR_ACCENT;

      doc
        .font('Regular')
        .fontSize(10)
        .fillColor(severityColor)
        .text(
          `${i + 1}. [${SEVERITY_LABELS[issue.severity] ?? issue.severity}] ${issue.title}`,
          COL_LEFT,
        );

      doc
        .fontSize(9)
        .fillColor(COLOR_TEXT)
        .text(issue.description, COL_LEFT + 12, doc.y, {
          width: CONTENT_WIDTH - 12,
        });

      if (issue.recommendation) {
        doc
          .font('Italic')
          .fontSize(9)
          .fillColor(COLOR_ACCENT)
          .text(`→ ${issue.recommendation}`, COL_LEFT + 12, doc.y, {
            width: CONTENT_WIDTH - 12,
          });
        doc.font('Regular');
      }

      doc
        .fontSize(8)
        .fillColor(COLOR_MUTED)
        .text(
          `Категория: ${CATEGORY_LABELS[issue.category] ?? issue.category}${issue.ruleId ? ` · ${issue.ruleId}` : ''}`,
          COL_LEFT + 12,
        );

      doc.moveDown(0.4);
    }

    doc.moveDown(0.6);
    this.drawLine(doc);
    doc.moveDown(0.8);
  }

  private renderBestPractices(doc: PDFKit.PDFDocument, tips: string[]) {
    if (tips.length === 0) return;

    this.sectionHeading(doc, 'Best Practices');

    for (let i = 0; i < tips.length; i++) {
      if (doc.y > 740) {
        doc.addPage();
      }
      doc
        .font('Regular')
        .fontSize(9)
        .fillColor(COLOR_TEXT)
        .text(`${i + 1}. ${tips[i]}`, COL_LEFT, doc.y, {
          width: CONTENT_WIDTH,
        });
      doc.moveDown(0.2);
    }

    doc.moveDown(0.6);
    this.drawLine(doc);
    doc.moveDown(0.8);
  }

  private renderAiRecommendations(
    doc: PDFKit.PDFDocument,
    recommendations: string[],
  ) {
    if (recommendations.length === 0) return;

    this.sectionHeading(doc, 'AI-саммари и рекомендации');

    for (const block of recommendations) {
      if (doc.y > 720) {
        doc.addPage();
      }

      const cleaned = block.replace(/\*\*/g, '');
      const isHeading =
        /^\d+\.\s/.test(cleaned.trim()) || /^#+\s/.test(cleaned.trim());

      if (isHeading) {
        const heading = cleaned
          .replace(/^#+\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .trim();
        doc
          .font('Regular')
          .fontSize(10)
          .fillColor(COLOR_HEADING)
          .text(heading, COL_LEFT, doc.y, { width: CONTENT_WIDTH });
        doc.moveDown(0.2);
      } else {
        doc
          .font('Regular')
          .fontSize(9)
          .fillColor(COLOR_TEXT)
          .text(cleaned, COL_LEFT, doc.y, { width: CONTENT_WIDTH });
        doc.moveDown(0.4);
      }
    }

    doc.moveDown(0.6);
    this.drawLine(doc);
    doc.moveDown(0.8);
  }

  private sectionHeading(doc: PDFKit.PDFDocument, text: string) {
    if (doc.y > 720) {
      doc.addPage();
    }
    doc
      .font('Regular')
      .fontSize(13)
      .fillColor(COLOR_HEADING)
      .text(text, COL_LEFT);
    doc.moveDown(0.4);
  }

  private drawLine(doc: PDFKit.PDFDocument) {
    const y = doc.y;
    doc
      .strokeColor(COLOR_DIVIDER)
      .lineWidth(0.5)
      .moveTo(COL_LEFT, y)
      .lineTo(PAGE_WIDTH - PAGE_MARGIN, y)
      .stroke();
  }
}
