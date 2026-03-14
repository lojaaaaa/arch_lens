import { Link } from 'react-router';
import { ChevronRight, Download, Loader2 } from 'lucide-react';

import { ThemeToggle } from '@/features/theme';
import { Routes } from '@/shared/model/routes';
import { Button } from '@/shared/ui/button';

type AnalysisTopBarProps = {
    title: string;
    onBack: () => void;
    backLabel?: string;
    onExportPdf?: () => void;
    exporting?: boolean;
};

export const AnalysisTopBar = ({
    title,
    onBack,
    backLabel = 'Назад',
    onExportPdf,
    exporting,
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
                <div className="flex items-center gap-2">
                    {onExportPdf && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onExportPdf}
                            disabled={exporting}
                            className="gap-1.5"
                        >
                            {exporting ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <Download className="size-3.5" />
                            )}
                            {exporting ? 'Генерация…' : 'PDF'}
                        </Button>
                    )}
                    <Link
                        to={Routes.docs}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                        Документация
                    </Link>
                    <ThemeToggle />
                    <Button variant="outline" size="sm" onClick={onBack}>
                        {backLabel}
                    </Button>
                </div>
            </div>
        </>
    );
};
