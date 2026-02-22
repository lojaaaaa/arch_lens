import { Button } from '@/shared/ui/button';

import type { ArchitecturePreset } from './presets';

type SidebarPresetsProps = {
    presets: ArchitecturePreset[];
    onApplyPreset: (presetId: string) => void;
};

export const SidebarPresets = ({
    presets,
    onApplyPreset,
}: SidebarPresetsProps) => {
    return (
        <div className="flex flex-col gap-2 rounded-md border bg-card/60 p-2">
            <div className="text-xs font-semibold text-muted-foreground">
                Шаблоны
            </div>
            <div className="flex flex-col gap-1">
                {presets.map(({ id, label }) => (
                    <Button
                        key={id}
                        onClick={() => onApplyPreset(id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-full justify-start gap-2 text-xs"
                    >
                        {label}
                    </Button>
                ))}
            </div>
        </div>
    );
};
