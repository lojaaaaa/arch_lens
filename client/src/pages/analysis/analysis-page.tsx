import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Routes } from '@/shared/model/routes';

import { useAnalysisRequest } from './lib/use-analysis-request';
import { useAnalysisRestore } from './lib/use-analysis-restore';
import { useSlowIndicator } from './lib/use-slow-indicator';
import { useStoredGraphRestore } from './lib/use-stored-graph-restore';
import { useAnalysisActions, useAnalysisSelectors } from './model/selectors';
import { AnalysisEmpty } from './ui/analysis-page/analysis-empty';
import { AnalysisError } from './ui/analysis-page/analysis-error';
import { AnalysisLoading } from './ui/analysis-page/analysis-loading';
import { AnalysisResults } from './ui/analysis-results';

const SLOW_ANALYSIS_THRESHOLD_MS = 10_000;

const AnalysisPage = () => {
    const navigate = useNavigate();

    const { graphToAnalyze, analysisResult, analysisStatus, analysisError } =
        useAnalysisSelectors();

    const { clearAnalysis, runAnalysis, restoreLastAnalysis } =
        useAnalysisActions();

    const { isChecking } = useStoredGraphRestore();

    const isSlow = useSlowIndicator(
        analysisStatus === 'loading',
        SLOW_ANALYSIS_THRESHOLD_MS,
    );

    const handleBack = () => {
        clearAnalysis();
        navigate(Routes.editor);
    };

    const handleRetry = () => {
        if (graphToAnalyze) {
            runAnalysis(graphToAnalyze);
        }
    };

    const prevStatusRef = useRef<typeof analysisStatus>(analysisStatus);

    useEffect(() => {
        if (
            prevStatusRef.current !== 'error' &&
            analysisStatus === 'error' &&
            analysisError
        ) {
            toast.error(analysisError);
        }
        prevStatusRef.current = analysisStatus;
    }, [analysisStatus, analysisError]);

    useAnalysisRequest();

    useAnalysisRestore({
        graphToAnalyze,
        isChecking,
        analysisStatus,
        analysisResult,
        restoreLastAnalysis,
    });

    if (!graphToAnalyze && analysisStatus !== 'success') {
        if (isChecking) {
            return (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <Loader2 className="text-primary size-10 animate-spin" />
                    <p className="text-muted-foreground text-sm">
                        Загрузка схемы…
                    </p>
                </div>
            );
        }
        return <AnalysisEmpty onBack={handleBack} />;
    }

    if (analysisStatus === 'loading') {
        return <AnalysisLoading isSlow={isSlow} onBack={handleBack} />;
    }

    if (analysisStatus === 'error') {
        return (
            <AnalysisError
                error={analysisError}
                onBack={handleBack}
                onRetry={handleRetry}
            />
        );
    }

    if (analysisStatus === 'success' && analysisResult) {
        return <AnalysisResults result={analysisResult} onBack={handleBack} />;
    }

    return null;
};

export const Component = AnalysisPage;
