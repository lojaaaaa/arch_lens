import type { ArchitecturePreset } from '@/features/architecture-presets';
import { Button } from '@/shared/ui/button';

type SidebarPresetsProps = {
    presets: ArchitecturePreset[];
    onApplyPreset: (presetId: string) => void;
};

export const SidebarPresets = ({
    presets,
    onApplyPreset,
}: SidebarPresetsProps) => {
    return (
        <div className="flex flex-col gap-2 rounded-lg border border-sidebar-border/40 bg-sidebar-accent/30 backdrop-blur-sm p-2.5">
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
