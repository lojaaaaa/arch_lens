import { lazy, Suspense } from 'react';

import { ArchitectureCanvas } from './canvas/architecture-canvas';
import {
    useArchitectureSelectedEdgeId,
    useArchitectureSelectedNodeId,
} from '../model/selectors';

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
    const selectedNodeId = useArchitectureSelectedNodeId();
    const selectedEdgeId = useArchitectureSelectedEdgeId();

    return (
        <div className="relative flex-1 min-h-0 overflow-hidden">
            {selectedNodeId && (
                <Suspense fallback={null}>
                    <NodePropertiesSheet />
                </Suspense>
            )}
            {selectedEdgeId && (
                <Suspense fallback={null}>
                    <EdgePropertiesSheet />
                </Suspense>
            )}
            <ArchitectureCanvas />
        </div>
    );
};
