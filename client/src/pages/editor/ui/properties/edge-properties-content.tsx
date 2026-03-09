import { Trash2 } from 'lucide-react';

import type { EdgeKind, GraphEdge } from '@/shared/model/types';
import { Button } from '@/shared/ui/button';

import {
    FieldWithTooltip,
    FrequencySelect,
    SyncToggle,
} from './edge-properties-controls';
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

type EdgePropertiesContentProps = {
    graphEdge: GraphEdge;
    selectedEdgeId: string;
};

export const EdgePropertiesContent = ({
    graphEdge,
    selectedEdgeId,
}: EdgePropertiesContentProps) => {
    const { selectEdge, removeEdge, updateEdge } = useArchitectureActions();

    const handleKindChange = (kind: EdgeKind) => {
        updateEdge(selectedEdgeId, { kind });
    };

    const handleRemove = () => {
        removeEdge(selectedEdgeId);
        selectEdge(null);
    };

    return (
        <div className="flex flex-1 flex-col gap-4">
            <section className="space-y-3">
                <FieldWithTooltip
                    label="Тип связи"
                    tooltip="Семантический тип: вызов, чтение, запись, подписка, зависимость или событие."
                >
                    <select
                        value={graphEdge.kind}
                        onChange={(event) =>
                            handleKindChange(event.target.value as EdgeKind)
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
                            updateEdge(graphEdge.id, { frequency })
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
                            updateEdge(graphEdge.id, { synchronous })
                        }
                    />
                </FieldWithTooltip>
            </section>

            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive mt-2 w-full justify-start gap-2"
            >
                <Trash2 className="size-4" />
                Удалить связь
            </Button>
        </div>
    );
};
