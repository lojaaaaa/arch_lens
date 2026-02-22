import { useNavigate } from 'react-router';

import { Routes } from '@/shared/model/routes';

import { useAnalysisStore } from '../../../analysis/model/store';
import { useEditorPersistence } from '../../lib/use-editor-persistence';
import { buildExportableGraph } from '../../lib/utils';
import { useArchitectureSelectors } from '../../model/selectors';

export const useHeaderAnalysisActions = () => {
    const navigate = useNavigate();

    const { nodes, edges } = useArchitectureSelectors();

    const { save } = useEditorPersistence();

    const setGraphToAnalyze = useAnalysisStore(
        (state) => state.setGraphToAnalyze,
    );

    const analysisStatus = useAnalysisStore((state) => state.analysisStatus);

    const isAnalyzing = analysisStatus === 'loading';
    const hasGraph = nodes.length > 0 || edges.length > 0;

    const handleAnalysisClick = () => {
        if (!hasGraph) {
            return;
        }
        save();

        const graph = buildExportableGraph(nodes, edges);

        setGraphToAnalyze(graph);

        navigate(Routes.analysis);
    };

    return {
        handleAnalysisClick,
        hasGraph,
        isAnalyzing,
    };
};
