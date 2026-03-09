import type { ArchitectureNode, GraphEdge } from '@/shared/model/types';

export type FlowNodeWithArchitecture = {
    data?: { node?: ArchitectureNode };
    id: string;
};

export type UseEditorClipboardParams<TFlowNode, TFlowEdge> = {
    nodes: TFlowNode[];
    edges: TFlowEdge[];
    setNodes: (nodes: TFlowNode[]) => void;
    setEdges: (edges: TFlowEdge[]) => void;
    toFlowNode: (
        archNode: ArchitectureNode,
        position: { x: number; y: number },
    ) => TFlowNode;
    toFlowEdge: (graphEdge: GraphEdge) => TFlowEdge;
};

export type EditorClipboardApi<TFlowNode> = {
    copy: (node: TFlowNode) => void;
    paste: () => void;
    duplicate: (node: TFlowNode) => void;
};
