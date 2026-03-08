import {
    Box,
    Cable,
    Cpu,
    Database,
    Gauge,
    Info,
    Layers,
    type LucideIcon,
    Monitor,
    ServerCrash,
    TriangleAlert,
    Zap,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import type { AnalysisResult } from '@/shared/model/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import {
    complexityLevel,
    LEVEL_DOT,
    LEVEL_STYLES,
    loadLevel,
} from './analysis-results-constants';

type MetricLevel = 'good' | 'moderate' | 'bad' | 'neutral';

const METRIC_TOOLTIPS: Record<string, string> = {
    totalNodes:
        'Количество узлов в схеме. Каждый узел — компонент, сервис, БД и т.п.',
    totalEdges:
        'Количество связей между узлами (calls, reads, writes, subscribes, emits, depends_on).',
    frontendComplexity:
        'Сумма complexity всех frontend-узлов (1–5 на узел). Σ complexity(ui_page, ui_component, state_store).',
    backendComplexity:
        'Сумма complexity backend и data узлов. Σ complexity(api_gateway, service, database, cache, external_system).',
    criticalNodesCount:
        'Узлы с criticality ≥ 2 (важные и ключевые). Высокое значение — много точек отказа.',
    estimatedApiLoad:
        'Число связей calls + reads. Показывает объём обращений к API.',
    estimatedRenderPressure:
        'frontendComplexity × (stateStoreCount || 1). Высокое значение при сложном frontend и многих хранилищах состояния.',
    estimatedDataLoad:
        'Число связей reads + writes. Объём обращений к БД и кэшу.',
    stateStoreCount:
        'Количество хранилищ состояния (state_store). Входит в формулу нагрузки рендеринга.',
    maxFanOut:
        'Максимум исходящих связей у одного узла. Высокое значение — «божественный» узел.',
    eventDrivenEdgesCount:
        'Связи subscribes + emits. Показывает степень событийной архитектуры.',
};

const MetricCard = ({
    label,
    value,
    icon: Icon,
    level = 'neutral',
    tooltip,
}: {
    label: string;
    value: string;
    icon: LucideIcon;
    level?: MetricLevel;
    tooltip?: string;
}) => (
    <div
        className={cn(
            'flex items-center gap-3 rounded-lg border p-3',
            LEVEL_STYLES[level],
        )}
    >
        <Icon className="size-4 flex-shrink-0 opacity-60" />
        <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
                <p className="text-xs opacity-70">{label}</p>
                {tooltip && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="text-muted-foreground size-3 cursor-help opacity-60 hover:opacity-100" />
                        </TooltipTrigger>
                        <TooltipContent
                            side="top"
                            className="max-w-64 text-balance"
                        >
                            {tooltip}
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
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
                    tooltip={METRIC_TOOLTIPS.totalNodes}
                />
                <MetricCard
                    label="Связей"
                    value={metrics.totalEdges.toString()}
                    icon={Cable}
                    tooltip={METRIC_TOOLTIPS.totalEdges}
                />
                <MetricCard
                    label="Сложность frontend"
                    value={metrics.frontendComplexity.toFixed(1)}
                    icon={Monitor}
                    level={complexityLevel(metrics.frontendComplexity)}
                    tooltip={METRIC_TOOLTIPS.frontendComplexity}
                />
                <MetricCard
                    label="Сложность backend"
                    value={metrics.backendComplexity.toFixed(1)}
                    icon={Cpu}
                    level={complexityLevel(metrics.backendComplexity)}
                    tooltip={METRIC_TOOLTIPS.backendComplexity}
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
                    tooltip={METRIC_TOOLTIPS.criticalNodesCount}
                />
                <MetricCard
                    label="Нагрузка на API"
                    value={metrics.estimatedApiLoad.toFixed(1)}
                    icon={Gauge}
                    level={loadLevel(metrics.estimatedApiLoad)}
                    tooltip={METRIC_TOOLTIPS.estimatedApiLoad}
                />
                <MetricCard
                    label="Нагрузка рендеринга"
                    value={metrics.estimatedRenderPressure.toFixed(1)}
                    icon={ServerCrash}
                    level={loadLevel(metrics.estimatedRenderPressure, 30, 80)}
                    tooltip={METRIC_TOOLTIPS.estimatedRenderPressure}
                />
                <MetricCard
                    label="Нагрузка на данные"
                    value={metrics.estimatedDataLoad.toFixed(1)}
                    icon={Database}
                    level={loadLevel(metrics.estimatedDataLoad, 40, 90)}
                    tooltip={METRIC_TOOLTIPS.estimatedDataLoad}
                />
                <MetricCard
                    label="State stores"
                    value={(metrics.stateStoreCount ?? 0).toString()}
                    icon={Layers}
                    tooltip={METRIC_TOOLTIPS.stateStoreCount}
                />
                <MetricCard
                    label="Макс. fan-out"
                    value={(metrics.maxFanOut ?? 0).toString()}
                    icon={Cpu}
                    level={
                        (metrics.maxFanOut ?? 0) <= 3
                            ? 'good'
                            : (metrics.maxFanOut ?? 0) <= 6
                              ? 'moderate'
                              : 'bad'
                    }
                    tooltip={METRIC_TOOLTIPS.maxFanOut}
                />
                <MetricCard
                    label="Событийные связи"
                    value={(metrics.eventDrivenEdgesCount ?? 0).toString()}
                    icon={Zap}
                    tooltip={METRIC_TOOLTIPS.eventDrivenEdgesCount}
                />
            </div>
        </section>
    );
};
