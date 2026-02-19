import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { requestArchitectureAnalysis } from '@/shared/api/analysis/request-analysis';
import { handleError } from '@/shared/lib/utils';

import type { AnalysisState } from './types';

export const useAnalysisStore = create<AnalysisState>()(
    devtools((set) => ({
        graphToAnalyze: null,
        analysisResult: null,
        analysisStatus: 'idle',
        analysisError: null,

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
        runAnalysis: async (graph) => {
            set({ analysisStatus: 'loading', analysisError: null });
            try {
                // TODO: Временная задержка
                await new Promise<void>((res) =>
                    setTimeout(() => {
                        res();
                    }, 2000),
                );
                const analysisResult = await requestArchitectureAnalysis(graph);
                set({ analysisResult, analysisStatus: 'success' });
            } catch (error: unknown) {
                const analysisError = handleError(
                    error,
                    'Ошибка при выполнении анализа',
                );
                set({ analysisError, analysisStatus: 'error' });
            }
        },
        clearAnalysis: () =>
            set({
                graphToAnalyze: null,
                analysisResult: null,
                analysisStatus: 'idle',
                analysisError: null,
            }),
    })),
);
