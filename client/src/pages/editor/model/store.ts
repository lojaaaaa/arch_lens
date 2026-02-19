import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { ArchitectureNode, GraphEdge } from '@/shared/model/types';

import type { ArchitectureState } from './types';
import { EDGE_KIND_LABELS } from '../lib/config';
import {
    createGraphEdge,
    createNode,
    toFlowEdge,
    toFlowNode,
} from '../lib/utils';

export const useArchitectureStore = create<ArchitectureState>()(
    devtools((set) => ({
        nodes: [],
        edges: [],
        selectedNodeId: null,
        selectedEdgeId: null,
        flowInstance: null,
        isDirty: false,

        setFlowInstance: (flowInstance: unknown) => set({ flowInstance }),
        markDirty: () => set({ isDirty: true }),
        markSaved: () => set({ isDirty: false }),

        setNodes: (nodes) =>
            set((state) => ({ ...state, nodes, isDirty: true })),
        setEdges: (edges) =>
            set((state) => ({ ...state, edges, isDirty: true })),

        selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
        selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

        addNode: (kind) => {
            const archNode = createNode(kind);
            const flowNode = toFlowNode(archNode);

            set((state) => ({
                nodes: [...state.nodes, flowNode],
                isDirty: true,
            }));
        },
        addEdge: (source, target, kind = 'calls') => {
            const graphEdge = createGraphEdge(source, target, kind);
            const flowEdge = toFlowEdge(graphEdge);

            set((state) => ({
                edges: [...state.edges, flowEdge],
                isDirty: true,
            }));
        },

        removeNode: (id) => {
            set((state) => ({
                nodes: state.nodes.filter((flowNode) => flowNode.id !== id),
                edges: state.edges.filter(
                    (edge) => edge.source !== id && edge.target !== id,
                ),
                selectedNodeId:
                    state.selectedNodeId === id ? null : state.selectedNodeId,
                selectedEdgeId: state.selectedEdgeId ?? null,
                isDirty: true,
            }));
        },
        removeEdge: (id) => {
            set((state) => ({
                edges: state.edges.filter((flowEdge) => flowEdge.id !== id),
                selectedEdgeId:
                    state.selectedEdgeId === id ? null : state.selectedEdgeId,
                isDirty: true,
            }));
        },

        updateNode: (id, patch) => {
            set((state) => ({
                nodes: state.nodes.map((node) => {
                    if (node.id !== id) {
                        return node;
                    }

                    const data = node.data;

                    if (!data?.node) {
                        return node;
                    }

                    const updatedArchitectureNode: ArchitectureNode = {
                        ...data.node,
                        ...patch,
                    };

                    return {
                        ...node,
                        data: {
                            ...data,
                            node: updatedArchitectureNode,
                        },
                    };
                }),
                isDirty: true,
            }));
        },

        updateEdge: (id, patch) => {
            set((state) => ({
                edges: state.edges.map((flowEdge) => {
                    if (flowEdge.id !== id) {
                        return flowEdge;
                    }

                    const data = flowEdge.data as
                        | { edge?: GraphEdge }
                        | undefined;

                    const graphEdge = data?.edge;
                    if (!graphEdge) {
                        return flowEdge;
                    }

                    const updated: GraphEdge = { ...graphEdge, ...patch };

                    return {
                        ...flowEdge,
                        label: EDGE_KIND_LABELS[updated.kind] ?? updated.kind,
                        data: { ...data, edge: updated },
                    };
                }),
                isDirty: true,
            }));
        },
    })),
);
