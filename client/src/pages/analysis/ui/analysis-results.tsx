import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight } from 'lucide-react';
import {
    ArrowLeft,
    Box,
    Cable,
    Cpu,
    Database,
    Gauge,
    type LucideIcon,
    Monitor,
    ServerCrash,
    Sparkles,
    TriangleAlert,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Routes } from '@/shared/model/routes';
import type {
    AnalysisResult,
    ArchitectureIssue,
    Grade,
    IssueCategory,
    IssueSeverity,
} from '@/shared/model/types';
import { Button } from '@/shared/ui/button';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

import { useAnalysisActions } from '../model/selectors';

const GRADE_STYLES: Record<Grade, string> = {
    A: 'text-green-600 border-green-200 bg-green-50/50 dark:text-green-400 dark:border-green-700 dark:bg-green-950/40',
    B: 'text-green-600 border-green-200 bg-green-50/50 dark:text-green-400 dark:border-green-700 dark:bg-green-950/40',
    C: 'text-amber-600 border-amber-200 bg-amber-50/50 dark:text-amber-400 dark:border-amber-700 dark:bg-amber-950/40',
    D: 'text-red-500 border-red-200 bg-red-50/50 dark:text-red-400 dark:border-red-700 dark:bg-red-950/40',
    F: 'text-red-600 border-red-300 bg-red-50/50 dark:text-red-400 dark:border-red-800 dark:bg-red-950/40',
};

const SCORE_COLOR = (score: number) => {
    if (score >= 75) {
        return 'text-green-600 dark:text-green-400';
    }
    if (score >= 40) {
        return 'text-amber-600 dark:text-amber-400';
    }
    return 'text-red-600 dark:text-red-400';
};

const SEVERITY_ORDER: Record<IssueSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
};

const SEVERITY_STYLES: Record<IssueSeverity, string> = {
    info: [
        'border-l-blue-400',
        'bg-blue-50/30',
        'dark:border-l-blue-500',
        'dark:bg-blue-950/30',
    ].join(' '),
    warning: [
        'border-l-amber-400',
        'bg-amber-50/30',
        'dark:border-l-amber-500',
        'dark:bg-amber-950/30',
    ].join(' '),
    critical: [
        'border-l-red-400',
        'bg-red-50/30',
        'dark:border-l-red-500',
        'dark:bg-red-950/30',
    ].join(' '),
};

const SEVERITY_BADGE: Record<IssueSeverity, string> = {
    info: [
        'bg-blue-100',
        'text-blue-700',
        'dark:bg-blue-900/50',
        'dark:text-blue-300',
    ].join(' '),
    warning: [
        'bg-amber-100',
        'text-amber-700',
        'dark:bg-amber-900/50',
        'dark:text-amber-300',
    ].join(' '),
    critical: [
        'bg-red-100',
        'text-red-700',
        'dark:bg-red-900/50',
        'dark:text-red-300',
    ].join(' '),
};

const SEVERITY_LABELS: Record<IssueSeverity, string> = {
    info: 'Инфо',
    warning: 'Внимание',
    critical: 'Критично',
};

const CATEGORY_LABELS: Record<IssueCategory, string> = {
    performance: 'Производительность',
    scalability: 'Масштабируемость',
    maintainability: 'Поддерживаемость',
    architecture: 'Архитектура',
    reliability: 'Надёжность',
    security: 'Безопасность',
};

const ALL_SEVERITIES: IssueSeverity[] = ['critical', 'warning', 'info'];
const ALL_CATEGORIES: IssueCategory[] = [
    'architecture',
    'performance',
    'scalability',
    'maintainability',
    'reliability',
    'security',
];

type AnalysisResultsProps = {
    result: AnalysisResult;
    onBack: () => void;
};

type MetricLevel = 'good' | 'moderate' | 'bad' | 'neutral';

const LEVEL_STYLES: Record<MetricLevel, string> = {
    good: [
        'text-green-600',
        'bg-green-50/50',
        'dark:text-green-400',
        'dark:bg-green-950/40',
    ].join(' '),
    moderate: [
        'text-amber-600',
        'bg-amber-50/50',
        'dark:text-amber-400',
        'dark:bg-amber-950/40',
    ].join(' '),
    bad: [
        'text-red-600',
        'bg-red-50/50',
        'dark:text-red-400',
        'dark:bg-red-950/40',
    ].join(' '),
    neutral: ['text-foreground', 'bg-muted/30', 'dark:bg-muted/50'].join(' '),
};

const LEVEL_DOT: Record<MetricLevel, string> = {
    good: 'bg-green-500 dark:bg-green-400',
    moderate: 'bg-amber-500 dark:bg-amber-400',
    bad: 'bg-red-500 dark:bg-red-400',
    neutral: 'bg-muted-foreground dark:bg-foreground/80',
};

const MetricCard = ({
    label,
    value,
    icon: Icon,
    level = 'neutral',
}: {
    label: string;
    value: string;
    icon: LucideIcon;
    level?: MetricLevel;
}) => (
    <div
        className={cn(
            'flex items-center gap-3 rounded-lg border p-3',
            LEVEL_STYLES[level],
        )}
    >
        <Icon className="size-4 flex-shrink-0 opacity-60" />
        <div className="min-w-0 flex-1">
            <p className="text-xs opacity-70">{label}</p>
            <div className="flex items-center gap-1.5">
                <span
                    className={cn('size-1.5 rounded-full', LEVEL_DOT[level])}
                />
                <p className="text-sm font-semibold tabular-nums">{value}</p>
            </div>
        </div>
    </div>
);

const loadLevel = (value: number, moderate = 50, bad = 100): MetricLevel => {
    if (value < moderate) {
        return 'good';
    }
    if (value < bad) {
        return 'moderate';
    }
    return 'bad';
};

const complexityLevel = (value: number): MetricLevel => {
    if (value < 3) {
        return 'good';
    }
    if (value < 6) {
        return 'moderate';
    }
    return 'bad';
};

const SeverityBadge = ({
    severity,
    count,
}: {
    severity: IssueSeverity;
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

export const AnalysisResults = ({ result, onBack }: AnalysisResultsProps) => {
    const navigate = useNavigate();
    const { setHighlightedNodeIds } = useAnalysisActions();
    const { summary, metrics, issues } = result;
    const aiRecommendations = result.aiRecommendations ?? [];

    const [severityFilter, setSeverityFilter] = useState<IssueSeverity | null>(
        null,
    );
    const [categoryFilter, setCategoryFilter] = useState<IssueCategory | null>(
        null,
    );

    const handleIssueClick = (affectedNodes: string[]) => {
        if (affectedNodes.length === 0) {
            return;
        }
        setHighlightedNodeIds(affectedNodes);
        navigate(Routes.editor);
    };

    const severityCounts = useMemo(() => {
        const counts: Record<IssueSeverity, number> = {
            critical: 0,
            warning: 0,
            info: 0,
        };
        for (const issue of issues) {
            counts[issue.severity]++;
        }
        return counts;
    }, [issues]);

    const presentCategories = useMemo(() => {
        const set = new Set<IssueCategory>();
        for (const issue of issues) {
            set.add(issue.category);
        }
        return ALL_CATEGORIES.filter((category) => set.has(category));
    }, [issues]);

    const filteredIssues = useMemo(() => {
        let filtered: ArchitectureIssue[] = [...issues];
        if (severityFilter) {
            filtered = filtered.filter(
                (issue) => issue.severity === severityFilter,
            );
        }
        if (categoryFilter) {
            filtered = filtered.filter(
                (issue) => issue.category === categoryFilter,
            );
        }
        filtered.sort(
            (issueA, issueB) =>
                SEVERITY_ORDER[issueA.severity] -
                SEVERITY_ORDER[issueB.severity],
        );
        return filtered;
    }, [issues, severityFilter, categoryFilter]);

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

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-6">
            <nav className="flex items-center gap-1 text-xs text-muted-foreground">
                <button
                    type="button"
                    onClick={onBack}
                    className="hover:text-foreground transition-colors"
                >
                    Редактор
                </button>
                <ChevronRight className="size-3" />
                <span>Анализ</span>
            </nav>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-lg font-semibold sm:text-xl">
                    Результаты анализа
                </h1>
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <Button variant="outline" size="sm" onClick={onBack}>
                        Назад к редактору
                    </Button>
                </div>
            </div>

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

            <section className="rounded-lg border bg-card p-5">
                <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Метрики
                </h2>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        label="Узлов"
                        value={metrics.totalNodes.toString()}
                        icon={Box}
                    />
                    <MetricCard
                        label="Связей"
                        value={metrics.totalEdges.toString()}
                        icon={Cable}
                    />
                    <MetricCard
                        label="Сложность frontend"
                        value={metrics.frontendComplexity.toFixed(1)}
                        icon={Monitor}
                        level={complexityLevel(metrics.frontendComplexity)}
                    />
                    <MetricCard
                        label="Сложность backend"
                        value={metrics.backendComplexity.toFixed(1)}
                        icon={Cpu}
                        level={complexityLevel(metrics.backendComplexity)}
                    />
                    <MetricCard
                        label="Критичных узлов"
                        value={metrics.criticalNodesCount.toString()}
                        icon={TriangleAlert}
                        level={
                            metrics.criticalNodesCount === 0
                                ? 'good'
                                : metrics.criticalNodesCount <= 2
                                  ? 'moderate'
                                  : 'bad'
                        }
                    />
                    <MetricCard
                        label="Нагрузка на API"
                        value={metrics.estimatedApiLoad.toFixed(1)}
                        icon={Gauge}
                        level={loadLevel(metrics.estimatedApiLoad)}
                    />
                    <MetricCard
                        label="Нагрузка рендеринга"
                        value={metrics.estimatedRenderPressure.toFixed(1)}
                        icon={ServerCrash}
                        level={loadLevel(
                            metrics.estimatedRenderPressure,
                            30,
                            80,
                        )}
                    />
                    <MetricCard
                        label="Нагрузка на данные"
                        value={metrics.estimatedDataLoad.toFixed(1)}
                        icon={Database}
                        level={loadLevel(metrics.estimatedDataLoad, 40, 90)}
                    />
                </div>
            </section>

            {issues.length > 0 && (
                <section className="rounded-lg border bg-card p-5">
                    <div className="mb-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                Замечания
                            </h2>
                            <span className="text-muted-foreground text-xs tabular-nums">
                                {filteredIssues.length} из {issues.length}
                            </span>
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
                                            onClick={() =>
                                                toggleCategory(category)
                                            }
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
                            {filteredIssues.map((issue) => {
                                const hasNodes = issue.affectedNodes.length > 0;
                                return (
                                    <li
                                        key={issue.id}
                                        role={hasNodes ? 'button' : undefined}
                                        tabIndex={hasNodes ? 0 : undefined}
                                        onClick={() =>
                                            handleIssueClick(
                                                issue.affectedNodes,
                                            )
                                        }
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === 'Enter' ||
                                                event.key === ' '
                                            ) {
                                                handleIssueClick(
                                                    issue.affectedNodes,
                                                );
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
                                                    'mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium leading-none',
                                                    SEVERITY_BADGE[
                                                        issue.severity
                                                    ],
                                                )}
                                            >
                                                {CATEGORY_LABELS[
                                                    issue.category
                                                ] ?? issue.category}
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
                                                        Нажмите, чтобы перейти к
                                                        узлам
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
            )}

            <section className="rounded-lg border border-dashed bg-muted/20 p-5">
                <h2 className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-wide">
                    <Sparkles className="size-4" />
                    AI-рекомендации
                </h2>
                {aiRecommendations.length > 0 ? (
                    <ul className="space-y-1 text-sm">
                        {aiRecommendations.map((recommendation) => (
                            <li
                                key={recommendation}
                                className="text-muted-foreground"
                            >
                                {recommendation}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground text-sm">
                        Скоро будет доступно
                    </p>
                )}
            </section>

            <p className="text-muted-foreground text-xs">
                {result.generatedAt} &middot; модель v{result.modelVersion}
                {' · '}
                правила v{result.rulesVersion}
            </p>
        </div>
    );
};
