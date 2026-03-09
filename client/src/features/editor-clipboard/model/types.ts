import type { ArchitectureNode, GraphEdge } from '@/shared/model/types';

export type FlowNodeWithArchitecture = {
    data?: { node?: ArchitectureNode };
    id: string;
    selected?: boolean;
};

export type FlowEdgeWithData = {
    id: string;
    source: string;
    target: string;
    selected?: boolean;
    data?: { edge?: GraphEdge };
};

/** Лимит узлов в графе — защита от падения вкладки при бесконечном paste */
export const MAX_GRAPH_NODES = 450;

/** Лимит связей в графе */
export const MAX_GRAPH_EDGES = 1500;

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
    /** Вызывается, если вставка отклонена (например, превышен лимит узлов) */
    onPasteRefused?: (message: string) => void;
};

export type EditorClipboardApi<TFlowNode, TFlowEdge = FlowEdgeWithData> = {
    copy: (node: TFlowNode) => void;
    copyMulti: (nodes: TFlowNode[], edges: TFlowEdge[]) => void;
    paste: () => void;
    duplicate: (node: TFlowNode) => void;
};
