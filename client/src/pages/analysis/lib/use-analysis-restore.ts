import { useEffect } from 'react';

import type { AnalysisStatus } from '@/features/analysis';
import type { TypeOrNull } from '@/shared/model/types';

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
