import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Routes } from '@/shared/model/routes';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

import { useAnalysisRequest } from './lib/use-analysis-request';
import { useStoredGraphRestore } from './lib/use-stored-graph-restore';
import { useAnalysisActions, useAnalysisSelectors } from './model/selectors';
import { AnalysisResults } from './ui/analysis-results';

const SLOW_ANALYSIS_THRESHOLD_MS = 10_000;

const useSlowIndicator = (isActive: boolean, delayMs: number) => {
    const [isSlow, setIsSlow] = useState(false);

    useEffect(() => {
        if (!isActive) {
            return;
        }
        const timer = setTimeout(() => setIsSlow(true), delayMs);
        return () => {
            clearTimeout(timer);
            setIsSlow(false);
        };
    }, [isActive, delayMs]);

    return isActive && isSlow;
};

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

    useEffect(() => {
        if (
            !graphToAnalyze &&
            !isChecking &&
            analysisStatus === 'idle' &&
            !analysisResult
        ) {
            restoreLastAnalysis();
        }
    }, [
        graphToAnalyze,
        isChecking,
        analysisStatus,
        analysisResult,
        restoreLastAnalysis,
    ]);

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
        return (
            <div className="relative flex flex-col items-center justify-center gap-4 py-12">
                <div className="absolute right-0 top-0">
                    <ThemeToggle />
                </div>
                <h1 className="text-xl font-semibold">Страница анализа</h1>
                <p className="text-muted-foreground text-center">
                    Создайте схему в редакторе и нажмите «Анализ» для получения
                    результатов.
                </p>
                <Button onClick={handleBack}>Перейти в редактор</Button>
            </div>
        );
    }

    if (analysisStatus === 'loading') {
        return (
            <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-6">
                <nav className="flex items-center gap-1 text-xs text-muted-foreground">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="hover:text-foreground transition-colors"
                    >
                        Редактор
                    </button>
                    <ChevronRight className="size-3" />
                    <span>Анализ</span>
                </nav>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-lg font-semibold sm:text-xl">
                        Анализ схемы
                    </h1>
                    <div className="flex items-center gap-1">
                        <ThemeToggle />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBack}
                        >
                            Назад
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <Loader2 className="text-primary size-10 animate-spin" />
                    <p className="text-muted-foreground text-sm">
                        Анализируем схему…
                    </p>
                    {isSlow && (
                        <p className="text-muted-foreground text-xs">
                            Анализ занимает больше времени, чем обычно
                        </p>
                    )}
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    if (analysisStatus === 'error') {
        return (
            <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-6">
                <nav className="flex items-center gap-1 text-xs text-muted-foreground">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="hover:text-foreground transition-colors"
                    >
                        Редактор
                    </button>
                    <ChevronRight className="size-3" />
                    <span>Анализ</span>
                </nav>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-lg font-semibold sm:text-xl">
                        Ошибка анализа
                    </h1>
                    <div className="flex items-center gap-1">
                        <ThemeToggle />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBack}
                        >
                            Назад к редактору
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:p-6">
                    <p className="text-destructive text-sm font-medium">
                        {analysisError}
                    </p>
                    <p className="text-muted-foreground text-xs text-center">
                        Проверьте, что бэкенд запущен и доступен по адресу из
                        .env
                    </p>
                    <Button variant="outline" size="sm" onClick={handleRetry}>
                        <RefreshCw className="mr-1.5 size-3.5" />
                        Повторить
                    </Button>
                </div>
            </div>
        );
    }

    if (analysisStatus === 'success' && analysisResult) {
        return <AnalysisResults result={analysisResult} onBack={handleBack} />;
    }

    return null;
};

export const Component = AnalysisPage;
