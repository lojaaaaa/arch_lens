import { cn } from '@/shared/lib/utils';
import type { AnalysisResult } from '@/shared/model/types';
import { Button } from '@/shared/ui/button';

const SEVERITY_STYLES: Record<
    AnalysisResult['issues'][number]['severity'],
    string
> = {
    info: 'border-l-blue-500 bg-blue-500/5',
    warning: 'border-l-amber-500 bg-amber-500/5',
    critical: 'border-l-red-500 bg-red-500/5',
};

const SEVERITY_LABELS: Record<
    AnalysisResult['issues'][number]['severity'],
    string
> = {
    info: 'Информация',
    warning: 'Предупреждение',
    critical: 'Критично',
};

type AnalysisResultsProps = {
    result: AnalysisResult;
    onBack: () => void;
};

const MetricItem = ({ label, value }: { label: string; value: string }) => {
    return (
        <div>
            <dt className="text-muted-foreground text-sm">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    );
};

export const AnalysisResults = ({ result, onBack }: AnalysisResultsProps) => {
    const { summary, metrics, issues } = result;

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Результаты анализа</h1>
                <Button variant="outline" onClick={onBack}>
                    Назад к редактору
                </Button>
            </div>

            <section className="rounded-lg border bg-card p-4">
                <h2 className="mb-4 text-lg font-medium">Сводка</h2>
                <div className="flex flex-wrap gap-6">
                    <div>
                        <span className="text-muted-foreground text-sm">
                            Оценка
                        </span>
                        <p className="text-2xl font-bold">
                            {summary.score}/100
                        </p>
                    </div>
                    <div>
                        <span className="text-muted-foreground text-sm">
                            Всего замечаний
                        </span>
                        <p className="text-2xl font-bold">
                            {summary.issuesCount}
                        </p>
                    </div>
                    <div>
                        <span className="text-muted-foreground text-sm">
                            Критичных
                        </span>
                        <p className="text-2xl font-bold text-red-600">
                            {summary.criticalIssuesCount}
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-lg border bg-card p-4">
                <h2 className="mb-4 text-lg font-medium">Метрики</h2>
                <dl className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
                    <MetricItem
                        label="Узлов"
                        value={metrics.totalNodes.toString()}
                    />
                    <MetricItem
                        label="Связей"
                        value={metrics.totalEdges.toString()}
                    />
                    <MetricItem
                        label="Сложность frontend"
                        value={metrics.frontendComplexity.toFixed(1)}
                    />
                    <MetricItem
                        label="Сложность backend"
                        value={metrics.backendComplexity.toFixed(1)}
                    />
                    <MetricItem
                        label="Критичных узлов"
                        value={metrics.criticalNodesCount.toString()}
                    />
                    <MetricItem
                        label="Нагрузка на API"
                        value={metrics.estimatedApiLoad.toFixed(1)}
                    />
                </dl>
            </section>

            {issues.length > 0 && (
                <section className="rounded-lg border bg-card p-4">
                    <h2 className="mb-4 text-lg font-medium">Замечания</h2>
                    <ul className="space-y-3">
                        {issues.map((issue) => (
                            <li
                                key={issue.id}
                                className={cn(
                                    'rounded-r border-l-4 p-3',
                                    SEVERITY_STYLES[issue.severity],
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <span className="text-muted-foreground mr-2 text-xs font-medium uppercase">
                                            {SEVERITY_LABELS[issue.severity]} ·{' '}
                                            {issue.category}
                                        </span>
                                        <p className="font-medium">
                                            {issue.title}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            {issue.description}
                                        </p>
                                        {issue.recommendation && (
                                            <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                                                Рекомендация:{' '}
                                                {issue.recommendation}
                                            </p>
                                        )}
                                        {issue.affectedNodes.length > 0 && (
                                            <p className="text-muted-foreground mt-1 text-xs">
                                                Узлы:{' '}
                                                {issue.affectedNodes.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <p className="text-muted-foreground text-xs">
                Сгенерировано: {result.generatedAt} (модель v
                {result.modelVersion})
            </p>
        </div>
    );
};
