import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { TutorialState } from './types';

const TUTORIAL_STORAGE_KEY = 'tutorial-hints';

export const useTutorialStore = create<TutorialState>()(
    persist(
        (set) => ({
            hintsEnabled: true,
            toggleHints: () =>
                set((state) => ({ hintsEnabled: !state.hintsEnabled })),
            setHintsEnabled: (enabled) => set({ hintsEnabled: enabled }),
        }),
        { name: TUTORIAL_STORAGE_KEY },
    ),
);
