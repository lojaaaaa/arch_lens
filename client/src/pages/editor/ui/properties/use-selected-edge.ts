import type { TypeOrNull } from '@/shared/model/types';

import type { FlowEdgeData } from '../../lib/utils';
import { useArchitectureSelectors } from '../../model/selectors';

type SelectedEdgeResult = {
    selectedEdgeId: TypeOrNull<string>;
    graphEdge: TypeOrNull<FlowEdgeData['edge']>;
    isOpen: boolean;
};

export const useSelectedEdge = (): SelectedEdgeResult => {
    const { edges, selectedEdgeId } = useArchitectureSelectors();

    const selectedEdge = selectedEdgeId
        ? (edges.find((flowEdge) => flowEdge.id === selectedEdgeId) ?? null)
        : null;

    const graphEdge = selectedEdge?.data
        ? ((selectedEdge.data as FlowEdgeData).edge ?? null)
        : null;

    const isOpen = Boolean(selectedEdgeId && graphEdge);

    return { selectedEdgeId, graphEdge, isOpen };
};
