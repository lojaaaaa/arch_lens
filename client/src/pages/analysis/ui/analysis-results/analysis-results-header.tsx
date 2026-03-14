import { AnalysisTopBar } from '../analysis-page/analysis-top-bar';

type AnalysisResultsHeaderProps = {
    onBack: () => void;
    onExportPdf?: () => void;
    exporting?: boolean;
};

export const AnalysisResultsHeader = ({
    onBack,
    onExportPdf,
    exporting,
}: AnalysisResultsHeaderProps) => (
    <AnalysisTopBar
        title="Результаты анализа"
        onBack={onBack}
        backLabel="Назад к редактору"
        onExportPdf={onExportPdf}
        exporting={exporting}
    />
);
