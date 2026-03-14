import { useCallback, useEffect, useMemo, useRef } from 'react';

import type { EdgeKind } from '@/shared/model/types';

import { EDGE_KIND_LABELS } from '../../lib/config';
import { useArchitectureActions } from '../../model/selectors';

export type PendingConnection = {
    sourceId: string;
    targetId: string;
    allowedKinds: EdgeKind[];
    targetNodeId: string;
};

type EdgeTypePickerProps = {
    pending: PendingConnection;
    onClose: () => void;
};

function computePosition(targetNodeId: string, itemCount: number) {
    const el = document.querySelector(`[data-id="${targetNodeId}"]`);
    if (!el) {
        return { x: 300, y: 200 };
    }
    const rect = el.getBoundingClientRect();
    const menuW = 160;
    const menuH = itemCount * 32 + 28;

    let x = rect.right + 8;
    let y = rect.top;

    if (x + menuW > window.innerWidth) {
        x = rect.left - menuW - 8;
    }
    if (y + menuH > window.innerHeight) {
        y = window.innerHeight - menuH - 8;
    }
    return { x, y };
}

export const EdgeTypePicker = ({ pending, onClose }: EdgeTypePickerProps) => {
    const { addEdge } = useArchitectureActions();
    const ref = useRef<HTMLDivElement>(null);

    const pos = useMemo(
        () =>
            computePosition(pending.targetNodeId, pending.allowedKinds.length),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [pending.targetNodeId],
    );

    const handleSelect = useCallback(
        (kind: EdgeKind) => {
            addEdge(pending.sourceId, pending.targetId, kind);
            onClose();
        },
        [addEdge, pending, onClose],
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as HTMLElement)) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="fixed z-50 min-w-[140px] rounded-md border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
            style={{ left: pos.x, top: pos.y }}
        >
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Тип связи
            </p>
            {pending.allowedKinds.map((kind) => (
                <button
                    key={kind}
                    className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleSelect(kind)}
                >
                    {EDGE_KIND_LABELS[kind] ?? kind}
                </button>
            ))}
        </div>
    );
};
