import { lazy, Suspense } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import { useEditorHotkeys } from './lib/use-editor-hotkeys';
import { EditorLayout } from './ui/editor-layout';

const Sidebar = lazy(() =>
    import('./ui/sidebar/sidebar').then((module) => ({
        default: module.Sidebar,
    })),
);

const EditorPage = () => {
    useEditorHotkeys();

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
