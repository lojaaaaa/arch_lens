import type { ReactNode } from 'react';
import { Info } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

const FREQUENCY_OPTIONS = [
    { value: 1, label: 'Редко', hint: '< 1 req/min' },
    { value: 10, label: 'Иногда', hint: '1–10 req/min' },
    { value: 100, label: 'Часто', hint: '10–100 req/min' },
    { value: 1000, label: 'Постоянно', hint: '100+ req/min' },
] as const;

export const FieldWithTooltip = ({
    label,
    tooltip,
    children,
}: {
    label: string;
    tooltip: string;
    children: ReactNode;
}) => (
    <div className="space-y-2">
        <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
            </span>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Info className="text-muted-foreground/70 size-3.5 shrink-0 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-60">
                    {tooltip}
                </TooltipContent>
            </Tooltip>
        </div>
        {children}
    </div>
);

export const FrequencySelect = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (frequency: number) => void;
}) => {
    const closest = FREQUENCY_OPTIONS.reduce((prev, curr) =>
        Math.abs(curr.value - value) < Math.abs(prev.value - value)
            ? curr
            : prev,
    );

    return (
        <div className="grid grid-cols-2 gap-1.5">
            {FREQUENCY_OPTIONS.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={cn(
                        'flex flex-col items-center rounded-md border px-2 py-1.5 text-xs transition-colors',
                        closest.value === option.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:bg-accent/40',
                    )}
                >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-[10px] opacity-60">
                        {option.hint}
                    </span>
                </button>
            ))}
        </div>
    );
};

export const SyncToggle = ({
    value,
    onChange,
}: {
    value: boolean;
    onChange: (synchronous: boolean) => void;
}) => (
    <div className="flex overflow-hidden rounded-md border">
        <button
            type="button"
            onClick={() => onChange(true)}
            className={cn(
                'flex-1 px-3 py-1.5 text-xs font-medium transition-colors',
                value
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent/40',
            )}
        >
            Синхронный
        </button>
        <button
            type="button"
            onClick={() => onChange(false)}
            className={cn(
                'flex-1 border-l px-3 py-1.5 text-xs font-medium transition-colors',
                !value
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent/40',
            )}
        >
            Асинхронный
        </button>
    </div>
);
