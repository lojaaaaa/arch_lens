import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import type {
    AnalysisResult,
    IssueCategory,
    IssueSeverity,
} from '@/shared/model/types';

import {
    ALL_CATEGORIES,
    ALL_SEVERITIES,
    CATEGORY_LABELS,
    SEVERITY_BADGE,
    SEVERITY_LABELS,
    SEVERITY_ORDER,
    SEVERITY_STYLES,
} from './analysis-results-constants';

type AnalysisIssuesProps = {
    issues: AnalysisResult['issues'];
    onIssueClick: (affectedNodes: string[]) => void;
};

const FilterChip = ({
    label,
    active,
    onClick,
    count,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    count?: number;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
            active
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-accent/40',
        )}
    >
        {label}
        {count !== undefined && (
            <span className="text-[10px] opacity-70">{count}</span>
        )}
    </button>
);

export const AnalysisIssues = ({
    issues,
    onIssueClick,
}: AnalysisIssuesProps) => {
    const [severityFilter, setSeverityFilter] = useState<IssueSeverity | null>(
        null,
    );
    const [categoryFilter, setCategoryFilter] = useState<IssueCategory | null>(
        null,
    );

    const severityCounts = issues.reduce(
        (acc, issue) => {
            acc[issue.severity] += 1;
            return acc;
        },
        { critical: 0, warning: 0, info: 0 } as Record<IssueSeverity, number>,
    );

    const presentCategories = ALL_CATEGORIES.filter((category) =>
        issues.some((issue) => issue.category === category),
    );

    const filteredIssues = issues
        .filter((issue) =>
            severityFilter ? issue.severity === severityFilter : true,
        )
        .filter((issue) =>
            categoryFilter ? issue.category === categoryFilter : true,
        )
        .sort(
            (issueA, issueB) =>
                SEVERITY_ORDER[issueA.severity] -
                SEVERITY_ORDER[issueB.severity],
        );

    const toggleSeverity = (severity: IssueSeverity) => {
        setSeverityFilter((current) =>
            current === severity ? null : severity,
        );
    };

    const toggleCategory = (category: IssueCategory) => {
        setCategoryFilter((current) =>
            current === category ? null : category,
        );
    };

    if (issues.length === 0) {
        return null;
    }

    return (
        <section className="rounded-lg border bg-card p-5">
            <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Замечания
                        </h2>
                        <span className="text-muted-foreground text-xs tabular-nums">
                            {filteredIssues.length} из {issues.length}
                        </span>
                    </div>
                    {severityCounts.critical > 0 && (
                        <p className="text-foreground/80 text-xs">
                            Сначала исправьте критические (
                            {severityCounts.critical})
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {ALL_SEVERITIES.map((severity) => (
                        <FilterChip
                            key={severity}
                            label={SEVERITY_LABELS[severity]}
                            active={severityFilter === severity}
                            onClick={() => toggleSeverity(severity)}
                            count={severityCounts[severity]}
                        />
                    ))}

                    {presentCategories.length > 1 && (
                        <>
                            <span className="mx-1 self-center text-border">
                                |
                            </span>
                            {presentCategories.map((category) => (
                                <FilterChip
                                    key={category}
                                    label={CATEGORY_LABELS[category]}
                                    active={categoryFilter === category}
                                    onClick={() => toggleCategory(category)}
                                />
                            ))}
                        </>
                    )}
                </div>
            </div>

            {filteredIssues.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-sm">
                    Нет замечаний по выбранным фильтрам
                </p>
            ) : (
                <ul className="space-y-2">
                    {filteredIssues.map((issue, index) => {
                        const hasNodes = issue.affectedNodes.length > 0;
                        const isHighPriority = issue.severity === 'critical';
                        return (
                            <li
                                key={issue.id}
                                role={hasNodes ? 'button' : undefined}
                                tabIndex={hasNodes ? 0 : undefined}
                                onClick={() =>
                                    onIssueClick(issue.affectedNodes)
                                }
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Enter' ||
                                        event.key === ' '
                                    ) {
                                        onIssueClick(issue.affectedNodes);
                                    }
                                }}
                                className={cn(
                                    'rounded-r border-l-4 p-3 transition-colors',
                                    SEVERITY_STYLES[issue.severity],
                                    hasNodes &&
                                        'cursor-pointer hover:bg-accent/40',
                                )}
                            >
                                <div className="flex items-start gap-2">
                                    <span
                                        className={cn(
                                            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums',
                                            isHighPriority
                                                ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                                                : 'bg-muted/60 text-muted-foreground',
                                        )}
                                        title={
                                            index === 0 && isHighPriority
                                                ? 'Исправьте в первую очередь'
                                                : undefined
                                        }
                                    >
                                        {index + 1}
                                    </span>
                                    <span
                                        className={cn(
                                            'mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium leading-none',
                                            SEVERITY_BADGE[issue.severity],
                                        )}
                                    >
                                        {SEVERITY_LABELS[issue.severity]}
                                        {CATEGORY_LABELS[issue.category] && (
                                            <>
                                                {' · '}
                                                {
                                                    CATEGORY_LABELS[
                                                        issue.category
                                                    ]
                                                }
                                            </>
                                        )}
                                    </span>
                                    <div className="min-w-0 flex-1 overflow-hidden">
                                        <p className="break-words text-sm font-medium">
                                            {issue.title}
                                        </p>
                                        <p className="text-muted-foreground mt-0.5 break-words text-xs">
                                            {issue.description}
                                        </p>
                                        {issue.recommendation && (
                                            <p className="mt-1.5 text-xs text-green-700 dark:text-green-400">
                                                {issue.recommendation}
                                            </p>
                                        )}
                                        {hasNodes && (
                                            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-[10px]">
                                                <ArrowLeft className="size-2.5" />
                                                Нажмите, чтобы перейти к узлам
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
};
