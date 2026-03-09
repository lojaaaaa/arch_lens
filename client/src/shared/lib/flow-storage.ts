import type { TypeOrNull } from '@/shared/model/types';

import type { StoredFlow } from './stored-flow-to-graph';

const STORAGE_KEY = 'architecture-editor-flow';

export type { StoredFlow };

export const loadFlowFromStorage = (): TypeOrNull<StoredFlow> => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        return JSON.parse(raw) as StoredFlow;
    } catch {
        return null;
    }
};

export const saveFlowToStorage = (
    flow: Omit<StoredFlow, 'savedAt'>,
): boolean => {
    try {
        const stored: StoredFlow = {
            ...flow,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        return true;
    } catch (error) {
        if (
            error instanceof DOMException &&
            error.name === 'QuotaExceededError'
        ) {
            console.warn('localStorage full: unable to save flow', error);
        }
        return false;
    }
};

export const hasStoredFlow = (): boolean =>
    localStorage.getItem(STORAGE_KEY) !== null;

export const clearFlowFromStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
};
