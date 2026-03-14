import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import type { AnalysisResult } from '@/shared/model/types';

type AnalysisResultsFooterProps = {
    result: AnalysisResult;
};

const LIMITATIONS_TEXT =
    'ArchLens выполняет статический анализ архитектурной модели. Он не заменяет профилирование, нагрузочное тестирование или code review. Реальные latency и throughput не измеряются — используются декларированные параметры или assumptions.';

export const AnalysisResultsFooter = ({
    result,
}: AnalysisResultsFooterProps) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="space-y-2">
            <p className="text-muted-foreground text-xs">
                {result.generatedAt} &middot; модель v{result.modelVersion}
                {' · '}
                правила v{result.rulesVersion}
            </p>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="text-muted-foreground flex items-center gap-1 text-xs hover:underline"
            >
                {open ? (
                    <ChevronDown className="size-3" />
                ) : (
                    <ChevronRight className="size-3" />
                )}
                Ограничения
            </button>
            {open && (
                <p className="text-muted-foreground mt-2 text-xs">
                    {LIMITATIONS_TEXT}
                </p>
            )}
        </div>
    );
};
