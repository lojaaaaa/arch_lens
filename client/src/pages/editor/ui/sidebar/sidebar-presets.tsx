import { useState } from 'react';
import { ChevronDown, Layout } from 'lucide-react';

import type { ArchitecturePreset } from '@/features/architecture-presets';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

type SidebarPresetsProps = {
    presets: ArchitecturePreset[];
    onApplyPreset: (presetId: string) => void;
};

export const SidebarPresets = ({
    presets,
    onApplyPreset,
}: SidebarPresetsProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col">
            <Button
                variant="none"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center justify-between rounded-lg bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300 transition-all hover:opacity-90"
            >
                <span className="flex items-center gap-1.5">
                    <Layout className="size-3.5" />
                    Шаблоны
                </span>
                <ChevronDown
                    className={cn(
                        'size-3.5 transition-transform',
                        !isOpen && '-rotate-90',
                    )}
                />
            </Button>

            {isOpen && (
                <div className="mt-1 flex flex-col gap-0.5 pl-1">
                    {presets.map(({ id, label, description }) => (
                        <Tooltip key={id}>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => onApplyPreset(id)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-full justify-start rounded-md text-xs hover:bg-sidebar-accent/50"
                                >
                                    {label}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-60">
                                {description}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            )}
        </div>
    );
};
