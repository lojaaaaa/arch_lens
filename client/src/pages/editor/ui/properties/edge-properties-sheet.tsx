import { Link2, Trash2 } from 'lucide-react';

import type { EdgeKind } from '@/shared/model/types';
import { Button } from '@/shared/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
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
            <SheetContent side="right" className="flex flex-col sm:max-w-sm">
                <SheetHeader className="space-y-1.5">
                    <div className="bg-muted/50 flex size-9 shrink-0 items-center justify-center rounded-lg">
                        <Link2 className="text-muted-foreground size-4" />
                    </div>
                    <SheetTitle>Параметры связи</SheetTitle>
                    <SheetDescription>
                        Двойной клик или ПКМ → Редактировать
                    </SheetDescription>
                </SheetHeader>

                {graphEdge && (
                    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
                        <section className="space-y-3">
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
                                    className="border-input h-9 w-full rounded-lg border bg-transparent px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {EDGE_KINDS.map((kind) => (
                                        <option key={kind} value={kind}>
                                            {EDGE_KIND_LABELS[kind]}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                                    {EDGE_KIND_HINTS[graphEdge.kind]}
                                </p>
                            </FieldWithTooltip>
                        </section>

                        <section className="space-y-3">
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
                        </section>

                        <section className="space-y-3">
                            <FieldWithTooltip
                                label="Режим взаимодействия"
                                tooltip="Синхронный — ожидание ответа. Асинхронный — очереди и события."
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
                        </section>
                    </div>
                )}

                <div className="border-border mt-auto border-t px-4 py-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={!graphEdge}
                        onClick={handleRemove}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full justify-start gap-2"
                    >
                        <Trash2 className="size-4" />
                        Удалить связь
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
