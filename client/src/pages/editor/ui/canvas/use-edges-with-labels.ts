import { useMemo } from 'react';
import type { Edge } from '@xyflow/react';

const DEFAULT_EDGE_KIND = 'calls';
const SINGLE_EDGE_HANDLE_INDEX = 1;
const FIRST_OF_TWO_HANDLE_INDEX = 0;
const SECOND_OF_TWO_HANDLE_INDEX = 2;

type FlowEdgeWithData = Edge & {
    data?: { edge?: { kind?: string } };
};

export const useEdgesWithLabels = (edges: FlowEdgeWithData[]) => {
    return useMemo(() => {
        const pairCounts = new Map<string, number>();
        for (const edge of edges) {
            const pairKey = `${edge.source}-${edge.target}`;
            pairCounts.set(pairKey, (pairCounts.get(pairKey) ?? 0) + 1);
        }

        const pairIndices = new Map<string, number>();

        return edges.map((flowEdge) => {
            const edgeKind =
                (flowEdge.data as { edge?: { kind?: string } })?.edge?.kind ??
                DEFAULT_EDGE_KIND;
            const pairKey = `${flowEdge.source}-${flowEdge.target}`;
            const pathTotal = pairCounts.get(pairKey) ?? 1;
            const pathIndex = pairIndices.get(pairKey) ?? 0;
            pairIndices.set(pairKey, pathIndex + 1);

            let handleIndex: number;
            if (pathTotal === 1) {
                handleIndex = SINGLE_EDGE_HANDLE_INDEX;
            } else if (pathTotal === 2) {
                handleIndex =
                    pathIndex === 0
                        ? FIRST_OF_TWO_HANDLE_INDEX
                        : SECOND_OF_TWO_HANDLE_INDEX;
            } else {
                handleIndex = pathIndex;
            }

            return {
                ...flowEdge,
                label: flowEdge.label ?? edgeKind,
                markerEnd: flowEdge.markerEnd ?? { type: 'arrowclosed' },
                sourceHandle: `bottom-${handleIndex}`,
                targetHandle: `top-${handleIndex}`,
            };
        });
    }, [edges]);
};
