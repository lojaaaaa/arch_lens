import { Loader2 } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { useHeaderAnalysisActions } from './use-header-analysis-actions';

export const HeaderActions = () => {
    const { handleAnalysisClick, hasGraph, isAnalyzing } =
        useHeaderAnalysisActions();

    return (
        <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleAnalysisClick}
                        disabled={!hasGraph || isAnalyzing}
                    >
                        {isAnalyzing && (
                            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        )}
                        Анализ
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-60">
                    Запускает анализ схемы. Например, проверка проблем.
                </TooltipContent>
            </Tooltip>
        </div>
    );
};
