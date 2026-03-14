import { cn } from '@/shared/lib/utils';
import type {
    AnalysisResult,
    DeploymentModel,
    SystemNode,
} from '@/shared/model/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

const ARCHITECTURAL_STYLE_LABELS: Record<string, string> = {
    layered: 'Слоистая',
    microservices: 'Микросервисы',
    'event-driven': 'Событийная',
    'client-server': 'Клиент-сервер',
    monolith: 'Монолит',
    unknown: 'Не определён',
};

const DEPLOYMENT_LABELS: Record<DeploymentModel, string> = {
    monolith: 'Монолит',
    microservices: 'Микросервисы',
    hybrid: 'Гибрид',
};

import {
    GRADE_STYLES,
    RISK_LABELS,
    riskScoreLevel,
    SCORE_COLOR,
    SEVERITY_BADGE,
    SEVERITY_LABELS,
} from './analysis-results-constants';

type AnalysisSummaryCardProps = {
    summary: AnalysisResult['summary'];
    severityCounts: Record<'critical' | 'warning' | 'info', number>;
    systemNode: SystemNode | null;
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

const formatAvailability = (value: number) =>
    value >= 1 ? '100%' : `${(value * 100).toFixed(1)}%`;

const isDefined = <T,>(value: T | null | undefined): value is T =>
    value !== null && value !== undefined;

export const AnalysisSummaryCard = ({
    summary,
    severityCounts,
    systemNode,
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
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="text-muted-foreground cursor-help text-sm">
                                    Risk{' '}
                                    {((summary.riskScore ?? 0) * 100).toFixed(
                                        0,
                                    )}
                                    % (
                                    {
                                        RISK_LABELS[
                                            riskScoreLevel(
                                                summary.riskScore ?? 0,
                                            )
                                        ]
                                    }
                                    )
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-72">
                                Риск архитектуры: coupling, глубина, циклы,
                                SPOF, bottleneck, внешние зависимости. Выше —
                                хуже. Меняется при изменении структуры и
                                параметров узлов.
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="text-muted-foreground cursor-help text-sm">
                                    · Confidence{' '}
                                    {(
                                        (summary.confidenceScore ?? 0.5) * 100
                                    ).toFixed(0)}
                                    %
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-72">
                                Доля заполненных полей (requestRate, latencyMs,
                                reliability и т.д.). Чем больше заполнено — тем
                                надёжнее анализ. 50% = недостаточно данных.
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    {(summary.confidenceScore ?? 0.5) < 0.6 && (
                        <p className="text-amber-600 text-sm dark:text-amber-400">
                            Заполните параметры для более точного анализа
                        </p>
                    )}
                    {summary.architecturalStyle && (
                        <span className="text-muted-foreground text-xs">
                            Стиль:{' '}
                            {ARCHITECTURAL_STYLE_LABELS[
                                summary.architecturalStyle as keyof typeof ARCHITECTURAL_STYLE_LABELS
                            ] ?? summary.architecturalStyle}
                        </span>
                    )}
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
            {systemNode && (
                <div className="mt-4 border-t pt-4">
                    <h4 className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                        Системные параметры
                    </h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {!isDefined(systemNode.targetAvailability) &&
                        !isDefined(systemNode.targetThroughputRps) &&
                        !isDefined(systemNode.latencySloMs) &&
                        !isDefined(systemNode.deploymentModel) ? (
                            <span className="text-muted-foreground">
                                Не заданы
                            </span>
                        ) : (
                            <>
                                {isDefined(systemNode.targetAvailability) && (
                                    <span>
                                        Доступность:{' '}
                                        {formatAvailability(
                                            systemNode.targetAvailability,
                                        )}
                                    </span>
                                )}
                                {isDefined(systemNode.targetThroughputRps) && (
                                    <span>
                                        Пик rps:{' '}
                                        {systemNode.targetThroughputRps}
                                    </span>
                                )}
                                {isDefined(systemNode.latencySloMs) && (
                                    <span>
                                        SLO: {systemNode.latencySloMs} мс
                                    </span>
                                )}
                                {isDefined(systemNode.deploymentModel) && (
                                    <span>
                                        Модель:{' '}
                                        {
                                            DEPLOYMENT_LABELS[
                                                systemNode.deploymentModel as DeploymentModel
                                            ]
                                        }
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};
