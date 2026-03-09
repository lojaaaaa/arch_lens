import { Presentation } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { usePresentationStore } from '../model/store';

export const PresentationModeToggle = () => {
    const togglePresentation = usePresentationStore((state) => state.toggle);

    return (
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
    );
};
