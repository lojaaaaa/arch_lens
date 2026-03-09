import { useEffect } from 'react';

import { useGraphHighlightStore } from '@/features/graph-highlight';

import { useArchitectureStore } from '../../model/store';

const HIGHLIGHT_AUTO_CLEAR_MS = 10_000;

export const useCanvasHighlight = () => {
    const flowInstance = useArchitectureStore((state) => state.flowInstance);
    const highlightedNodeIds = useGraphHighlightStore(
        (state) => state.highlightedNodeIds,
    );
    const highlightPreventAutoClear = useGraphHighlightStore(
        (state) => state.highlightPreventAutoClear,
    );
    const clearHighlight = useGraphHighlightStore(
        (state) => state.clearHighlight,
    );

    useEffect(() => {
        if (highlightedNodeIds.length === 0 || !flowInstance?.fitView) {
            return;
        }

        flowInstance.fitView({
            nodes: highlightedNodeIds.map((nodeId) => ({ id: nodeId })),
            padding: 0.4,
            duration: 400,
        });

        const clearTimer = highlightPreventAutoClear
            ? null
            : setTimeout(clearHighlight, HIGHLIGHT_AUTO_CLEAR_MS);

        return () => {
            if (clearTimer) {
                clearTimeout(clearTimer);
            }
        };
    }, [
        highlightedNodeIds,
        highlightPreventAutoClear,
        clearHighlight,
        flowInstance,
    ]);
};
