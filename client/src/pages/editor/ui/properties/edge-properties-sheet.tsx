import { useMemo } from 'react';

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
                        Тип связи между узлами. Двойной клик по связи открывает
                        это меню.
                    </SheetDescription>
                </SheetHeader>

                {graphEdge && (
                    <div className="flex flex-col gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Тип связи
                            </label>
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
                        </div>
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
