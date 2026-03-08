import { lazy, Suspense } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import { useEditorHotkeys } from './lib/use-editor-hotkeys';
import { usePresentationStore } from './model/presentation-store';
import { EditorLayout } from './ui/editor-layout';
import { PresentationView } from './ui/presentation-view';

const Sidebar = lazy(() =>
    import('./ui/sidebar/sidebar').then((module) => ({
        default: module.Sidebar,
    })),
);

const EditorPage = () => {
    useEditorHotkeys();
    const isPresentationMode = usePresentationStore(
        (state) => state.isPresentationMode,
    );

    if (isPresentationMode) {
        return (
            <ReactFlowProvider>
                <PresentationView />
            </ReactFlowProvider>
        );
    }

    return (
        <ReactFlowProvider>
            <Suspense fallback={null}>
                <Sidebar />
            </Suspense>
            <EditorLayout />
        </ReactFlowProvider>
    );
};

export const Component = EditorPage;
