import { cn } from '@/shared/lib/utils';
import type { AnalysisResult } from '@/shared/model/types';

import {
    GRADE_STYLES,
    SCORE_COLOR,
    SEVERITY_BADGE,
    SEVERITY_LABELS,
} from './analysis-results-constants';

type AnalysisSummaryCardProps = {
    summary: AnalysisResult['summary'];
    severityCounts: Record<'critical' | 'warning' | 'info', number>;
};

const SeverityBadge = ({
    severity,
    count,
}: {
    severity: 'critical' | 'warning' | 'info';
    count: number;
}) => {
    if (count === 0) {
        return null;
    }
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                SEVERITY_BADGE[severity],
            )}
        >
            {SEVERITY_LABELS[severity]} {count}
        </span>
    );
};

export const AnalysisSummaryCard = ({
    summary,
    severityCounts,
}: AnalysisSummaryCardProps) => {
    return (
        <section className="rounded-lg border bg-card p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div
                    className={cn(
                        'flex size-20 flex-shrink-0 items-center justify-center rounded-xl border-2 text-3xl font-bold',
                        GRADE_STYLES[summary.grade],
                    )}
                >
                    {summary.grade}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-2">
                        <span
                            className={cn(
                                'text-3xl font-bold tabular-nums',
                                SCORE_COLOR(summary.score),
                            )}
                        >
                            {summary.score}
                        </span>
                        <span className="text-muted-foreground text-sm">
                            / 100
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        <SeverityBadge
                            severity="critical"
                            count={severityCounts.critical}
                        />
                        <SeverityBadge
                            severity="warning"
                            count={severityCounts.warning}
                        />
                        <SeverityBadge
                            severity="info"
                            count={severityCounts.info}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
