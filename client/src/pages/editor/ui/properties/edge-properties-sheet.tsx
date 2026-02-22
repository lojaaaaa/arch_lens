import type { EdgeKind } from '@/shared/model/types';
import { Button } from '@/shared/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/shared/ui/sheet';

import {
    FieldWithTooltip,
    FrequencySelect,
    SyncToggle,
} from './edge-properties-controls';
import { useSelectedEdge } from './use-selected-edge';
import { EDGE_KIND_HINTS, EDGE_KIND_LABELS } from '../../lib/config';
import { useArchitectureActions } from '../../model/selectors';

const EDGE_KINDS: EdgeKind[] = [
    'calls',
    'reads',
    'writes',
    'subscribes',
    'depends_on',
    'emits',
];

export const EdgePropertiesSheet = () => {
    const { selectEdge, removeEdge, updateEdge } = useArchitectureActions();
    const { selectedEdgeId, graphEdge, isOpen } = useSelectedEdge();

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
                <SheetHeader className="space-y-1">
                    <SheetTitle>Связь</SheetTitle>
                    <SheetDescription>
                        Двойной клик по связи открывает параметры.
                    </SheetDescription>
                </SheetHeader>

                {graphEdge && (
                    <div className="flex flex-col gap-3 py-4">
                        <div className="rounded-lg border bg-card/60 p-3">
                            <FieldWithTooltip
                                label="Тип связи"
                                tooltip="Семантический тип: вызов, чтение, запись, подписка, зависимость или событие."
                            >
                                <select
                                    value={graphEdge.kind}
                                    onChange={(event) =>
                                        handleKindChange(
                                            event.target.value as EdgeKind,
                                        )
                                    }
                                    className="border-input dark:bg-input/30 h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                >
                                    {EDGE_KINDS.map((kind) => (
                                        <option key={kind} value={kind}>
                                            {EDGE_KIND_LABELS[kind]}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    {EDGE_KIND_HINTS[graphEdge.kind]}
                                </p>
                            </FieldWithTooltip>
                        </div>

                        <div className="rounded-lg border bg-card/60 p-3">
                            <FieldWithTooltip
                                label="Частота"
                                tooltip="Оценка частоты взаимодействия (запросы в минуту)."
                            >
                                <FrequencySelect
                                    value={graphEdge.frequency ?? 10}
                                    onChange={(frequency) =>
                                        updateEdge(graphEdge.id, {
                                            frequency,
                                        })
                                    }
                                />
                            </FieldWithTooltip>
                        </div>

                        <div className="rounded-lg border bg-card/60 p-3">
                            <FieldWithTooltip
                                label="Взаимодействие"
                                tooltip="Синхронный — ожидание ответа (блокирующий). Асинхронный — очереди и события."
                            >
                                <SyncToggle
                                    value={graphEdge.synchronous ?? true}
                                    onChange={(synchronous) =>
                                        updateEdge(graphEdge.id, {
                                            synchronous,
                                        })
                                    }
                                />
                            </FieldWithTooltip>
                        </div>
                    </div>
                )}

                <SheetFooter className="mt-auto">
                    <Button
                        type="button"
                        disabled={!graphEdge}
                        onClick={handleRemove}
                        className="w-full"
                    >
                        Удалить связь
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
