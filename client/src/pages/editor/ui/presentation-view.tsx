import { useEffect } from 'react';
import { X } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/shared/ui/tooltip';

import { ArchitectureCanvas } from './canvas/architecture-canvas';
import { usePresentationStore } from '../model/presentation-store';

export const PresentationView = () => {
    const exit = usePresentationStore((state) => state.exit);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                exit();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [exit]);

    return (
        <div className="fixed inset-0 z-50 bg-background">
            <ArchitectureCanvas />
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-4 top-4 opacity-70 hover:opacity-100"
                            onClick={exit}
                            aria-label="Выйти из режима презентации"
                        >
                            <X className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Выйти (Escape)</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};
