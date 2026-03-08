import { useCallback, useMemo } from 'react';

import type { NodeKind } from '@/shared/model/types';

import { useTutorialStore } from '../model/tutorial-store';

export type TutorialStep =
    | 'empty'
    | 'add-data-layer'
    | 'connect-nodes'
    | 'run-analysis';

const hasDataLayer = (kinds: NodeKind[]): boolean =>
    kinds.some((k) => k === 'database' || k === 'cache');

export const useTutorial = (
    nodesCount: number,
    edgesCount: number,
    nodeKinds: NodeKind[],
) => {
    const hintsEnabled = useTutorialStore((state) => state.hintsEnabled);
    const setHintsEnabled = useTutorialStore((state) => state.setHintsEnabled);
    const step = useMemo((): TutorialStep => {
        if (nodesCount === 0) {
            return 'empty';
        }
        if (!hasDataLayer(nodeKinds)) {
            return 'add-data-layer';
        }
        if (nodesCount > 1 && edgesCount === 0) {
            return 'connect-nodes';
        }
        if (edgesCount > 0) {
            return 'run-analysis';
        }
        return 'run-analysis';
    }, [nodesCount, edgesCount, nodeKinds]);

    const hint = useMemo((): string | null => {
        switch (step) {
            case 'empty':
                return null;
            case 'add-data-layer':
                return 'Добавьте слой данных: базу данных или кэш';
            case 'connect-nodes':
                return 'Свяжите компоненты: перетащите от одного узла к другому';
            case 'run-analysis':
                return 'Нажмите «Анализ» в header для проверки архитектуры';
            default:
                return null;
        }
    }, [step]);

    const dismiss = useCallback(() => {
        setHintsEnabled(false);
    }, [setHintsEnabled]);

    const showBanner = step !== 'empty' && hint && hintsEnabled;

    return { step, hint, showBanner, dismiss };
};
