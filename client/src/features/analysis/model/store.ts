import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { useGraphHighlightStore } from '@/features/graph-highlight';
import { requestArchitectureAnalysis } from '@/shared/api/analysis/request-analysis';
import { handleError } from '@/shared/lib/utils';
import type { AnalysisResult, TypeOrNull } from '@/shared/model/types';

import type { AnalysisState } from './types';

const STORAGE_KEY = 'archlens:last-analysis';

const loadLastAnalysis = (): TypeOrNull<AnalysisResult> => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        return JSON.parse(raw) as AnalysisResult;
    } catch {
        return null;
    }
};

const saveAnalysis = (result: AnalysisResult) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch (error) {
        if (
            error instanceof DOMException &&
            error.name === 'QuotaExceededError'
        ) {
            console.warn('localStorage full: unable to cache analysis', error);
        }
    }
};

let analysisAbortController: TypeOrNull<AbortController> = null;

export const useAnalysisStore = create<AnalysisState>()(
    devtools((set) => ({
        graphToAnalyze: null,
        analysisResult: null,
        analysisStatus: 'idle',
        analysisError: null,
        showMetricsOnGraph: false,
        showDataFlowAnimation: false,
        graphChangedSinceAnalysis: false,

        setGraphToAnalyze: (graphToAnalyze) =>
            set({
                graphToAnalyze,
                analysisStatus: 'idle',
                analysisResult: null,
                analysisError: null,
            }),
        setAnalysisResult: (analysisResult) => set({ analysisResult }),
        setAnalysisStatus: (analysisStatus) => set({ analysisStatus }),
        setAnalysisError: (analysisError) => set({ analysisError }),
        setShowMetricsOnGraph: (showMetricsOnGraph) =>
            set({ showMetricsOnGraph }),
        setShowDataFlowAnimation: (showDataFlowAnimation) =>
            set({ showDataFlowAnimation }),
        runAnalysis: async (graph) => {
            analysisAbortController?.abort();
            analysisAbortController = new AbortController();
            const signal = analysisAbortController.signal;

            set({ analysisStatus: 'loading', analysisError: null });
            try {
                const analysisResult = await requestArchitectureAnalysis(
                    graph,
                    signal,
                );
                if (signal.aborted) {
                    return;
                }
                saveAnalysis(analysisResult);
                set({
                    analysisResult,
                    analysisStatus: 'success',
                    graphChangedSinceAnalysis: false,
                });
            } catch (error: unknown) {
                if (
                    signal.aborted ||
                    (error instanceof DOMException &&
                        error.name === 'AbortError')
                ) {
                    return;
                }
                const analysisError = handleError(
                    error,
                    'Ошибка при выполнении анализа',
                );
                set({ analysisError, analysisStatus: 'error' });
            } finally {
                if (analysisAbortController?.signal === signal) {
                    analysisAbortController = null;
                }
            }
        },
        restoreLastAnalysis: () => {
            const cached = loadLastAnalysis();
            if (cached) {
                set({
                    analysisResult: cached,
                    analysisStatus: 'success',
                });
            }
        },
        clearAnalysis: () => {
            useGraphHighlightStore.getState().clearHighlight();
            set({
                graphToAnalyze: null,
                analysisResult: null,
                analysisStatus: 'idle',
                analysisError: null,
                showMetricsOnGraph: false,
                showDataFlowAnimation: false,
                graphChangedSinceAnalysis: false,
            });
        },
        markGraphChanged: () => {
            const { analysisResult } = useAnalysisStore.getState();
            if (analysisResult) {
                set({ graphChangedSinceAnalysis: true });
            }
        },
    })),
);
