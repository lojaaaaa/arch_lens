import { useMemo } from 'react';
import { SelectionMode } from '@xyflow/react';

import { usePresentationStore } from '@/features/presentation';

export const FIT_VIEW_PADDING = 0.25;
export const FIT_VIEW_MAX_ZOOM = 1.2;

export const useArchitectureCanvasProps = () => {
    const isPresentationMode = usePresentationStore(
        (state) => state.isPresentationMode,
    );

    return useMemo(
        () => ({
            nodesDraggable: true,
            nodesConnectable: !isPresentationMode,
            elementsSelectable: !isPresentationMode,
            selectionOnDrag: !isPresentationMode,
            selectionMode: SelectionMode.Partial,
            fitViewOptions: {
                padding: FIT_VIEW_PADDING,
                maxZoom: FIT_VIEW_MAX_ZOOM,
            },
            isPresentationMode,
        }),
        [isPresentationMode],
    );
};
