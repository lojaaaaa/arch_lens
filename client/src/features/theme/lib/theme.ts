import type { TypeOrNull } from '@/shared/model/types';

import type { Theme } from '../model/types';

export const STORAGE_KEY = 'archlens:theme';
export const THEME_EVENT = 'archlens:theme-change';

export const getStoredTheme = (): TypeOrNull<Theme> => {
    if (typeof window === 'undefined') {
        return null;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark') {
        return raw;
    }
    return null;
};

export const setStoredTheme = (theme: Theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
};

export const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new CustomEvent(THEME_EVENT, { detail: { theme } }),
        );
    }
};
