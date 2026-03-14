import { ArrowLeft, Lightbulb } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import type {
    AnalysisResult,
    ArchitectureIssue,
    IssueSeverity,
} from '@/shared/model/types';

import { SEVERITY_ORDER, SEVERITY_STYLES } from './analysis-results-constants';

const TOP_N = 5;

type AnalysisTopImprovementsProps = {
    result: AnalysisResult;
    onIssueClick: (affectedNodes: string[]) => void;
};

export const AnalysisTopImprovements = ({
    result,
    onIssueClick,
}: AnalysisTopImprovementsProps) => {
    const { issues } = result;

    const topIssues = [...issues]
        .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
        .slice(0, TOP_N);

    if (topIssues.length === 0) {
        return null;
    }

    return (
        <section className="rounded-lg border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                <Lightbulb className="size-4" />
                Топ-{TOP_N} улучшений
            </h2>
            <ul className="space-y-2">
                {topIssues.map((issue: ArchitectureIssue, index: number) => {
                    const hasNodes = issue.affectedNodes.length > 0;
                    return (
                        <li
                            key={issue.id}
                            role={hasNodes ? 'button' : undefined}
                            tabIndex={hasNodes ? 0 : undefined}
                            onClick={() => onIssueClick(issue.affectedNodes)}
                            onKeyDown={(event) => {
                                if (
                                    hasNodes &&
                                    (event.key === 'Enter' || event.key === ' ')
                                ) {
                                    event.preventDefault();
                                    onIssueClick(issue.affectedNodes);
                                }
                            }}
                            className={cn(
                                'rounded-r border-l-4 p-3 transition-colors',
                                SEVERITY_STYLES[issue.severity],
                                hasNodes && 'cursor-pointer hover:bg-accent/40',
                            )}
                        >
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums',
                                            (issue.severity as IssueSeverity) ===
                                                'critical'
                                                ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                                                : 'bg-muted/60 text-muted-foreground',
                                        )}
                                    >
                                        {index + 1}
                                    </span>
                                    <p className="break-words text-sm font-medium">
                                        {issue.title}
                                    </p>
                                </div>
                                {issue.recommendation && (
                                    <p className="ml-7 text-xs text-green-700 dark:text-green-400">
                                        → {issue.recommendation}
                                    </p>
                                )}
                                {hasNodes && (
                                    <p className="text-muted-foreground ml-7 flex items-center gap-1 text-[10px]">
                                        <ArrowLeft className="size-2.5" />
                                        Узлы:{' '}
                                        {issue.affectedNodes
                                            .slice(0, 3)
                                            .join(', ')}
                                        {issue.affectedNodes.length > 3 &&
                                            ` +${issue.affectedNodes.length - 3}`}
                                        {' · '}
                                        Нажмите, чтобы перейти
                                    </p>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};
