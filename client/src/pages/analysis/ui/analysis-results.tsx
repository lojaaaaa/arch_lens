import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

import { AiRecommendations } from '@/features/ai-recommendations';
import { useAnalysisSelectors } from '@/features/analysis';
import { useGraphHighlightStore } from '@/features/graph-highlight';
import { exportAnalysisPdf } from '@/features/pdf-export';
import { Routes } from '@/shared/model/routes';
import type {
    AnalysisResult,
    IssueSeverity,
    SystemNode,
} from '@/shared/model/types';

import { AnalysisIssues } from './analysis-results/analysis-issues';
import { AnalysisMetrics } from './analysis-results/analysis-metrics';
import { AnalysisResultsFooter } from './analysis-results/analysis-results-footer';
import { AnalysisResultsHeader } from './analysis-results/analysis-results-header';
import { AnalysisRisks } from './analysis-results/analysis-risks';
import { AnalysisStrengths } from './analysis-results/analysis-strengths';
import { AnalysisSummaryCard } from './analysis-results/analysis-summary-card';
import { AnalysisTopImprovements } from './analysis-results/analysis-top-improvements';
import { AnalysisWeaknesses } from './analysis-results/analysis-weaknesses';

type AnalysisResultsProps = {
    result: AnalysisResult;
    onBack: () => void;
};

export const AnalysisResults = ({ result, onBack }: AnalysisResultsProps) => {
    const navigate = useNavigate();
    const { graphToAnalyze, graphChangedSinceAnalysis } =
        useAnalysisSelectors();
    const [exporting, setExporting] = useState(false);

    const handleExportPdf = useCallback(async () => {
        if (!graphToAnalyze || exporting) {
            return;
        }
        setExporting(true);
        try {
            await exportAnalysisPdf(graphToAnalyze);
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? `Ошибка экспорта PDF: ${err.message}`
                    : 'Не удалось сгенерировать PDF',
            );
        } finally {
            setExporting(false);
        }
    }, [exporting, graphToAnalyze]);

    const setHighlightedNodeIds = useGraphHighlightStore(
        (state) => state.setHighlightedNodeIds,
    );
    const setHighlightPreventAutoClear = useGraphHighlightStore(
        (state) => state.setHighlightPreventAutoClear,
    );
    const { summary, metrics, issues } = result;
    const bestPractices = result.bestPractices ?? [];
    const aiRecommendations = result.aiRecommendations ?? [];

    const handleNodeClick = (affectedNodes: string[]) => {
        if (affectedNodes.length === 0) {
            return;
        }
        setHighlightedNodeIds(affectedNodes);
        setHighlightPreventAutoClear(true);
        navigate(Routes.editor);
    };

    const systemNode = useMemo(
        () =>
            graphToAnalyze?.nodes?.find(
                (n): n is SystemNode => n.kind === 'system',
            ) ?? null,
        [graphToAnalyze?.nodes],
    );

    const severityCounts = issues.reduce(
        (acc, issue) => {
            acc[issue.severity] += 1;
            return acc;
        },
        { critical: 0, warning: 0, info: 0 } as Record<IssueSeverity, number>,
    );

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-6">
            <AnalysisResultsHeader
                onBack={onBack}
                onExportPdf={handleExportPdf}
                exporting={exporting}
            />
            {graphChangedSinceAnalysis && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="size-4 flex-shrink-0" />
                    Граф был изменён после анализа. Результаты могут быть
                    неактуальны — запустите анализ повторно.
                </div>
            )}
            <AnalysisSummaryCard
                summary={summary}
                severityCounts={severityCounts}
                systemNode={systemNode}
                scoreBreakdown={result.scoreBreakdown}
                issueImpacts={result.issueImpacts}
            />
            <AnalysisStrengths result={result} />
            <AnalysisWeaknesses result={result} />
            <AnalysisMetrics metrics={metrics} />
            <AnalysisRisks issues={issues} />
            <AnalysisTopImprovements
                result={result}
                onIssueClick={handleNodeClick}
            />
            <AnalysisIssues issues={issues} onIssueClick={handleNodeClick} />
            {bestPractices.length > 0 && (
                <section className="rounded-lg border bg-card p-5">
                    <h2 className="text-muted-foreground mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wide">
                        <Lightbulb className="size-4 text-sky-500/80" />
                        Best Practices
                    </h2>
                    <ul className="flex flex-col gap-2">
                        {bestPractices.map((tip, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-3 rounded-lg border-l-4 border-l-sky-500/50 bg-muted/30 py-2.5 pl-3 pr-3"
                            >
                                <span className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-700 dark:text-sky-400">
                                    {i + 1}
                                </span>
                                <p className="text-foreground min-w-0 flex-1 text-sm leading-relaxed">
                                    {tip}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            <AiRecommendations recommendations={aiRecommendations} />
            <AnalysisResultsFooter result={result} />
        </div>
    );
};
