import { ReactFlowProvider } from '@xyflow/react';

import { usePresentationStore } from '@/features/presentation';

import { useEditorHotkeys } from './lib/use-editor-hotkeys';
import { EditorLayout } from './ui/editor-layout';
import { PresentationView } from './ui/presentation-view';
import { Sidebar } from './ui/sidebar/sidebar';

const EditorPage = () => {
    const isPresentationMode = usePresentationStore(
        (state) => state.isPresentationMode,
    );

    useEditorHotkeys();

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
