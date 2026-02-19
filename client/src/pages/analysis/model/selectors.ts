import { useShallow } from 'zustand/shallow';

import { useAnalysisStore } from './store';

export const useAnalysisSelectors = () =>
    useAnalysisStore(
        useShallow((state) => ({
            graphToAnalyze: state.graphToAnalyze,
            analysisResult: state.analysisResult,
            analysisStatus: state.analysisStatus,
            analysisError: state.analysisError,
            highlightedNodeIds: state.highlightedNodeIds,
        })),
    );

export const useAnalysisActions = () =>
    useAnalysisStore(
        useShallow((state) => ({
            runAnalysis: state.runAnalysis,
            restoreLastAnalysis: state.restoreLastAnalysis,
            clearAnalysis: state.clearAnalysis,
            setGraphToAnalyze: state.setGraphToAnalyze,
            setHighlightedNodeIds: state.setHighlightedNodeIds,
            clearHighlight: state.clearHighlight,
        })),
    );
