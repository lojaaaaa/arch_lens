import { useCallback, useEffect, useState } from 'react';

import {
    applyTheme,
    getStoredTheme,
    setStoredTheme,
    type Theme,
} from './theme';

export const useTheme = () => {
    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = getStoredTheme();
        if (stored) {
            return stored;
        }
        if (
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
        ) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        applyTheme(theme);
        setStoredTheme(theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    return { theme, setTheme: setThemeState, toggleTheme };
};
