import { useEffect, useRef } from 'react';
import type { Edge } from '@xyflow/react';

import { isEditableTarget } from '@/shared/lib/utils';
import type { TypeOrNull } from '@/shared/model/types';

import { useEditorClipboard } from './use-editor-clipboard';
import {
    useArchitectureHotkeysActions,
    useArchitectureSelectors,
} from '../model/selectors';
import type { ArchitectureFlowNode } from '../model/types';

type EditorHotkey =
    | 'undo'
    | 'redo'
    | 'duplicate'
    | 'copy'
    | 'paste'
    | 'delete'
    | 'escape';

type SelectableItem = { id: string; selected?: boolean };

type EditorHotkeysContext = {
    nodes: ArchitectureFlowNode[];
    edges: Edge[];
    selectedNodeId: TypeOrNull<string>;
    selectedEdgeId: TypeOrNull<string>;
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    setNodes: (nodes: ArchitectureFlowNode[]) => void;
    setEdges: (edges: Edge[]) => void;
    removeNode: (id: string) => void;
    removeEdge: (id: string) => void;
    selectNode: (id: TypeOrNull<string>) => void;
    selectEdge: (id: TypeOrNull<string>) => void;
};

const buildEditorHotkeysContext = (
    nodes: ArchitectureFlowNode[],
    edges: Edge[],
    selectedNodeId: TypeOrNull<string>,
    selectedEdgeId: TypeOrNull<string>,
    actions: Pick<
        EditorHotkeysContext,
        | 'undo'
        | 'redo'
        | 'canUndo'
        | 'canRedo'
        | 'setNodes'
        | 'setEdges'
        | 'removeNode'
        | 'removeEdge'
        | 'selectNode'
        | 'selectEdge'
    >,
) => ({
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    ...actions,
});

const resolveSelectedItem = <TItem extends SelectableItem>(
    items: TItem[],
    selectedId: TypeOrNull<string>,
): TypeOrNull<TItem> => {
    if (selectedId) {
        return items.find((item) => item.id === selectedId) ?? null;
    }

    return items.find((item) => item.selected) ?? null;
};

const resolveHotkey = (event: KeyboardEvent): TypeOrNull<EditorHotkey> => {
    const metaOrCtrl = event.metaKey || event.ctrlKey;

    const isUndo = metaOrCtrl && !event.shiftKey && event.code === 'KeyZ';
    const isRedo =
        metaOrCtrl &&
        (event.code === 'KeyY' || (event.shiftKey && event.code === 'KeyZ'));

    const isDuplicate = metaOrCtrl && event.code === 'KeyX';
    const isCopy = metaOrCtrl && event.code === 'KeyC';
    const isPaste = metaOrCtrl && event.code === 'KeyV';
    const isDelete = event.key === 'Delete' || event.key === 'Backspace';
    const isEscape = event.key === 'Escape';

    if (isUndo) {
        return 'undo';
    }

    if (isRedo) {
        return 'redo';
    }

    if (isDuplicate) {
        return 'duplicate';
    }

    if (isCopy) {
        return 'copy';
    }

    if (isPaste) {
        return 'paste';
    }

    if (isDelete) {
        return 'delete';
    }

    if (isEscape) {
        return 'escape';
    }

    return null;
};

export const handleEditorHotkeys = (
    event: KeyboardEvent,
    context: EditorHotkeysContext,
    clipboard: ReturnType<typeof useEditorClipboard>,
) => {
    const hotkey = resolveHotkey(event);

    if (!hotkey) {
        return false;
    }

    if (isEditableTarget(event.target)) {
        return false;
    }

    event.preventDefault();

    const selectedNode = resolveSelectedItem(
        context.nodes,
        context.selectedNodeId,
    );
    const selectedEdge = resolveSelectedItem(
        context.edges,
        context.selectedEdgeId,
    );

    const handleUndo = () => {
        if (context.canUndo()) {
            context.undo();
        }
        return true;
    };

    const handleRedo = () => {
        if (context.canRedo()) {
            context.redo();
        }
        return true;
    };

    const handleDuplicate = () => {
        if (selectedNode) {
            clipboard.duplicate(selectedNode);
        }
        return true;
    };

    const handleCopy = () => {
        if (selectedNode) {
            clipboard.copy(selectedNode);
        }
        return true;
    };

    const handleDelete = () => {
        if (selectedEdge) {
            context.removeEdge(selectedEdge.id);
            context.selectEdge(null);
        } else if (selectedNode) {
            context.removeNode(selectedNode.id);
            context.selectNode(null);
        }
        return true;
    };

    const handleEscape = () => {
        context.selectNode(null);
        context.selectEdge(null);
        return true;
    };

    const handlePaste = () => {
        clipboard.paste();
        return true;
    };

    const handlers: Record<EditorHotkey, () => boolean> = {
        undo: handleUndo,
        redo: handleRedo,
        duplicate: handleDuplicate,
        copy: handleCopy,
        paste: handlePaste,
        delete: handleDelete,
        escape: handleEscape,
    };

    return handlers[hotkey]();
};

export const useEditorHotkeys = () => {
    const { nodes, edges, selectedNodeId, selectedEdgeId } =
        useArchitectureSelectors();

    const actions = useArchitectureHotkeysActions();

    const clipboard = useEditorClipboard({
        nodes,
        edges,
        setNodes: actions.setNodes,
        setEdges: actions.setEdges,
    });

    const context = buildEditorHotkeysContext(
        nodes,
        edges,
        selectedNodeId,
        selectedEdgeId,
        actions,
    );

    const contextRef = useRef<EditorHotkeysContext>(context);
    const clipboardRef = useRef(clipboard);

    useEffect(() => {
        contextRef.current = context;
    }, [context]);

    useEffect(() => {
        clipboardRef.current = clipboard;
    }, [clipboard]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) =>
            handleEditorHotkeys(
                event,
                contextRef.current,
                clipboardRef.current,
            );

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
};
