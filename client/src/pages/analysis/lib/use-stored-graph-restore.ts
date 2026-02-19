import { useEffect, useRef, useState } from 'react';

import { loadFlowFromStorage } from '@/pages/editor/lib/utils';
import { storedFlowToArchitectureGraph } from '@/shared/lib/stored-flow-to-graph';

import { useAnalysisActions, useAnalysisSelectors } from '../model/selectors';

export const useStoredGraphRestore = () => {
    const [isChecking, setIsChecking] = useState(true);

    const { graphToAnalyze } = useAnalysisSelectors();

    const { setGraphToAnalyze } = useAnalysisActions();

    const hasRestoredRef = useRef(false);

    useEffect(() => {
        const finishChecking = () => {
            queueMicrotask(() => setIsChecking(false));
        };

        if (graphToAnalyze !== null || hasRestoredRef.current) {
            finishChecking();
            return;
        }

        const stored = loadFlowFromStorage();
        if (!stored || stored.nodes.length === 0) {
            finishChecking();
            return;
        }

        hasRestoredRef.current = true;

        try {
            const graph = storedFlowToArchitectureGraph(stored);
            setGraphToAnalyze(graph);
        } catch {
            hasRestoredRef.current = false;
        }

        finishChecking();
    }, [graphToAnalyze, setGraphToAnalyze]);

    return { isChecking };
};
