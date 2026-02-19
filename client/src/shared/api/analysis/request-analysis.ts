import type { AnalysisResult, ArchitectureGraph } from '../../model/types';
import { apiRequest } from '../client';

const ANALYSIS_ENDPOINT = '/api/analysis';

export const requestArchitectureAnalysis = async (
    graph: ArchitectureGraph,
): Promise<AnalysisResult> => {
    return apiRequest<AnalysisResult>(ANALYSIS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(graph),
    });
};
