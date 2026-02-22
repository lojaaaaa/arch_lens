import {
    Box,
    Cable,
    Cpu,
    Database,
    Gauge,
    type LucideIcon,
    Monitor,
    ServerCrash,
    TriangleAlert,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import type { AnalysisResult } from '@/shared/model/types';

import {
    complexityLevel,
    LEVEL_DOT,
    LEVEL_STYLES,
    loadLevel,
} from './analysis-results-constants';

type MetricLevel = 'good' | 'moderate' | 'bad' | 'neutral';

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

type AnalysisMetricsProps = {
    metrics: AnalysisResult['metrics'];
};

export const AnalysisMetrics = ({ metrics }: AnalysisMetricsProps) => {
    return (
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
                    level={loadLevel(metrics.estimatedRenderPressure, 30, 80)}
                />
                <MetricCard
                    label="Нагрузка на данные"
                    value={metrics.estimatedDataLoad.toFixed(1)}
                    icon={Database}
                    level={loadLevel(metrics.estimatedDataLoad, 40, 90)}
                />
            </div>
        </section>
    );
};
