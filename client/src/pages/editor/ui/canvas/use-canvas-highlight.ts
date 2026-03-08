import { type RefObject, useEffect } from 'react';
import type { ReactFlowInstance } from '@xyflow/react';

import { useAnalysisStore } from '@/pages/analysis/model/store';
import type { TypeOrNull } from '@/shared/model/types';

import type { ArchitectureFlowNode } from '../../model/types';

const FIT_VIEW_DELAY_MS = 300;
const HIGHLIGHT_AUTO_CLEAR_MS = 10_000;

export const useCanvasHighlight = (
    flowRef: RefObject<TypeOrNull<ReactFlowInstance<ArchitectureFlowNode>>>,
    flowReady: boolean,
) => {
    const highlightedNodeIds = useAnalysisStore(
        (state) => state.highlightedNodeIds,
    );
    const highlightPreventAutoClear = useAnalysisStore(
        (state) => state.highlightPreventAutoClear,
    );
    const clearHighlight = useAnalysisStore((state) => state.clearHighlight);

    useEffect(() => {
        if (highlightedNodeIds.length === 0 || !flowReady || !flowRef.current) {
            return;
        }

        const fitTimer = setTimeout(() => {
            flowRef.current?.fitView({
                nodes: highlightedNodeIds.map((nodeId) => ({ id: nodeId })),
                padding: 0.4,
                duration: 500,
            });
        }, FIT_VIEW_DELAY_MS);

        const clearTimer = highlightPreventAutoClear
            ? null
            : setTimeout(clearHighlight, HIGHLIGHT_AUTO_CLEAR_MS);

        return () => {
            clearTimeout(fitTimer);
            if (clearTimer) {
                clearTimeout(clearTimer);
            }
        };
    }, [
        highlightedNodeIds,
        highlightPreventAutoClear,
        clearHighlight,
        flowReady,
        flowRef,
    ]);
};
