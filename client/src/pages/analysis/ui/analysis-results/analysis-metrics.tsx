import {
    Box,
    Cable,
    ChevronRight,
    Cpu,
    Database,
    Gauge,
    Layers,
    type LucideIcon,
    Monitor,
    ServerCrash,
    TriangleAlert,
    Zap,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import type { AnalysisResult } from '@/shared/model/types';

import {
    complexityLevel,
    LEVEL_DOT,
    LEVEL_STYLES,
    loadLevel,
} from './analysis-results-constants';
import { METRIC_META } from './metric-meta';

type MetricLevel = 'good' | 'moderate' | 'bad' | 'neutral';

type MetricDef = {
    key: string;
    label: string;
    icon: LucideIcon;
    getValue: (metrics: AnalysisResult['metrics']) => string;
    level?: (metrics: AnalysisResult['metrics']) => MetricLevel;
};

const CATEGORIES: {
    id: string;
    title: string;
    metrics: MetricDef[];
}[] = [
    {
        id: 'structural',
        title: 'Structural',
        metrics: [
            {
                key: 'totalNodes',
                label: 'Узлов',
                icon: Box,
                getValue: (metrics) => metrics.totalNodes.toString(),
            },
            {
                key: 'totalEdges',
                label: 'Связей',
                icon: Cable,
                getValue: (metrics) => metrics.totalEdges.toString(),
            },
            {
                key: 'density',
                label: 'Density',
                icon: Layers,
                getValue: (metrics) => (metrics.density ?? 0).toFixed(3),
            },
            {
                key: 'depth',
                label: 'Depth',
                icon: Cable,
                getValue: (metrics) => (metrics.depth ?? 0).toString(),
                level: (metrics) =>
                    (metrics.depth ?? 0) <= 5
                        ? 'good'
                        : (metrics.depth ?? 0) <= 8
                          ? 'moderate'
                          : 'bad',
            },
            {
                key: 'cycleCount',
                label: 'Циклов',
                icon: Zap,
                getValue: (metrics) => (metrics.cycleCount ?? 0).toString(),
                level: (metrics) =>
                    (metrics.cycleCount ?? 0) === 0 ? 'good' : 'bad',
            },
        ],
    },
    {
        id: 'coupling',
        title: 'Coupling',
        metrics: [
            {
                key: 'maxFanOut',
                label: 'Макс. fan-out',
                icon: Cpu,
                getValue: (metrics) => (metrics.maxFanOut ?? 0).toString(),
                level: (metrics) =>
                    (metrics.maxFanOut ?? 0) <= 3
                        ? 'good'
                        : (metrics.maxFanOut ?? 0) <= 6
                          ? 'moderate'
                          : 'bad',
            },
            {
                key: 'avgFanOut',
                label: 'Avg fan-out',
                icon: Cpu,
                getValue: (metrics) => (metrics.avgFanOut ?? 0).toFixed(2),
            },
        ],
    },
    {
        id: 'complexity',
        title: 'Complexity',
        metrics: [
            {
                key: 'frontendComplexity',
                label: 'Frontend',
                icon: Monitor,
                getValue: (metrics) => metrics.frontendComplexity.toFixed(1),
                level: (metrics) => complexityLevel(metrics.frontendComplexity),
            },
            {
                key: 'backendComplexity',
                label: 'Backend',
                icon: Cpu,
                getValue: (metrics) => metrics.backendComplexity.toFixed(1),
                level: (metrics) => complexityLevel(metrics.backendComplexity),
            },
        ],
    },
    {
        id: 'performance',
        title: 'Performance',
        metrics: [
            {
                key: 'estimatedApiLoad',
                label: 'API load',
                icon: Gauge,
                getValue: (metrics) => metrics.estimatedApiLoad.toFixed(1),
                level: (metrics) => loadLevel(metrics.estimatedApiLoad),
            },
            {
                key: 'estimatedRenderPressure',
                label: 'Render pressure',
                icon: ServerCrash,
                getValue: (metrics) =>
                    metrics.estimatedRenderPressure.toFixed(1),
                level: (metrics) =>
                    loadLevel(metrics.estimatedRenderPressure, 30, 80),
            },
            {
                key: 'estimatedDataLoad',
                label: 'Data load',
                icon: Database,
                getValue: (metrics) => metrics.estimatedDataLoad.toFixed(1),
                level: (metrics) =>
                    loadLevel(metrics.estimatedDataLoad, 40, 90),
            },
        ],
    },
    {
        id: 'reliability',
        title: 'Reliability',
        metrics: [
            {
                key: 'criticalNodesCount',
                label: 'Критичных узлов',
                icon: TriangleAlert,
                getValue: (metrics) => metrics.criticalNodesCount.toString(),
                level: (metrics) =>
                    metrics.criticalNodesCount === 0
                        ? 'good'
                        : metrics.criticalNodesCount <= 2
                          ? 'moderate'
                          : 'bad',
            },
        ],
    },
    {
        id: 'maintainability',
        title: 'Maintainability',
        metrics: [
            {
                key: 'stateStoreCount',
                label: 'State stores',
                icon: Layers,
                getValue: (metrics) =>
                    (metrics.stateStoreCount ?? 0).toString(),
            },
            {
                key: 'eventDrivenEdgesCount',
                label: 'Событийные связи',
                icon: Zap,
                getValue: (metrics) =>
                    (metrics.eventDrivenEdgesCount ?? 0).toString(),
            },
        ],
    },
    {
        id: 'edgeTypes',
        title: 'Типы связей',
        metrics: [
            {
                key: 'callsCount',
                label: 'calls (API)',
                icon: Cable,
                getValue: (metrics) => (metrics.callsCount ?? 0).toString(),
            },
            {
                key: 'readsCount',
                label: 'reads',
                icon: Database,
                getValue: (metrics) => (metrics.readsCount ?? 0).toString(),
            },
            {
                key: 'writesCount',
                label: 'writes',
                icon: Database,
                getValue: (metrics) => (metrics.writesCount ?? 0).toString(),
            },
            {
                key: 'subscribesCount',
                label: 'subscribes',
                icon: Zap,
                getValue: (metrics) =>
                    (metrics.subscribesCount ?? 0).toString(),
            },
            {
                key: 'emitsCount',
                label: 'emits',
                icon: Zap,
                getValue: (metrics) => (metrics.emitsCount ?? 0).toString(),
            },
            {
                key: 'dependsOnCount',
                label: 'depends_on',
                icon: Layers,
                getValue: (metrics) => (metrics.dependsOnCount ?? 0).toString(),
            },
        ],
    },
];

const MetricCard = ({
    label,
    value,
    icon: Icon,
    level = 'neutral',
    meta,
}: {
    label: string;
    value: string;
    icon: LucideIcon;
    level?: MetricLevel;
    meta?: { formula: string; meaning: string; action: string };
}) => (
    <div className={cn('rounded-lg border p-3', LEVEL_STYLES[level])}>
        <div className="flex items-center gap-3">
            <Icon className="size-4 flex-shrink-0 opacity-60" />
            <div className="min-w-0 flex-1">
                <p className="text-xs opacity-70">{label}</p>
                <div className="flex items-center gap-1.5">
                    <span
                        className={cn(
                            'size-1.5 rounded-full',
                            LEVEL_DOT[level],
                        )}
                    />
                    <p className="text-sm font-semibold tabular-nums">
                        {value}
                    </p>
                </div>
            </div>
        </div>
        {meta && (
            <details className="group mt-3 border-t border-border/50 pt-2">
                <summary className="flex cursor-pointer list-none items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <ChevronRight className="size-3 transition-transform group-open:rotate-90" />
                    Подробнее
                </summary>
                <div className="mt-2 space-y-2 text-xs">
                    <div>
                        <span className="font-medium text-muted-foreground">
                            Формула:
                        </span>{' '}
                        <code className="rounded bg-muted px-1 py-0.5 font-mono">
                            {meta.formula}
                        </code>
                    </div>
                    <div>
                        <span className="font-medium text-muted-foreground">
                            Что значит:
                        </span>{' '}
                        {meta.meaning}
                    </div>
                    <div>
                        <span className="font-medium text-muted-foreground">
                            Что делать:
                        </span>{' '}
                        {meta.action}
                    </div>
                </div>
            </details>
        )}
    </div>
);

type AnalysisMetricsProps = {
    metrics: AnalysisResult['metrics'];
};

export const AnalysisMetrics = ({ metrics }: AnalysisMetricsProps) => {
    return (
        <section className="rounded-lg border bg-card p-5">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Метрики
            </h2>
            <div className="space-y-6">
                {CATEGORIES.map((cat) => (
                    <div key={cat.id}>
                        <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {cat.title}
                        </h3>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {cat.metrics.map((def) => (
                                <MetricCard
                                    key={def.key}
                                    label={def.label}
                                    value={def.getValue(metrics)}
                                    icon={def.icon}
                                    level={def.level?.(metrics) ?? 'neutral'}
                                    meta={METRIC_META[def.key]}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
