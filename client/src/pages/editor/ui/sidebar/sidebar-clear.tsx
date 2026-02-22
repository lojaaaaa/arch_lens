import { Trash2 } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

type SidebarClearProps = {
    onClear: () => void;
};

export const SidebarClear = ({ onClear }: SidebarClearProps) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    onClick={onClear}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-destructive"
                >
                    <Trash2 className="size-3" />
                    Очистить схему
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-60">
                Удаляет все ноды и связи на canvas.
            </TooltipContent>
        </Tooltip>
    );
};
