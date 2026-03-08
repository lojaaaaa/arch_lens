import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'archlens:tutorial-hints';

type TutorialState = {
    hintsEnabled: boolean;
    toggleHints: () => void;
    setHintsEnabled: (enabled: boolean) => void;
};

export const useTutorialStore = create<TutorialState>()(
    persist(
        (set) => ({
            hintsEnabled: true,
            toggleHints: () =>
                set((state) => ({ hintsEnabled: !state.hintsEnabled })),
            setHintsEnabled: (enabled) => set({ hintsEnabled: enabled }),
        }),
        { name: STORAGE_KEY },
    ),
);
