import type { ReactNode } from 'react';
import { Info } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Slider } from '@/shared/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

const COMPLEXITY_LABELS = [
    'Минимальная',
    'Низкая',
    'Средняя',
    'Высокая',
    'Очень высокая',
] as const;

const CRITICALITY_LABELS = [
    'Некритичный',
    'Важный',
    'Критичный',
    'Ключевой',
] as const;

const REQUEST_RATE_OPTIONS = [
    { label: 'Низкая (<10 rps)', value: 5 },
    { label: 'Средняя (10–100 rps)', value: 50 },
    { label: 'Высокая (100–1000 rps)', value: 500 },
    { label: 'Экстремальная (>1000 rps)', value: 2000 },
] as const;

const LATENCY_OPTIONS = [
    { label: 'Не задано', value: -1 },
    { label: '10 ms', value: 10 },
    { label: '50 ms', value: 50 },
    { label: '100 ms', value: 100 },
    { label: '200 ms', value: 200 },
    { label: '500 ms', value: 500 },
] as const;

const AVAILABILITY_OPTIONS = [
    { label: 'Не задано', value: -1 },
    { label: '99%', value: 0.99 },
    { label: '99.9%', value: 0.999 },
    { label: '99.99%', value: 0.9999 },
] as const;

const CAPACITY_RPS_OPTIONS = [
    { label: 'Не задано', value: -1 },
    { label: '100 rps', value: 100 },
    { label: '500 rps', value: 500 },
    { label: '1000 rps', value: 1000 },
    { label: '5000 rps', value: 5000 },
] as const;

const RELIABILITY_OPTIONS = [
    { label: 'Низкая (<95%)', value: 0.9 },
    { label: 'Стандартная (95–99%)', value: 0.97 },
    { label: 'Высокая (99–99.9%)', value: 0.995 },
    { label: 'Максимальная (>99.9%)', value: 0.999 },
] as const;

type SelectOption<T extends string> = { value: T; label: string };

export const FieldWithTooltip = ({
    label,
    tooltip,
    children,
}: {
    label: string;
    tooltip: string;
    children: ReactNode;
}) => {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">{label}</span>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="text-muted-foreground size-3.5 shrink-0 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-60">
                        {tooltip}
                    </TooltipContent>
                </Tooltip>
            </div>
            {children}
        </div>
    );
};

export const ComplexitySlider = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (newValue: number) => void;
}) => {
    const clamped = Math.max(1, Math.min(5, value));
    return (
        <div className="space-y-2">
            <Slider
                min={1}
                max={5}
                step={1}
                value={[clamped]}
                onValueChange={([nextValue]) => onChange(nextValue)}
            />
            <div className="grid grid-cols-5 gap-0.5 text-[10px] text-muted-foreground">
                {COMPLEXITY_LABELS.map((label) => (
                    <span key={label} className="truncate text-center">
                        {label}
                    </span>
                ))}
            </div>
            <div className="text-xs text-center font-medium">
                {COMPLEXITY_LABELS[clamped - 1]} ({clamped})
            </div>
        </div>
    );
};

export const CriticalityControl = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (newValue: number) => void;
}) => {
    const clamped = Math.max(0, Math.min(3, value));
    return (
        <div className="grid grid-cols-2 gap-1 rounded-md border p-1">
            {CRITICALITY_LABELS.map((label, index) => (
                <button
                    key={label}
                    type="button"
                    onClick={() => onChange(index)}
                    className={`rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                        clamped === index
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background text-muted-foreground hover:bg-muted'
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

export const RequestRateSelect = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (newValue: number) => void;
}) => {
    const closest = REQUEST_RATE_OPTIONS.reduce((prev, curr) =>
        Math.abs(curr.value - value) < Math.abs(prev.value - value)
            ? curr
            : prev,
    );
    return (
        <select
            value={closest.value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
            {REQUEST_RATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
};

export const ReadWriteRatioSlider = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (newValue: number) => void;
}) => {
    const clamped = Math.max(0, Math.min(1, value));
    const percent = Math.round(clamped * 100);
    return (
        <div className="space-y-2">
            <Slider
                min={0}
                max={100}
                step={5}
                value={[percent]}
                onValueChange={([nextPercent]) => onChange(nextPercent / 100)}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Больше записи</span>
                <span>Больше чтения</span>
            </div>
            <div className="text-xs text-center font-medium">
                Чтение {percent}% / Запись {100 - percent}%
            </div>
        </div>
    );
};

export const HitRateSlider = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (newValue: number) => void;
}) => {
    const clamped = Math.max(0, Math.min(1, value));
    const percent = Math.round(clamped * 100);

    const zoneColor =
        percent < 50
            ? 'text-red-500'
            : percent < 80
              ? 'text-yellow-500'
              : 'text-green-500';

    return (
        <div className="space-y-2">
            <Slider
                min={0}
                max={100}
                step={5}
                value={[percent]}
                onValueChange={([nextPercent]) => onChange(nextPercent / 100)}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
                <span className="text-red-500">0%</span>
                <span className="text-yellow-500">50%</span>
                <span className="text-green-500">100%</span>
            </div>
            <div className={`text-xs text-center font-medium ${zoneColor}`}>
                {percent}% попаданий
            </div>
        </div>
    );
};

export const OptionalLatencySelect = ({
    value,
    onChange,
}: {
    value?: number;
    onChange: (v: number | undefined) => void;
}) => (
    <select
        value={value ?? -1}
        onChange={(e) => {
            const v = Number(e.target.value);
            onChange(v < 0 ? undefined : v);
        }}
        className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
    >
        {LATENCY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
                {opt.label}
            </option>
        ))}
    </select>
);

export const OptionalAvailabilitySelect = ({
    value,
    onChange,
}: {
    value?: number;
    onChange: (v: number | undefined) => void;
}) => (
    <select
        value={value ?? -1}
        onChange={(e) => {
            const v = Number(e.target.value);
            onChange(v < 0 ? undefined : v);
        }}
        className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
    >
        {AVAILABILITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
                {opt.label}
            </option>
        ))}
    </select>
);

export const OptionalCapacityRpsSelect = ({
    value,
    onChange,
}: {
    value?: number;
    onChange: (v: number | undefined) => void;
}) => (
    <select
        value={value ?? -1}
        onChange={(e) => {
            const v = Number(e.target.value);
            onChange(v < 0 ? undefined : v);
        }}
        className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
    >
        {CAPACITY_RPS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
                {opt.label}
            </option>
        ))}
    </select>
);

export const ReliabilitySelect = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (newValue: number) => void;
}) => {
    const closest = RELIABILITY_OPTIONS.reduce((prev, curr) =>
        Math.abs(curr.value - value) < Math.abs(prev.value - value)
            ? curr
            : prev,
    );
    return (
        <select
            value={closest.value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
            {RELIABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
};

export const Select = <T extends string>({
    value,
    onChange,
    options,
}: {
    value: T;
    onChange: (value: T) => void;
    options: readonly SelectOption<T>[];
}) => {
    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value as T)}
            className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export const Toggle = ({
    value,
    onChange,
}: {
    value: boolean;
    onChange: (value: boolean) => void;
}) => {
    return (
        <div className="flex gap-2">
            <Button
                type="button"
                variant={value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange(true)}
            >
                Да
            </Button>
            <Button
                type="button"
                variant={!value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange(false)}
            >
                Нет
            </Button>
        </div>
    );
};

export { Input };
