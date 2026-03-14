import { Loader2, Redo2, Undo2 } from 'lucide-react';

import { ThemeToggle } from '@/features/theme';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { useHeaderAnalysisActions } from './use-header-analysis-actions';
import { useArchitectureStore } from '../../model/store';

export const HeaderActions = () => {
    const { handleAnalysisClick, hasGraph, isAnalyzing } =
        useHeaderAnalysisActions();

    const undo = useArchitectureStore((s) => s.undo);
    const redo = useArchitectureStore((s) => s.redo);
    const canUndo = useArchitectureStore((s) => s.canUndo());
    const canRedo = useArchitectureStore((s) => s.canRedo());

    return (
        <div className="ml-auto flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={undo}
                        disabled={!canUndo}
                    >
                        <Undo2 className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Отменить (⌘Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={redo}
                        disabled={!canRedo}
                    >
                        <Redo2 className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Повторить (⌘⇧Z)</TooltipContent>
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
