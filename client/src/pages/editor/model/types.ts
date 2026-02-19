import type { Edge, Node } from '@xyflow/react';

import type {
    ArchitectureNode,
    ArchitectureNodeData,
    EdgeKind,
    GraphEdge,
    NodeKind,
    TypeOrNull,
} from '@/shared/model/types';

export type ArchitectureFlowNode = Node<ArchitectureNodeData>;

export type ArchitectureState = {
    nodes: ArchitectureFlowNode[];
    edges: Edge[];

    selectedNodeId: TypeOrNull<string>;
    selectedEdgeId: TypeOrNull<string>;

    flowInstance: unknown;
    isDirty: boolean;

    setFlowInstance: (instance: unknown) => void;
    markDirty: () => void;
    markSaved: () => void;

    addNode: (kind: NodeKind) => void;
    addEdge: (source: string, target: string, kind?: EdgeKind) => void;
    setNodes: (nodes: ArchitectureFlowNode[]) => void;
    setEdges: (edges: Edge[]) => void;
    removeNode: (id: string) => void;
    removeEdge: (id: string) => void;
    selectNode: (id: TypeOrNull<string>) => void;
    selectEdge: (id: TypeOrNull<string>) => void;
    updateNode: (
        id: string,
        patch: Partial<ArchitectureFlowNode['data']>,
    ) => void;
    updateArchitectureNode: (
        id: string,
        patch: Partial<ArchitectureNode>,
    ) => void;
    updateEdge: (id: string, patch: Partial<GraphEdge>) => void;
};
