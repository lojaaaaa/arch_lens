import { useMemo } from 'react';

import type { NodeKind } from '@/shared/model/types';

import type { ArchitectureFlowNode } from '../../model/types';

export const useNodeKinds = (nodes: ArchitectureFlowNode[]): NodeKind[] => {
    return useMemo(() => {
        return nodes
            .map((node) => node.data?.node?.kind as NodeKind | undefined)
            .filter((kind): kind is NodeKind => Boolean(kind));
    }, [nodes]);
};
