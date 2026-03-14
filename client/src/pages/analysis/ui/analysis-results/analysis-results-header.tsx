import { AnalysisTopBar } from '../analysis-page/analysis-top-bar';

type AnalysisResultsHeaderProps = {
    onBack: () => void;
};

export const AnalysisResultsHeader = ({
    onBack,
}: AnalysisResultsHeaderProps) => (
    <AnalysisTopBar
        title="Результаты анализа"
        onBack={onBack}
        backLabel="Назад к редактору"
    />
);
