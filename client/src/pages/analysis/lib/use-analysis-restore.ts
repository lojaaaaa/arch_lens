import { useEffect } from 'react';

import type { TypeOrNull } from '@/shared/model/types';

import type { AnalysisStatus } from '../model/types';

type UseAnalysisRestoreParams = {
    graphToAnalyze: unknown;
    isChecking: boolean;
    analysisStatus: AnalysisStatus;
    analysisResult: TypeOrNull<unknown>;
    restoreLastAnalysis: () => void;
};

export const useAnalysisRestore = ({
    graphToAnalyze,
    isChecking,
    analysisStatus,
    analysisResult,
    restoreLastAnalysis,
}: UseAnalysisRestoreParams) => {
    useEffect(() => {
        if (
            !graphToAnalyze &&
            !isChecking &&
            analysisStatus === 'idle' &&
            !analysisResult
        ) {
            restoreLastAnalysis();
        }
    }, [
        graphToAnalyze,
        isChecking,
        analysisStatus,
        analysisResult,
        restoreLastAnalysis,
    ]);
};
