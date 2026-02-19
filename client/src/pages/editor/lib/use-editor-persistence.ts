import { useCallback, useEffect, useRef, useState } from 'react';

import {
    clearFlowFromStorage,
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

    const { nodes, isDirty, flowInstance } = useArchitectureSelectors();

    const { setNodes, setEdges, markSaved } = useArchitectureActions();

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
        setNodes(stored.nodes as Parameters<typeof setNodes>[0]);
        setEdges(stored.edges as Parameters<typeof setEdges>[0]);
        (
            flowInstance as {
                setViewport?: (viewport: unknown) => Promise<unknown>;
            }
        )
            ?.setViewport?.(stored.viewport)
            ?.catch(() => {
                // viewport might be async, ignore
            });
        markSaved();
    }, [flowInstance, setNodes, setEdges, markSaved]);

    const reset = useCallback(() => {
        clearFlowFromStorage();
        setStorageVersion((version) => version + 1);
    }, []);

    useEffect(() => {
        if (
            hasStoredFlow() &&
            !hasRestoredRef.current &&
            flowInstance &&
            nodes.length === 0
        ) {
            hasRestoredRef.current = true;
            const stored = loadFlowFromStorage();
            if (stored) {
                setNodes(stored.nodes as Parameters<typeof setNodes>[0]);
                setEdges(stored.edges as Parameters<typeof setEdges>[0]);
                (
                    flowInstance as {
                        setViewport?: (viewport: unknown) => Promise<unknown>;
                    }
                )
                    ?.setViewport?.(stored.viewport)
                    ?.catch(() => {});
                markSaved();
            }
        }
    }, [flowInstance, nodes.length, setNodes, setEdges, markSaved]);

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
