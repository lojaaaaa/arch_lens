import { RefreshCw } from 'lucide-react';

import { Button } from '@/shared/ui/button';

import { AnalysisTopBar } from './analysis-top-bar';

type AnalysisErrorProps = {
    error: string | null;
    onBack: () => void;
    onRetry: () => void;
};

export const AnalysisError = ({
    error,
    onBack,
    onRetry,
}: AnalysisErrorProps) => {
    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-6">
            <AnalysisTopBar
                title="Ошибка анализа"
                onBack={onBack}
                backLabel="Назад к редактору"
            />
            <div className="flex flex-col items-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:p-6">
                <p className="text-destructive text-sm font-medium">{error}</p>
                <p className="text-muted-foreground text-xs text-center">
                    Проверьте, что бэкенд запущен и доступен по адресу из .env
                </p>
                <Button variant="outline" size="sm" onClick={onRetry}>
                    <RefreshCw className="mr-1.5 size-3.5" />
                    Повторить
                </Button>
            </div>
        </div>
    );
};
