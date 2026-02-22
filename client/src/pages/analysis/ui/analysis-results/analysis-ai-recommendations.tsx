import { Sparkles } from 'lucide-react';

type AnalysisAiRecommendationsProps = {
    recommendations: string[];
};

export const AnalysisAiRecommendations = ({
    recommendations,
}: AnalysisAiRecommendationsProps) => {
    return (
        <section className="rounded-lg border border-dashed bg-muted/20 p-5">
            <h2 className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-wide">
                <Sparkles className="size-4" />
                AI-рекомендации
            </h2>
            {recommendations.length > 0 ? (
                <ul className="space-y-1 text-sm">
                    {recommendations.map((recommendation) => (
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
    );
};
