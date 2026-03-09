import { Lightbulb } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { useTutorialStore } from '../model/store';

export const TutorialHintsToggle = () => {
    const hintsEnabled = useTutorialStore((state) => state.hintsEnabled);
    const toggleHints = useTutorialStore((state) => state.toggleHints);

    return (
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
                        hintsEnabled ? 'text-amber-600 dark:text-amber-400' : ''
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
    );
};
