import { ArrowLeft, Sparkles } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

import { extractNodeIds } from '../lib/extract-node-ids';

export type AiRecommendationsProps = {
    recommendations: string[];
    validNodeIds: Set<string>;
    onRecommendationClick: (nodeIds: string[]) => void;
};

export const AiRecommendations = ({
    recommendations,
    validNodeIds,
    onRecommendationClick,
}: AiRecommendationsProps) => {
    return (
        <section className="rounded-lg border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-medium uppercase tracking-wide">
                    <Sparkles className="size-4 text-amber-500/80" />
                    AI-рекомендации
                </h2>
                {recommendations.length > 0 && (
                    <span className="text-muted-foreground text-xs tabular-nums">
                        {recommendations.length}
                    </span>
                )}
            </div>

            {recommendations.length > 0 ? (
                <ol className="flex flex-col gap-2">
                    {recommendations.map((recommendation, index) => {
                        const extractedIds = extractNodeIds(recommendation);
                        const nodeIds = extractedIds.filter((id) =>
                            validNodeIds.has(id),
                        );
                        const isClickable = nodeIds.length > 0;

                        return (
                            <li
                                key={`${index}-${recommendation.slice(0, 30)}`}
                                role={isClickable ? 'button' : undefined}
                                tabIndex={isClickable ? 0 : undefined}
                                onClick={() =>
                                    isClickable &&
                                    onRecommendationClick(nodeIds)
                                }
                                onKeyDown={(event) => {
                                    if (
                                        isClickable &&
                                        (event.key === 'Enter' ||
                                            event.key === ' ')
                                    ) {
                                        event.preventDefault();
                                        onRecommendationClick(nodeIds);
                                    }
                                }}
                                className={cn(
                                    'flex items-start gap-3 rounded-lg border-l-4 border-l-amber-500/50 bg-muted/30 py-2.5 pl-3 pr-3',
                                    isClickable &&
                                        'cursor-pointer transition-colors hover:bg-muted/50',
                                )}
                            >
                                <span
                                    className={cn(
                                        'mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                                        'bg-amber-500/15 text-amber-700 dark:text-amber-400',
                                    )}
                                >
                                    {index + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm leading-relaxed text-foreground">
                                        {recommendation}
                                    </p>
                                    {isClickable && (
                                        <p className="text-muted-foreground mt-1 flex items-center gap-1 text-[10px]">
                                            <ArrowLeft className="size-2.5" />
                                            Нажмите, чтобы перейти к узлам
                                        </p>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            ) : (
                <div className="rounded-lg border border-dashed bg-muted/20 py-8">
                    <p className="text-muted-foreground text-center text-sm">
                        Скоро будет доступно
                    </p>
                </div>
            )}
        </section>
    );
};
