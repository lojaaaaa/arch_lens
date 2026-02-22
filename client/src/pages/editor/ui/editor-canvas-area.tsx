import { lazy, Suspense } from 'react';

import { ArchitectureCanvas } from './canvas/architecture-canvas';

const NodePropertiesSheet = lazy(() =>
    import('./properties/node-properties-sheet').then((module) => ({
        default: module.NodePropertiesSheet,
    })),
);

const EdgePropertiesSheet = lazy(() =>
    import('./properties/edge-properties-sheet').then((module) => ({
        default: module.EdgePropertiesSheet,
    })),
);

export const EditorCanvasArea = () => {
    return (
        <div className="relative flex-1 min-h-0 overflow-hidden">
            <Suspense fallback={null}>
                <NodePropertiesSheet />
                <EdgePropertiesSheet />
            </Suspense>
            <ArchitectureCanvas />
        </div>
    );
};
