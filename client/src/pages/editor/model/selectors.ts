import { useShallow } from 'zustand/shallow';

import { useArchitectureStore } from './store';

/** Atomic selectors — подписка только на нужные поля, меньше re-renders */
export const useArchitectureNodes = () =>
    useArchitectureStore((state) => state.nodes);
export const useArchitectureEdges = () =>
    useArchitectureStore((state) => state.edges);
export const useArchitectureSelectedNodeId = () =>
    useArchitectureStore((state) => state.selectedNodeId);
export const useArchitectureSelectedEdgeId = () =>
    useArchitectureStore((state) => state.selectedEdgeId);
export const useArchitectureIsDirty = () =>
    useArchitectureStore((state) => state.isDirty);
export const useArchitectureFlowInstance = () =>
    useArchitectureStore((state) => state.flowInstance);

export const useArchitectureActions = () =>
    useArchitectureStore(
        useShallow((state) => ({
            setNodes: state.setNodes,
            setEdges: state.setEdges,
            restoreFlow: state.restoreFlow,
            selectNode: state.selectNode,
            selectEdge: state.selectEdge,
            addNode: state.addNode,
            addNodeAtPosition: state.addNodeAtPosition,
            addEdge: state.addEdge,
            removeNode: state.removeNode,
            removeEdge: state.removeEdge,
            updateNode: state.updateNode,
            updateEdge: state.updateEdge,
            applyNodeChanges: state.applyNodeChanges,
            applyEdgeChanges: state.applyEdgeChanges,
            undo: state.undo,
            redo: state.redo,
            canUndo: state.canUndo,
            canRedo: state.canRedo,
            markSaved: state.markSaved,
            setFlowInstance: state.setFlowInstance,
        })),
    );

export const useArchitectureHotkeysActions = () =>
    useArchitectureStore(
        useShallow((state) => ({
            setNodes: state.setNodes,
            setEdges: state.setEdges,
            selectNode: state.selectNode,
            selectEdge: state.selectEdge,
            removeNode: state.removeNode,
            removeEdge: state.removeEdge,
            undo: state.undo,
            redo: state.redo,
            canUndo: state.canUndo,
            canRedo: state.canRedo,
        })),
    );
