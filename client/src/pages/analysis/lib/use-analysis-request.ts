import { useEffect } from 'react';

import { useAnalysisActions, useAnalysisSelectors } from '../model/selectors';

export const useAnalysisRequest = () => {
    const { graphToAnalyze, analysisStatus } = useAnalysisSelectors();
    const { runAnalysis } = useAnalysisActions();

    useEffect(() => {
        if (!graphToAnalyze || analysisStatus !== 'idle') {
            return;
        }
        runAnalysis(graphToAnalyze);
    }, [graphToAnalyze, analysisStatus, runAnalysis]);
};
