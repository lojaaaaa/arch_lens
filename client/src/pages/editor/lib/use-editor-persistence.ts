import { useCallback, useEffect, useRef, useState } from 'react';

import {
    clearFlowFromStorage,
    hasStoredFlow,
    loadFlowFromStorage,
    saveFlowToStorage,
} from '@/shared/lib/flow-storage';

import { ensureSystemFlowGraph } from './utils';
import {
    useArchitectureActions,
    useArchitectureEdges,
    useArchitectureFlowInstance,
    useArchitectureIsDirty,
    useArchitectureNodes,
} from '../model/selectors';

export const useEditorPersistence = () => {
    const [, setStorageVersion] = useState(0);
    const hasRestoredRef = useRef(false);

    const nodes = useArchitectureNodes();
    const edges = useArchitectureEdges();
    const isDirty = useArchitectureIsDirty();
    const flowInstance = useArchitectureFlowInstance();

    const { restoreFlow, markSaved } = useArchitectureActions();

    const save = useCallback(() => {
        if (!flowInstance?.toObject) {
            return;
        }
        const flow = flowInstance.toObject();
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
        flowInstance?.setViewport?.(stored.viewport)?.catch(() => {
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
                flowInstance?.setViewport?.(stored.viewport)?.catch(() => {});
            }
        }
    }, [flowInstance, isDefaultState, restoreFlow]);

    // Save on pagehide when leaving (not bfcache) — preserves data without blocking bfcache
    useEffect(() => {
        const handlePageHide = (event: PageTransitionEvent) => {
            if (!event.persisted && isDirty) {
                save();
            }
        };
        window.addEventListener('pagehide', handlePageHide);
        return () => window.removeEventListener('pagehide', handlePageHide);
    }, [isDirty, save]);

    // beforeunload only when dirty — minimal use to allow bfcache for clean pages
    useEffect(() => {
        if (!isDirty) {
            return;
        }
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
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
