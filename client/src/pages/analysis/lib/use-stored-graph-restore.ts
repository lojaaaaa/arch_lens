import { useEffect, useRef, useState } from 'react';

import { useAnalysisActions, useAnalysisSelectors } from '@/features/analysis';
import { loadFlowFromStorage } from '@/shared/lib/flow-storage';
import { storedFlowToArchitectureGraph } from '@/shared/lib/stored-flow-to-graph';

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
