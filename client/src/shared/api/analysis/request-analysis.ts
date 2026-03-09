import { analysisResultSchema } from './analysis-result.schema';
import type { AnalysisResult, ArchitectureGraph } from '../../model/types';
import { apiRequest } from '../client';

const ANALYSIS_ENDPOINT = '/api/analysis';

export const requestArchitectureAnalysis = async (
    graph: ArchitectureGraph,
    signal?: AbortSignal,
): Promise<AnalysisResult> => {
    const raw = await apiRequest<unknown>(
        ANALYSIS_ENDPOINT,
        { method: 'POST', body: JSON.stringify(graph) },
        { signal },
    );

    return analysisResultSchema.parse(raw) as AnalysisResult;
};
