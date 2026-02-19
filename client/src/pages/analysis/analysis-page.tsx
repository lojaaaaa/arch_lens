import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';

import { Routes } from '@/shared/model/routes';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

import { useAnalysisRequest } from './lib/use-analysis-request';
import { useStoredGraphRestore } from './lib/use-stored-graph-restore';
import { useAnalysisActions, useAnalysisSelectors } from './model/selectors';
import { AnalysisResults } from './ui/analysis-results';

const AnalysisPage = () => {
    const navigate = useNavigate();

    const { graphToAnalyze, analysisResult, analysisStatus, analysisError } =
        useAnalysisSelectors();

    const { clearAnalysis } = useAnalysisActions();

    const { isChecking } = useStoredGraphRestore();

    const handleBack = () => {
        clearAnalysis();
        navigate(Routes.editor);
    };

    useAnalysisRequest();

    if (!graphToAnalyze) {
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
            <div className="flex flex-col items-center justify-center gap-4 py-12">
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
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Анализ схемы</h1>
                    <Button variant="outline" onClick={handleBack}>
                        Назад
                    </Button>
                </div>
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <Loader2 className="text-primary size-10 animate-spin" />
                    <p className="text-muted-foreground text-sm">
                        Анализируем схему, это может занять некоторое время…
                    </p>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        );
    }

    if (analysisStatus === 'error') {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Ошибка анализа</h1>
                    <Button variant="outline" onClick={handleBack}>
                        Назад к редактору
                    </Button>
                </div>
                <p className="text-destructive">{analysisError}</p>
                <p className="text-muted-foreground text-sm">
                    Проверьте, что бэкенд запущен и доступен по адресу из .env
                </p>
            </div>
        );
    }

    if (analysisStatus === 'success' && analysisResult) {
        return <AnalysisResults result={analysisResult} onBack={handleBack} />;
    }

    return null;
};

export const Component = AnalysisPage;
