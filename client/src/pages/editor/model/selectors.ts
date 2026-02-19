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
            addEdge: state.addEdge,
            removeNode: state.removeNode,
            removeEdge: state.removeEdge,
            updateNode: state.updateNode,
            updateArchitectureNode: state.updateArchitectureNode,
            updateEdge: state.updateEdge,
            markSaved: state.markSaved,
            setFlowInstance: state.setFlowInstance,
        })),
    );
