import { useCallback, useEffect, useState } from 'react';

import {
    applyTheme,
    getStoredTheme,
    setStoredTheme,
    STORAGE_KEY,
    THEME_EVENT,
} from './theme';
import type { Theme } from '../model/types';

export const useTheme = () => {
    const resolveInitialTheme = (): Theme => {
        const storedTheme = getStoredTheme();
        if (storedTheme) {
            return storedTheme;
        }
        if (
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
        ) {
            return 'dark';
        }
        return 'light';
    };

    const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);

    useEffect(() => {
        applyTheme(theme);
        setStoredTheme(theme);
    }, [theme]);

    useEffect(() => {
        const handleThemeEvent = (event: Event) => {
            const customEvent = event as CustomEvent<{ theme?: Theme }>;
            const nextTheme = customEvent.detail?.theme;
            if (nextTheme) {
                setThemeState(nextTheme);
            }
        };

        const handleStorageEvent = (event: StorageEvent) => {
            if (event.key !== STORAGE_KEY) {
                return;
            }
            const storedTheme = getStoredTheme();
            if (storedTheme) {
                setThemeState(storedTheme);
            }
        };

        window.addEventListener(THEME_EVENT, handleThemeEvent);
        window.addEventListener('storage', handleStorageEvent);

        return () => {
            window.removeEventListener(THEME_EVENT, handleThemeEvent);
            window.removeEventListener('storage', handleStorageEvent);
        };
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    return { theme, setTheme: setThemeState, toggleTheme };
};
