import { Loader2 } from 'lucide-react';

import { Skeleton } from '@/shared/ui/skeleton';

import { AnalysisTopBar } from './analysis-top-bar';

type AnalysisLoadingProps = {
    isSlow: boolean;
    onBack: () => void;
};

export const AnalysisLoading = ({ isSlow, onBack }: AnalysisLoadingProps) => {
    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-6">
            <AnalysisTopBar title="Анализ схемы" onBack={onBack} />
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
};
