import { useShallow } from 'zustand/shallow';

import { useArchitectureStore } from './store';

export const useArchitectureSelectors = () =>
    useArchitectureStore(
        useShallow((state) => ({
            nodes: state.nodes,
            edges: state.edges,
            selectedNodeId: state.selectedNodeId,
            selectedEdgeId: state.selectedEdgeId,
            isDirty: state.isDirty,
            flowInstance: state.flowInstance,
        })),
    );

export const useArchitectureActions = () =>
    useArchitectureStore(
        useShallow((state) => ({
            setNodes: state.setNodes,
            setEdges: state.setEdges,
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
