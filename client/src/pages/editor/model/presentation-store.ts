import { create } from 'zustand';

export const usePresentationStore = create<{
    isPresentationMode: boolean;
    toggle: () => void;
    exit: () => void;
}>((set) => ({
    isPresentationMode: false,
    toggle: () =>
        set((state) => ({ isPresentationMode: !state.isPresentationMode })),
    exit: () => set({ isPresentationMode: false }),
}));
