import {
    applyEdgeChanges,
    applyNodeChanges,
    type EdgeChange,
    type NodeChange,
} from '@xyflow/react';
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

const SYSTEM_POSITION = { x: 80, y: 80 };

const getSystemFlowNode = (nodes: ArchitectureState['nodes']) =>
    nodes.find(
        (node) =>
            (node.data as { node?: ArchitectureNode } | undefined)?.node
                ?.kind === 'system',
    );

const ensureSystemFlowNodes = (
    nodes: ArchitectureState['nodes'],
): ArchitectureState['nodes'] => {
    const systemNode = getSystemFlowNode(nodes);
    if (!systemNode) {
        return [toFlowNode(createNode('system', SYSTEM_POSITION)), ...nodes];
    }
    const remaining = nodes.filter(
        (node) =>
            (node.data as { node?: ArchitectureNode } | undefined)?.node
                ?.kind !== 'system',
    );
    return [systemNode, ...remaining];
};

const shouldRecordNodeHistory = (changes: NodeChange[]) =>
    changes.some((change) => {
        if (change.type === 'select') {
            return false;
        }
        if (change.type === 'position' && 'dragging' in change) {
            return !change.dragging;
        }
        return true;
    });

const shouldRecordEdgeHistory = (changes: EdgeChange[]) =>
    changes.some((change) => ['add', 'remove', 'reset'].includes(change.type));

export const useArchitectureStore = create<ArchitectureState>()(
    devtools((set, get) => ({
        nodes: [toFlowNode(createNode('system', SYSTEM_POSITION))],
        edges: [],
        selectedNodeId: null,
        selectedEdgeId: null,
        flowInstance: null,
        isDirty: false,
        history: { past: [], future: [] },

        setFlowInstance: (flowInstance: unknown) => set({ flowInstance }),
        markDirty: () => set({ isDirty: true }),
        markSaved: () => set({ isDirty: false }),

        setNodes: (nodes) =>
            set((state) => ({
                ...state,
                history: {
                    past: [
                        ...state.history.past,
                        { nodes: state.nodes, edges: state.edges },
                    ],
                    future: [],
                },
                nodes: ensureSystemFlowNodes(nodes),
                isDirty: true,
            })),
        setEdges: (edges) =>
            set((state) => ({
                ...state,
                history: {
                    past: [
                        ...state.history.past,
                        { nodes: state.nodes, edges: state.edges },
                    ],
                    future: [],
                },
                edges,
                isDirty: true,
            })),

        selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
        selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

        addNode: (kind) => {
            get().addNodeAtPosition(kind);
        },
        addNodeAtPosition: (kind, position, options) =>
            set((state) => {
                const existingSystem = getSystemFlowNode(state.nodes);
                if (kind === 'system' && existingSystem) {
                    return state;
                }

                const archNode = createNode(kind, position);
                const flowNode = toFlowNode(archNode);
                const selectNew = options?.select ?? false;
                const baseNodes = ensureSystemFlowNodes(state.nodes);
                const nextNodes = [
                    ...(selectNew
                        ? baseNodes.map((node) => ({
                              ...node,
                              selected: false,
                          }))
                        : baseNodes),
                    selectNew ? { ...flowNode, selected: true } : flowNode,
                ];

                const systemNode =
                    existingSystem ?? getSystemFlowNode(baseNodes);
                const nextEdges =
                    kind === 'ui_page' && systemNode
                        ? [
                              ...state.edges,
                              toFlowEdge(
                                  createGraphEdge(
                                      archNode.id,
                                      systemNode.id,
                                      'depends_on',
                                  ),
                              ),
                          ]
                        : state.edges;

                return {
                    history: {
                        past: [
                            ...state.history.past,
                            { nodes: state.nodes, edges: state.edges },
                        ],
                        future: [],
                    },
                    nodes: nextNodes,
                    edges: nextEdges,
                    isDirty: true,
                };
            }),
        addEdge: (source, target, kind = 'calls') => {
            const graphEdge = createGraphEdge(source, target, kind);
            const flowEdge = toFlowEdge(graphEdge);

            set((state) => ({
                history: {
                    past: [
                        ...state.history.past,
                        { nodes: state.nodes, edges: state.edges },
                    ],
                    future: [],
                },
                edges: [...state.edges, flowEdge],
                isDirty: true,
            }));
        },

        removeNode: (id) => {
            set((state) => {
                const nodeToRemove = state.nodes.find(
                    (flowNode) => flowNode.id === id,
                );
                const isSystem =
                    (nodeToRemove?.data as { node?: ArchitectureNode })?.node
                        ?.kind === 'system';
                if (isSystem) {
                    return state;
                }
                return {
                    history: {
                        past: [
                            ...state.history.past,
                            { nodes: state.nodes, edges: state.edges },
                        ],
                        future: [],
                    },
                    nodes: state.nodes.filter((flowNode) => flowNode.id !== id),
                    edges: state.edges.filter(
                        (edge) => edge.source !== id && edge.target !== id,
                    ),
                    selectedNodeId:
                        state.selectedNodeId === id
                            ? null
                            : state.selectedNodeId,
                    selectedEdgeId: state.selectedEdgeId ?? null,
                    isDirty: true,
                };
            });
        },
        removeEdge: (id) => {
            set((state) => ({
                history: {
                    past: [
                        ...state.history.past,
                        { nodes: state.nodes, edges: state.edges },
                    ],
                    future: [],
                },
                edges: state.edges.filter((flowEdge) => flowEdge.id !== id),
                selectedEdgeId:
                    state.selectedEdgeId === id ? null : state.selectedEdgeId,
                isDirty: true,
            }));
        },

        updateNode: (id, patch) => {
            set((state) => ({
                history: {
                    past: [
                        ...state.history.past,
                        { nodes: state.nodes, edges: state.edges },
                    ],
                    future: [],
                },
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
                history: {
                    past: [
                        ...state.history.past,
                        { nodes: state.nodes, edges: state.edges },
                    ],
                    future: [],
                },
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
        applyNodeChanges: (changes: NodeChange[]) => {
            set((state) => {
                const updatedNodes = applyNodeChanges(
                    changes,
                    state.nodes,
                ) as ArchitectureState['nodes'];
                if (!shouldRecordNodeHistory(changes)) {
                    return { ...state, nodes: updatedNodes };
                }
                return {
                    ...state,
                    history: {
                        past: [
                            ...state.history.past,
                            { nodes: state.nodes, edges: state.edges },
                        ],
                        future: [],
                    },
                    nodes: updatedNodes,
                    isDirty: true,
                };
            });
        },
        applyEdgeChanges: (changes: EdgeChange[]) => {
            set((state) => {
                const updatedEdges = applyEdgeChanges(changes, state.edges);
                if (!shouldRecordEdgeHistory(changes)) {
                    return { ...state, edges: updatedEdges };
                }
                return {
                    ...state,
                    history: {
                        past: [
                            ...state.history.past,
                            { nodes: state.nodes, edges: state.edges },
                        ],
                        future: [],
                    },
                    edges: updatedEdges,
                    isDirty: true,
                };
            });
        },
        undo: () => {
            set((state) => {
                const previous = state.history.past.at(-1);
                if (!previous) {
                    return state;
                }
                const newPast = state.history.past.slice(0, -1);
                return {
                    ...state,
                    nodes: previous.nodes,
                    edges: previous.edges,
                    history: {
                        past: newPast,
                        future: [
                            { nodes: state.nodes, edges: state.edges },
                            ...state.history.future,
                        ],
                    },
                    isDirty: true,
                };
            });
        },
        redo: () => {
            set((state) => {
                const next = state.history.future[0];
                if (!next) {
                    return state;
                }
                const newFuture = state.history.future.slice(1);
                return {
                    ...state,
                    nodes: next.nodes,
                    edges: next.edges,
                    history: {
                        past: [
                            ...state.history.past,
                            { nodes: state.nodes, edges: state.edges },
                        ],
                        future: newFuture,
                    },
                    isDirty: true,
                };
            });
        },
        canUndo: () => get().history.past.length > 0,
        canRedo: () => get().history.future.length > 0,
    })),
);
