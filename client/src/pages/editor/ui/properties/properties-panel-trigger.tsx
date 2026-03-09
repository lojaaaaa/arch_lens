import { PanelRight } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { usePropertiesPanelStore } from '../../model/use-properties-panel-store';

export const PropertiesPanelTrigger = () => {
    const { open, toggle } = usePropertiesPanelStore();

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    data-sidebar="trigger"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={toggle}
                    aria-pressed={open}
                >
                    <PanelRight className="size-4" />
                    <span className="sr-only">
                        {open
                            ? 'Закрыть панель свойств'
                            : 'Открыть панель свойств'}
                    </span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Панель свойств</TooltipContent>
        </Tooltip>
    );
};
