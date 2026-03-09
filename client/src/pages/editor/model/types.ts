import type {
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    ReactFlowInstance,
} from '@xyflow/react';

import type {
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

    flowInstance: TypeOrNull<ReactFlowInstance<ArchitectureFlowNode>>;
    isDirty: boolean;

    history: {
        past: { nodes: ArchitectureFlowNode[]; edges: Edge[] }[];
        future: { nodes: ArchitectureFlowNode[]; edges: Edge[] }[];
    };

    setFlowInstance: (
        instance: TypeOrNull<ReactFlowInstance<ArchitectureFlowNode>>,
    ) => void;
    markDirty: () => void;
    markSaved: () => void;

    addNode: (kind: NodeKind) => void;
    addNodeAtPosition: (
        kind: NodeKind,
        position?: { x: number; y: number },
        options?: { select?: boolean },
    ) => void;
    addEdge: (source: string, target: string, kind?: EdgeKind) => void;
    setNodes: (nodes: ArchitectureFlowNode[]) => void;
    setEdges: (edges: Edge[]) => void;
    restoreFlow: (nodes: ArchitectureFlowNode[], edges: Edge[]) => void;
    removeNode: (id: string) => void;
    removeEdge: (id: string) => void;
    selectNode: (id: TypeOrNull<string>) => void;
    selectEdge: (id: TypeOrNull<string>) => void;
    updateNode: (
        id: string,
        patch: Partial<ArchitectureFlowNode['data']>,
    ) => void;
    updateEdge: (id: string, patch: Partial<GraphEdge>) => void;

    applyNodeChanges: (changes: NodeChange[]) => void;
    applyEdgeChanges: (changes: EdgeChange[]) => void;

    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
};
