import { Lightbulb, Loader2, Presentation } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { useHeaderAnalysisActions } from './use-header-analysis-actions';
import { usePresentationStore } from '../../model/presentation-store';
import { useTutorialStore } from '../../model/tutorial-store';

export const HeaderActions = () => {
    const { handleAnalysisClick, hasGraph, isAnalyzing } =
        useHeaderAnalysisActions();
    const togglePresentation = usePresentationStore((state) => state.toggle);
    const hintsEnabled = useTutorialStore((state) => state.hintsEnabled);
    const toggleHints = useTutorialStore((state) => state.toggleHints);

    return (
        <div className="ml-auto flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleHints}
                        aria-label={
                            hintsEnabled
                                ? 'Выключить подсказки'
                                : 'Включить подсказки'
                        }
                        className={
                            hintsEnabled
                                ? 'text-amber-600 dark:text-amber-400'
                                : ''
                        }
                    >
                        <Lightbulb className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    {hintsEnabled
                        ? 'Подсказки включены (нажмите, чтобы выключить)'
                        : 'Включить подсказки'}
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={togglePresentation}
                        aria-label="Режим презентации"
                    >
                        <Presentation className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    Режим презентации (полноэкранный просмотр)
                </TooltipContent>
            </Tooltip>
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
