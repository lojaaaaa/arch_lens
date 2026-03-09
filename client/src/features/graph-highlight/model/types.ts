export type GraphHighlightState = {
    highlightedNodeIds: string[];
    highlightPreventAutoClear: boolean;

    setHighlightedNodeIds: (nodeIds: string[]) => void;
    setHighlightPreventAutoClear: (value: boolean) => void;
    clearHighlight: () => void;
};
