import type { AnalysisResult } from '@/shared/model/types';

type AnalysisResultsFooterProps = {
    result: AnalysisResult;
};

export const AnalysisResultsFooter = ({
    result,
}: AnalysisResultsFooterProps) => {
    return (
        <p className="text-muted-foreground text-xs">
            {result.generatedAt} &middot; модель v{result.modelVersion}
            {' · '}
            правила v{result.rulesVersion}
        </p>
    );
};
