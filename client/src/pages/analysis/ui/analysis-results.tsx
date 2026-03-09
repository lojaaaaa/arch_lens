import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import { AiRecommendations } from '@/features/ai-recommendations';
import { useAnalysisSelectors } from '@/features/analysis';
import { useGraphHighlightStore } from '@/features/graph-highlight';
import { Routes } from '@/shared/model/routes';
import type { AnalysisResult, IssueSeverity } from '@/shared/model/types';

import { AnalysisIssues } from './analysis-results/analysis-issues';
import { AnalysisMetrics } from './analysis-results/analysis-metrics';
import { AnalysisResultsFooter } from './analysis-results/analysis-results-footer';
import { AnalysisResultsHeader } from './analysis-results/analysis-results-header';
import { AnalysisSummaryCard } from './analysis-results/analysis-summary-card';

type AnalysisResultsProps = {
    result: AnalysisResult;
    onBack: () => void;
};

export const AnalysisResults = ({ result, onBack }: AnalysisResultsProps) => {
    const navigate = useNavigate();
    const { graphToAnalyze } = useAnalysisSelectors();
    const setHighlightedNodeIds = useGraphHighlightStore(
        (state) => state.setHighlightedNodeIds,
    );
    const setHighlightPreventAutoClear = useGraphHighlightStore(
        (state) => state.setHighlightPreventAutoClear,
    );
    const { summary, metrics, issues } = result;
    const aiRecommendations = result.aiRecommendations ?? [];

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const validNodeIds = useMemo(() => {
        const ids = new Set<string>();
        if (graphToAnalyze?.nodes) {
            graphToAnalyze.nodes.forEach((node) => ids.add(node.id));
        }
        issues.forEach((i) => i.affectedNodes.forEach((id) => ids.add(id)));
        return ids;
    }, [graphToAnalyze?.nodes, issues]);

    const handleNodeClick = (affectedNodes: string[]) => {
        if (affectedNodes.length === 0) {
            return;
        }
        setHighlightedNodeIds(affectedNodes);
        setHighlightPreventAutoClear(true);
        navigate(Routes.editor);
    };

    const severityCounts = issues.reduce(
        (acc, issue) => {
            acc[issue.severity] += 1;
            return acc;
        },
        { critical: 0, warning: 0, info: 0 } as Record<IssueSeverity, number>,
    );

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-6">
            <AnalysisResultsHeader onBack={onBack} />
            <AnalysisSummaryCard
                summary={summary}
                severityCounts={severityCounts}
            />
            <AnalysisMetrics metrics={metrics} />
            <AnalysisIssues issues={issues} onIssueClick={handleNodeClick} />
            <AiRecommendations
                recommendations={aiRecommendations}
                validNodeIds={validNodeIds}
                onRecommendationClick={handleNodeClick}
            />
            <AnalysisResultsFooter result={result} />
        </div>
    );
};
