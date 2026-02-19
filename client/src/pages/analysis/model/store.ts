import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { requestArchitectureAnalysis } from '@/shared/api/analysis/request-analysis';
import { handleError } from '@/shared/lib/utils';
import type { AnalysisResult } from '@/shared/model/types';

import type { AnalysisState } from './types';

const STORAGE_KEY = 'archlens:last-analysis';

const loadLastAnalysis = (): AnalysisResult | null => {
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
    } catch {
        /* localStorage full or unavailable */
    }
};

export const useAnalysisStore = create<AnalysisState>()(
    devtools((set) => ({
        graphToAnalyze: null,
        analysisResult: null,
        analysisStatus: 'idle',
        analysisError: null,
        highlightedNodeIds: [],

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
        setHighlightedNodeIds: (highlightedNodeIds) =>
            set({ highlightedNodeIds }),
        clearHighlight: () => set({ highlightedNodeIds: [] }),
        runAnalysis: async (graph) => {
            set({ analysisStatus: 'loading', analysisError: null });
            try {
                const analysisResult = await requestArchitectureAnalysis(graph);
                saveAnalysis(analysisResult);
                set({ analysisResult, analysisStatus: 'success' });
            } catch (error: unknown) {
                const analysisError = handleError(
                    error,
                    'Ошибка при выполнении анализа',
                );
                set({ analysisError, analysisStatus: 'error' });
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
        clearAnalysis: () =>
            set({
                graphToAnalyze: null,
                analysisResult: null,
                analysisStatus: 'idle',
                analysisError: null,
                highlightedNodeIds: [],
            }),
    })),
);
