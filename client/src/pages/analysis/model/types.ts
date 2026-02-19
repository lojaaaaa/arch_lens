import type {
    AnalysisResult,
    ArchitectureGraph,
    TypeOrNull,
} from '@/shared/model/types';

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

export type AnalysisState = {
    graphToAnalyze: TypeOrNull<ArchitectureGraph>;
    analysisResult: TypeOrNull<AnalysisResult>;
    analysisStatus: AnalysisStatus;
    analysisError: TypeOrNull<string>;
    highlightedNodeIds: string[];

    setGraphToAnalyze: (graph: TypeOrNull<ArchitectureGraph>) => void;
    setAnalysisResult: (result: TypeOrNull<AnalysisResult>) => void;
    setAnalysisStatus: (status: AnalysisStatus) => void;
    setAnalysisError: (error: TypeOrNull<string>) => void;
    setHighlightedNodeIds: (nodeIds: string[]) => void;
    clearHighlight: () => void;
    runAnalysis: (graph: ArchitectureGraph) => Promise<void>;
    restoreLastAnalysis: () => void;
    clearAnalysis: () => void;
};
