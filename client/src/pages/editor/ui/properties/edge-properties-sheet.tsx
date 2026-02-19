import { type ReactNode, useMemo } from 'react';
import { Info } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import type { EdgeKind } from '@/shared/model/types';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/shared/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { EDGE_KIND_HINTS, EDGE_KIND_LABELS } from '../../lib/config';
import type { FlowEdgeData } from '../../lib/utils';
import {
    useArchitectureActions,
    useArchitectureSelectors,
} from '../../model/selectors';

const EDGE_KINDS: EdgeKind[] = [
    'calls',
    'reads',
    'writes',
    'subscribes',
    'depends_on',
    'emits',
];

const FREQUENCY_OPTIONS = [
    { value: 1, label: 'Редко', hint: '< 1 req/min' },
    { value: 10, label: 'Иногда', hint: '1–10 req/min' },
    { value: 100, label: 'Часто', hint: '10–100 req/min' },
    { value: 1000, label: 'Постоянно', hint: '100+ req/min' },
] as const;

const FieldWithTooltip = ({
    label,
    tooltip,
    children,
}: {
    label: string;
    tooltip: string;
    children: ReactNode;
}) => (
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

const FrequencySelect = ({
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

const SyncToggle = ({
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

export const EdgePropertiesSheet = () => {
    const { edges, selectedEdgeId } = useArchitectureSelectors();
    const { selectEdge, removeEdge, updateEdge } = useArchitectureActions();

    const selectedEdge = useMemo(() => {
        if (!selectedEdgeId) {
            return null;
        }
        return edges.find((flowEdge) => flowEdge.id === selectedEdgeId) ?? null;
    }, [edges, selectedEdgeId]);

    const graphEdge = useMemo(() => {
        if (!selectedEdge?.data) {
            return null;
        }
        const data = selectedEdge.data as FlowEdgeData;
        return data?.edge ?? null;
    }, [selectedEdge]);

    const isOpen = Boolean(selectedEdgeId && graphEdge);

    const handleKindChange = (kind: EdgeKind) => {
        if (!selectedEdgeId) {
            return;
        }
        updateEdge(selectedEdgeId, { kind });
    };

    const handleRemove = () => {
        if (!selectedEdgeId) {
            return;
        }
        removeEdge(selectedEdgeId);
        selectEdge(null);
    };

    return (
        <Sheet
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    selectEdge(null);
                }
            }}
        >
            <SheetContent side="right" className="sm:max-w-xs">
                <SheetHeader>
                    <SheetTitle>Связь</SheetTitle>
                    <SheetDescription>
                        Параметры связи между узлами. Двойной клик по связи
                        открывает это меню.
                    </SheetDescription>
                </SheetHeader>

                {graphEdge && (
                    <div className="flex flex-col gap-4 py-4">
                        <FieldWithTooltip
                            label="Тип связи"
                            tooltip="Семантический тип связи: вызов, чтение, запись, подписка, зависимость или событие."
                        >
                            <select
                                value={graphEdge.kind}
                                onChange={(event) =>
                                    handleKindChange(
                                        event.target.value as EdgeKind,
                                    )
                                }
                                className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            >
                                {EDGE_KINDS.map((kind) => (
                                    <option key={kind} value={kind}>
                                        {EDGE_KIND_LABELS[kind]}
                                    </option>
                                ))}
                            </select>
                            <p className="text-muted-foreground text-xs">
                                {EDGE_KIND_HINTS[graphEdge.kind]}
                            </p>
                        </FieldWithTooltip>

                        <Separator />

                        <FieldWithTooltip
                            label="Частота вызовов"
                            tooltip="Насколько часто происходит обращение по этой связи. Влияет на оценку нагрузки на API и данные."
                        >
                            <FrequencySelect
                                value={graphEdge.frequency ?? 10}
                                onChange={(frequency) =>
                                    updateEdge(graphEdge.id, { frequency })
                                }
                            />
                        </FieldWithTooltip>

                        <FieldWithTooltip
                            label="Тип взаимодействия"
                            tooltip="Синхронный — ожидание ответа (блокирующий). Асинхронный — fire-and-forget, очереди, события."
                        >
                            <SyncToggle
                                value={graphEdge.synchronous ?? true}
                                onChange={(synchronous) =>
                                    updateEdge(graphEdge.id, { synchronous })
                                }
                            />
                        </FieldWithTooltip>
                    </div>
                )}

                <SheetFooter>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={!graphEdge}
                        onClick={handleRemove}
                    >
                        Удалить связь
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
