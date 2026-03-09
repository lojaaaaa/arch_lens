import { create } from 'zustand';

import type { PresentationState } from './types';

export const usePresentationStore = create<PresentationState>()((set) => ({
    isPresentationMode: false,
    toggle: () =>
        set((state) => ({ isPresentationMode: !state.isPresentationMode })),
    exit: () => set({ isPresentationMode: false }),
}));
