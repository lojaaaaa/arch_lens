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

const SYSTEM_POSITION = { x: 250, y: 200 };
const HISTORY_MAX_SIZE = 50;

const trimHistoryPast = <T>(past: T[]): T[] => past.slice(-HISTORY_MAX_SIZE);
const trimHistoryFuture = <T>(future: T[]): T[] =>
    future.slice(0, HISTORY_MAX_SIZE);

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

/** Изменения, которые не считаются действиями пользователя (не история, не isDirty). */
const isUserDrivenNodeChange = (change: NodeChange) => {
    if (change.type === 'select') {
        return false;
    }
    if (change.type === 'dimensions') {
        return false;
    } // внутреннее измерение React Flow
    if (change.type === 'position' && 'dragging' in change) {
        return !change.dragging; // только после окончания перетаскивания
    }
    return true;
};

const shouldRecordNodeHistory = (changes: NodeChange[]) =>
    changes.some(isUserDrivenNodeChange);

const shouldRecordEdgeHistory = (changes: EdgeChange[]) =>
    changes.some((change) => ['add', 'remove', 'reset'].includes(change.type));

/** Исключает remove-изменения для системной ноды — её нельзя удалить через Delete. */
const filterSystemNodeRemovals = (
    changes: NodeChange[],
    nodes: ArchitectureState['nodes'],
): NodeChange[] => {
    const systemId = getSystemFlowNode(nodes)?.id;
    if (!systemId) {
        return changes;
    }
    return changes.filter(
        (change) =>
            change.type !== 'remove' || (change.id && change.id !== systemId),
    );
};

export const useArchitectureStore = create<ArchitectureState>()(
    devtools((set, get) => ({
        nodes: [toFlowNode(createNode('system', SYSTEM_POSITION))],
        edges: [],
        selectedNodeId: null,
        selectedEdgeId: null,
        flowInstance: null,
        isDirty: false,
        history: { past: [], future: [] },

        setFlowInstance: (flowInstance) => set({ flowInstance }),
        markDirty: () => set({ isDirty: true }),
        markSaved: () => set({ isDirty: false }),

        setNodes: (nodes) =>
            set((state) => ({
                ...state,
                history: {
                    past: trimHistoryPast([
                        ...state.history.past,
                        { nodes: state.nodes, edges: state.edges },
                    ]),
                    future: [],
                },
                nodes: ensureSystemFlowNodes(nodes),
                isDirty: true,
            })),
        setEdges: (edges) =>
            set((state) => ({
                ...state,
                history: {
                    past: trimHistoryPast([
                        ...state.history.past,
                        { nodes: state.nodes, edges: state.edges },
                    ]),
                    future: [],
                },
                edges,
                isDirty: true,
            })),

        restoreFlow: (nodes, edges) =>
            set((state) => ({
                ...state,
                nodes: ensureSystemFlowNodes(nodes),
                edges,
                isDirty: false,
                history: { past: [], future: [] },
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
                        past: trimHistoryPast([
                            ...state.history.past,
                            { nodes: state.nodes, edges: state.edges },
                        ]),
                        future: [],
                    },
                    nodes: nextNodes,
                    edges: nextEdges,
                    selectedNodeId: selectNew
                        ? archNode.id
                        : state.selectedNodeId,
                    selectedEdgeId: selectNew ? null : state.selectedEdgeId,
                    isDirty: true,
                };
            }),
        addEdge: (source, target, kind = 'calls') => {
            const graphEdge = createGraphEdge(source, target, kind);
            const flowEdge = toFlowEdge(graphEdge);

            set((state) => ({
                history: {
                    past: trimHistoryPast([
                        ...state.history.past,
                        { nodes: state.nodes, edges: state.edges },
                    ]),
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
                        past: trimHistoryPast([
                            ...state.history.past,
                            { nodes: state.nodes, edges: state.edges },
                        ]),
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
                    past: trimHistoryPast([
                        ...state.history.past,
                        { nodes: state.nodes, edges: state.edges },
                    ]),
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
                    past: trimHistoryPast([
                        ...state.history.past,
                        { nodes: state.nodes, edges: state.edges },
                    ]),
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
                    past: trimHistoryPast([
                        ...state.history.past,
                        { nodes: state.nodes, edges: state.edges },
                    ]),
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
                const filteredChanges = filterSystemNodeRemovals(
                    changes,
                    state.nodes,
                );
                const updatedNodes = applyNodeChanges(
                    filteredChanges,
                    state.nodes,
                ) as ArchitectureState['nodes'];
                if (!shouldRecordNodeHistory(filteredChanges)) {
                    return { ...state, nodes: updatedNodes };
                }
                return {
                    ...state,
                    history: {
                        past: trimHistoryPast([
                            ...state.history.past,
                            { nodes: state.nodes, edges: state.edges },
                        ]),
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
                        past: trimHistoryPast([
                            ...state.history.past,
                            { nodes: state.nodes, edges: state.edges },
                        ]),
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
                        future: trimHistoryFuture([
                            { nodes: state.nodes, edges: state.edges },
                            ...state.history.future,
                        ]),
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
                        past: trimHistoryPast([
                            ...state.history.past,
                            { nodes: state.nodes, edges: state.edges },
                        ]),
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
