import { ChevronRight } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

type AnalysisTopBarProps = {
    title: string;
    onBack: () => void;
    backLabel?: string;
};

export const AnalysisTopBar = ({
    title,
    onBack,
    backLabel = 'Назад',
}: AnalysisTopBarProps) => {
    return (
        <>
            <nav className="flex items-center gap-1 text-xs text-muted-foreground">
                <button
                    type="button"
                    onClick={onBack}
                    className="hover:text-foreground transition-colors"
                >
                    Редактор
                </button>
                <ChevronRight className="size-3" />
                <span>Анализ</span>
            </nav>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <Button variant="outline" size="sm" onClick={onBack}>
                        {backLabel}
                    </Button>
                </div>
            </div>
        </>
    );
};
