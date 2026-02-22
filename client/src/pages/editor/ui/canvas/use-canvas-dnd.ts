import type { DragEvent, RefObject } from 'react';
import type { ReactFlowInstance } from '@xyflow/react';

import type { NodeKind, TypeOrNull } from '@/shared/model/types';

import { LAYER_NODE_KINDS } from '../../lib/config';
import { useArchitectureActions } from '../../model/selectors';
import type { ArchitectureFlowNode } from '../../model/types';

const ALLOWED_NODE_KINDS = new Set<NodeKind>(
    LAYER_NODE_KINDS.flatMap((layer) => layer.kinds.map((kind) => kind.kind)),
);

export const useCanvasDnd = (
    flowRef: RefObject<TypeOrNull<ReactFlowInstance<ArchitectureFlowNode>>>,
) => {
    const { addNodeAtPosition } = useArchitectureActions();

    const handleDragOver = (event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        const nodeKind = event.dataTransfer.getData(
            'application/archlens-node',
        );
        if (!nodeKind) {
            return;
        }
        if (!ALLOWED_NODE_KINDS.has(nodeKind as NodeKind)) {
            return;
        }
        const flowInstance = flowRef.current;
        if (!flowInstance) {
            return;
        }
        const position = flowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });
        addNodeAtPosition(nodeKind as NodeKind, position, { select: true });
    };

    return { handleDragOver, handleDrop };
};
