import { nanoid } from 'nanoid';
import { create } from 'zustand';

import type { TextBlock } from './types';

const DEFAULT_WIDTH = 240;
const DEFAULT_HEIGHT = 120;

type TextBlocksState = {
    blocks: TextBlock[];
    visible: boolean;
    isDirty: boolean;
    addBlock: (position: { x: number; y: number }) => void;
    removeBlock: (id: string) => void;
    updatePosition: (id: string, position: { x: number; y: number }) => void;
    updateContent: (id: string, content: string) => void;
    updateSize: (id: string, size: { width?: number; height?: number }) => void;
    setVisible: (visible: boolean) => void;
    toggleVisible: () => void;
    restoreBlocks: (blocks: TextBlock[]) => void;
    markNotesSaved: () => void;
};

export const useCanvasNotesStore = create<TextBlocksState>((set) => ({
    blocks: [],
    visible: true,
    isDirty: false,

    addBlock: (position) =>
        set((state) => ({
            ...state,
            blocks: [
                ...state.blocks,
                {
                    id: nanoid(),
                    position,
                    content: '',
                    width: DEFAULT_WIDTH,
                    height: DEFAULT_HEIGHT,
                },
            ],
            isDirty: true,
        })),

    removeBlock: (id) =>
        set((state) => ({
            blocks: state.blocks.filter((b) => b.id !== id),
            isDirty: true,
        })),

    updatePosition: (id, position) =>
        set((state) => ({
            blocks: state.blocks.map((b) =>
                b.id === id ? { ...b, position } : b,
            ),
            isDirty: true,
        })),

    updateContent: (id, content) =>
        set((state) => ({
            blocks: state.blocks.map((b) =>
                b.id === id ? { ...b, content } : b,
            ),
            isDirty: true,
        })),

    updateSize: (id, size) =>
        set((state) => ({
            blocks: state.blocks.map((b) =>
                b.id === id ? { ...b, ...size } : b,
            ),
            isDirty: true,
        })),

    setVisible: (visible) => set({ visible }),

    toggleVisible: () => set((state) => ({ visible: !state.visible })),

    restoreBlocks: (blocks) => set({ blocks, isDirty: false }),

    markNotesSaved: () => set({ isDirty: false }),
}));
