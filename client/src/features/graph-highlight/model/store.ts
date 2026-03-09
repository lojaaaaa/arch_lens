import { create } from 'zustand';

import type { GraphHighlightState } from './types';

export const useGraphHighlightStore = create<GraphHighlightState>()((set) => ({
    highlightedNodeIds: [],
    highlightPreventAutoClear: false,

    setHighlightedNodeIds: (highlightedNodeIds) => set({ highlightedNodeIds }),
    setHighlightPreventAutoClear: (highlightPreventAutoClear) =>
        set({ highlightPreventAutoClear }),
    clearHighlight: () =>
        set({
            highlightedNodeIds: [],
            highlightPreventAutoClear: false,
        }),
}));
