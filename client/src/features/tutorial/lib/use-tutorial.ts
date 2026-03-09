import { useCallback, useMemo } from 'react';

import type { NodeKind, TypeOrNull } from '@/shared/model/types';

import { useTutorialStore } from '../model/store';
import type { TutorialStep } from '../model/types';

const FRONTEND_KINDS: NodeKind[] = ['ui_page', 'ui_component', 'state_store'];
const BACKEND_KINDS: NodeKind[] = ['api_gateway', 'service'];
const DATA_KINDS: NodeKind[] = ['database', 'cache', 'external_system'];

const hasFrontend = (kinds: NodeKind[]): boolean =>
    kinds.some((kind) => FRONTEND_KINDS.includes(kind));
const hasApiGateway = (kinds: NodeKind[]): boolean =>
    kinds.includes('api_gateway');
const hasService = (kinds: NodeKind[]): boolean => kinds.includes('service');
const hasBackend = (kinds: NodeKind[]): boolean =>
    kinds.some((kind) => BACKEND_KINDS.includes(kind));
const hasDataLayer = (kinds: NodeKind[]): boolean =>
    kinds.some((kind) => DATA_KINDS.includes(kind));
const hasOnlySystem = (kinds: NodeKind[]): boolean =>
    kinds.length <= 1 && (kinds.length === 0 || kinds[0] === 'system');

const HINT_BY_STEP: Record<Exclude<TutorialStep, 'empty'>, string> = {
    'add-frontend': 'Добавьте слой представления: страницу или компонент',
    'add-backend': 'Добавьте API Gateway или сервис для связи с данными',
    'add-service':
        'Добавьте сервис: он обращается к БД и кэшу (API Gateway только маршрутизирует)',
    'add-data-layer': 'Добавьте слой данных: базу, кэш или внешнюю систему',
    'connect-nodes': 'Свяжите компоненты: перетащите от одного узла к другому',
    'run-analysis': 'Нажмите «Анализ» для проверки архитектуры',
};

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
        if (nodesCount > 1 && edgesCount === 0) {
            return 'connect-nodes';
        }

        const needsMoreConnections =
            nodesCount > 2 && edgesCount < nodesCount - 1;
        if (
            needsMoreConnections &&
            (hasBackend(nodeKinds) || hasDataLayer(nodeKinds))
        ) {
            return 'connect-nodes';
        }
        if (hasOnlySystem(nodeKinds)) {
            return 'add-frontend';
        }
        if (hasDataLayer(nodeKinds) && !hasBackend(nodeKinds)) {
            return 'add-backend';
        }
        if (!hasFrontend(nodeKinds) && !hasBackend(nodeKinds)) {
            return 'add-frontend';
        }
        if (!hasBackend(nodeKinds)) {
            return 'add-backend';
        }
        if (hasApiGateway(nodeKinds) && !hasService(nodeKinds)) {
            return 'add-service';
        }
        if (!hasDataLayer(nodeKinds)) {
            return 'add-data-layer';
        }
        if (
            edgesCount > 0 &&
            (hasBackend(nodeKinds) || hasDataLayer(nodeKinds))
        ) {
            return 'run-analysis';
        }
        return 'connect-nodes';
    }, [nodesCount, edgesCount, nodeKinds]);

    const hint = useMemo(
        (): TypeOrNull<string> =>
            step === 'empty' ? null : HINT_BY_STEP[step],
        [step],
    );

    const dismiss = useCallback(() => {
        setHintsEnabled(false);
    }, [setHintsEnabled]);

    const showBanner = step !== 'empty' && Boolean(hint) && hintsEnabled;

    return { step, hint, showBanner, dismiss };
};
