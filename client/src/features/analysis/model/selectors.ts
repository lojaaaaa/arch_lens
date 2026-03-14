import { useShallow } from 'zustand/shallow';

import { useAnalysisStore } from './store';

export const useAnalysisSelectors = () =>
    useAnalysisStore(
        useShallow((state) => ({
            graphToAnalyze: state.graphToAnalyze,
            analysisResult: state.analysisResult,
            analysisStatus: state.analysisStatus,
            analysisError: state.analysisError,
            showMetricsOnGraph: state.showMetricsOnGraph,
        })),
    );

export const useAnalysisActions = () =>
    useAnalysisStore(
        useShallow((state) => ({
            runAnalysis: state.runAnalysis,
            restoreLastAnalysis: state.restoreLastAnalysis,
            clearAnalysis: state.clearAnalysis,
            setGraphToAnalyze: state.setGraphToAnalyze,
            setShowMetricsOnGraph: state.setShowMetricsOnGraph,
        })),
    );
