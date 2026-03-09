import { useCallback, useEffect, useRef, useState } from 'react';

import { useCanvasNotesStore } from '@/features/canvas-notes';
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

const isArchitectureNode = (n: {
    type?: string;
    data?: { node?: unknown };
}): boolean =>
    n.type === 'architecture' &&
    n.data?.node !== undefined &&
    n.data?.node !== null;

export const useEditorPersistence = () => {
    const [, setStorageVersion] = useState(0);
    const hasRestoredRef = useRef(false);

    const nodes = useArchitectureNodes();
    const edges = useArchitectureEdges();
    const architectureIsDirty = useArchitectureIsDirty();
    const notesIsDirty = useCanvasNotesStore((state) => state.isDirty);
    const isDirty = architectureIsDirty || notesIsDirty;
    const flowInstance = useArchitectureFlowInstance();

    const { restoreFlow, markSaved } = useArchitectureActions();

    const save = useCallback(
        (includeNotes = true) => {
            if (!flowInstance?.toObject) {
                return;
            }
            const flow = flowInstance.toObject();
            const architectureNodes = (flow.nodes ?? []).filter(
                isArchitectureNode,
            );
            const stored = loadFlowFromStorage();
            const canvasNotes = includeNotes
                ? useCanvasNotesStore.getState().blocks
                : stored?.canvasNotes;
            saveFlowToStorage({
                nodes: architectureNodes,
                edges: flow.edges,
                viewport: flow.viewport,
                canvasNotes,
            });
            if (includeNotes) {
                useCanvasNotesStore.getState().markNotesSaved();
            }
            markSaved();
            setStorageVersion((version) => version + 1);
        },
        [flowInstance, markSaved],
    );

    const restore = useCallback(() => {
        const stored = loadFlowFromStorage();
        if (!stored) {
            return;
        }
        const storedNodes = (stored.nodes ?? []).filter((n) =>
            isArchitectureNode(
                n as { type?: string; data?: { node?: unknown } },
            ),
        );
        const { nodes: nextNodes, edges: nextEdges } = ensureSystemFlowGraph(
            storedNodes as Parameters<typeof restoreFlow>[0],
            stored.edges as Parameters<typeof restoreFlow>[1],
        );
        restoreFlow(nextNodes, nextEdges);
        useCanvasNotesStore.getState().restoreBlocks(stored.canvasNotes ?? []);
        flowInstance?.setViewport?.(stored.viewport)?.catch(() => {
            // viewport might be async, ignore
        });
    }, [flowInstance, restoreFlow]);

    const reset = useCallback(() => {
        clearFlowFromStorage();
        useCanvasNotesStore.getState().restoreBlocks([]);
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
                const storedNodes = (stored.nodes ?? []).filter((n) =>
                    isArchitectureNode(
                        n as { type?: string; data?: { node?: unknown } },
                    ),
                );
                const { nodes: nextNodes, edges: nextEdges } =
                    ensureSystemFlowGraph(
                        storedNodes as Parameters<typeof restoreFlow>[0],
                        stored.edges as Parameters<typeof restoreFlow>[1],
                    );
                restoreFlow(nextNodes, nextEdges);
                useCanvasNotesStore
                    .getState()
                    .restoreBlocks(stored.canvasNotes ?? []);
                flowInstance?.setViewport?.(stored.viewport)?.catch(() => {});
            }
        }
    }, [flowInstance, isDefaultState, restoreFlow]);

    // Save on pagehide only architecture (not notes) — notes persist only on explicit Save
    useEffect(() => {
        const handlePageHide = (event: PageTransitionEvent) => {
            if (!event.persisted && architectureIsDirty) {
                save(false);
            }
        };
        window.addEventListener('pagehide', handlePageHide);
        return () => window.removeEventListener('pagehide', handlePageHide);
    }, [architectureIsDirty, save]);

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
