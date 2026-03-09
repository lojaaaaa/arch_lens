import { Type } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { useCanvasNotesStore } from '../model/store';

export const TextBlocksVisibilityTrigger = () => {
    const visible = useCanvasNotesStore((state) => state.visible);
    const toggleVisible = useCanvasNotesStore((state) => state.toggleVisible);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={
                        visible ? 'size-7' : 'size-7 text-muted-foreground'
                    }
                    onClick={toggleVisible}
                    aria-pressed={visible}
                >
                    <Type className="size-4" />
                    <span className="sr-only">
                        {visible
                            ? 'Скрыть текстовые блоки'
                            : 'Показать текстовые блоки'}
                    </span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                {visible
                    ? 'Скрыть заметки (для экспорта в картинку)'
                    : 'Показать заметки'}
            </TooltipContent>
        </Tooltip>
    );
};
