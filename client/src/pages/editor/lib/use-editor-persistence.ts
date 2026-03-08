import { useCallback, useEffect, useRef, useState } from 'react';

import {
    clearFlowFromStorage,
    ensureSystemFlowGraph,
    hasStoredFlow,
    loadFlowFromStorage,
    saveFlowToStorage,
} from './utils';
import {
    useArchitectureActions,
    useArchitectureSelectors,
} from '../model/selectors';

export const useEditorPersistence = () => {
    const [, setStorageVersion] = useState(0);
    const hasRestoredRef = useRef(false);

    const { nodes, edges, isDirty, flowInstance } = useArchitectureSelectors();

    const { restoreFlow, markSaved } = useArchitectureActions();

    const save = useCallback(() => {
        const instance = flowInstance as
            | {
                  toObject: () => {
                      nodes: unknown[];
                      edges: unknown[];
                      viewport: { x: number; y: number; zoom: number };
                  };
              }
            | null
            | undefined;
        if (!instance?.toObject) {
            return;
        }
        const flow = instance.toObject();
        saveFlowToStorage({
            nodes: flow.nodes,
            edges: flow.edges,
            viewport: flow.viewport,
        });
        markSaved();
        setStorageVersion((version) => version + 1);
    }, [flowInstance, markSaved]);

    const restore = useCallback(() => {
        const stored = loadFlowFromStorage();
        if (!stored) {
            return;
        }
        const { nodes: nextNodes, edges: nextEdges } = ensureSystemFlowGraph(
            stored.nodes as Parameters<typeof restoreFlow>[0],
            stored.edges as Parameters<typeof restoreFlow>[1],
        );
        restoreFlow(nextNodes, nextEdges);
        (
            flowInstance as {
                setViewport?: (viewport: unknown) => Promise<unknown>;
            }
        )
            ?.setViewport?.(stored.viewport)
            ?.catch(() => {
                // viewport might be async, ignore
            });
    }, [flowInstance, restoreFlow]);

    const reset = useCallback(() => {
        clearFlowFromStorage();
        setStorageVersion((version) => version + 1);
    }, []);

    const isDefaultState = nodes.length <= 1 && edges.length === 0;

    useEffect(() => {
        if (
            hasStoredFlow() &&
            !hasRestoredRef.current &&
            flowInstance &&
            isDefaultState
        ) {
            hasRestoredRef.current = true;
            const stored = loadFlowFromStorage();
            if (stored) {
                const { nodes: nextNodes, edges: nextEdges } =
                    ensureSystemFlowGraph(
                        stored.nodes as Parameters<typeof restoreFlow>[0],
                        stored.edges as Parameters<typeof restoreFlow>[1],
                    );
                restoreFlow(nextNodes, nextEdges);
                (
                    flowInstance as {
                        setViewport?: (viewport: unknown) => Promise<unknown>;
                    }
                )
                    ?.setViewport?.(stored.viewport)
                    ?.catch(() => {});
            }
        }
    }, [flowInstance, isDefaultState, restoreFlow]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isDirty) {
                event.preventDefault();
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    return {
        save,
        restore,
        reset,
        isDirty,
        hasStoredFlow: hasStoredFlow(),
    };
};
