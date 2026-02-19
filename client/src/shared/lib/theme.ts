const STORAGE_KEY = 'archlens:theme';

export type Theme = 'light' | 'dark';

export const getStoredTheme = (): Theme | null => {
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
};
