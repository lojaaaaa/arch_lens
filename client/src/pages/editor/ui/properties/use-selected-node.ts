import type { ArchitectureNode, TypeOrNull } from '@/shared/model/types';

import {
    useArchitectureNodes,
    useArchitectureSelectedNodeId,
} from '../../model/selectors';

type SelectedNodeResult = {
    selectedFlowNodeId: TypeOrNull<string>;
    selectedArchitectureNode: TypeOrNull<ArchitectureNode>;
    isSheetOpen: boolean;
    isSystemNode: boolean;
};

const getArchNodeFromFlowNodeData = (
    data: unknown,
): TypeOrNull<ArchitectureNode> => {
    const maybe = data as TypeOrNull<{ node?: ArchitectureNode }>;
    return maybe?.node ?? null;
};

export const useSelectedNode = (): SelectedNodeResult => {
    const flowNodes = useArchitectureNodes();
    const selectedNodeId = useArchitectureSelectedNodeId();

    const selectedFlowNode = selectedNodeId
        ? (flowNodes.find((flowNode) => flowNode.id === selectedNodeId) ?? null)
        : null;

    const selectedArchitectureNode = selectedFlowNode
        ? getArchNodeFromFlowNodeData(selectedFlowNode.data)
        : null;

    const isSheetOpen = Boolean(selectedNodeId && selectedArchitectureNode);
    const isSystemNode = selectedArchitectureNode?.kind === 'system';

    return {
        selectedFlowNodeId: selectedNodeId,
        selectedArchitectureNode,
        isSheetOpen,
        isSystemNode,
    };
};
