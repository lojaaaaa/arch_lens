import { useEffect, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import { useAnalysisStore } from '@/features/analysis';
import { usePresentationStore } from '@/features/presentation';

import { useEditorHotkeys } from './lib/use-editor-hotkeys';
import { useArchitectureStore } from './model/store';
import { EditorLayout } from './ui/editor-layout';
import { PresentationView } from './ui/presentation-view';
import { Sidebar } from './ui/sidebar/sidebar';

function useMarkGraphChangedOnEdit() {
    const prevRef = useRef<{ nodes: unknown; edges: unknown } | null>(null);

    useEffect(() => {
        const unsub = useArchitectureStore.subscribe((state) => {
            const prev = prevRef.current;
            if (
                prev &&
                (prev.nodes !== state.nodes || prev.edges !== state.edges)
            ) {
                useAnalysisStore.getState().markGraphChanged();
            }
            prevRef.current = { nodes: state.nodes, edges: state.edges };
        });
        return unsub;
    }, []);
}

const EditorPage = () => {
    const isPresentationMode = usePresentationStore(
        (state) => state.isPresentationMode,
    );

    useEditorHotkeys();
    useMarkGraphChangedOnEdit();

    if (isPresentationMode) {
        return (
            <ReactFlowProvider>
                <PresentationView />
            </ReactFlowProvider>
        );
    }

    return (
        <ReactFlowProvider>
            <Sidebar />
            <EditorLayout />
        </ReactFlowProvider>
    );
};

export const Component = EditorPage;
