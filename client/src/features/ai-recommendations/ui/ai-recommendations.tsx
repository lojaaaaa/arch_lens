import { Bot, Sparkles } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

export type AiRecommendationsProps = {
    recommendations: string[];
};

function renderFormattedText(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={i} className="font-semibold text-foreground">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return <span key={i}>{part}</span>;
    });
}

type ParsedBlock = {
    heading?: string;
    body?: string;
    bullets?: string[];
};

function parseBlock(text: string): ParsedBlock {
    const trimmed = text.trim();
    const headingMatch = trimmed.match(/^\*\*([^*]+)\*\*\s*\n\n/s);
    if (headingMatch) {
        const heading = headingMatch[1].trim();
        const rest = trimmed.slice(headingMatch[0].length).trim();
        const lines = rest.split('\n');
        const bulletLines = lines
            .filter((l) => /^[-•]\s/.test(l))
            .map((l) => l.replace(/^[-•]\s*/, '').trim());
        const hasBullets = bulletLines.length > 0;
        const body = hasBullets
            ? lines
                  .filter((l) => !/^[-•]\s/.test(l))
                  .join('\n')
                  .trim()
            : rest;
        return {
            heading,
            body: body ? body : undefined,
            bullets: hasBullets ? bulletLines : undefined,
        };
    }
    return { body: trimmed };
}

const ContentBlock = ({ block }: { block: ParsedBlock }) => (
    <div className="rounded-r border-l-4 border-l-muted-foreground/30 bg-muted/30 p-3">
        {block.heading && (
            <h3 className="mb-2 text-sm font-semibold text-foreground">
                {block.heading}
            </h3>
        )}
        {block.body ? (
            <p className="text-foreground text-sm leading-relaxed">
                {renderFormattedText(block.body)}
            </p>
        ) : null}
        {block.bullets && block.bullets.length > 0 && (
            <ul className="mt-2 space-y-1.5">
                {block.bullets.map((line, i) => (
                    <li
                        key={i}
                        className="flex items-start gap-2 text-sm leading-relaxed text-foreground"
                    >
                        <span className="mt-1.5 size-1.5 flex-shrink-0 rounded-full bg-muted-foreground/50" />
                        <span>{renderFormattedText(line)}</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

export const AiRecommendations = ({
    recommendations,
}: AiRecommendationsProps) => {
    const hasContent = recommendations.length > 0;

    return (
        <section className="rounded-lg border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    <Sparkles className="size-4 text-amber-500/80" />
                    AI-саммари и рекомендации
                </h2>
                {hasContent && (
                    <span
                        className={cn(
                            'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                            'bg-muted text-muted-foreground',
                        )}
                    >
                        <Bot className="size-3" />
                        сгенерировано AI
                    </span>
                )}
            </div>

            {hasContent ? (
                <div className="flex flex-col gap-1">
                    {recommendations.map((raw, index) => (
                        <ContentBlock key={index} block={parseBlock(raw)} />
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed bg-muted/20 py-8">
                    <p className="text-center text-sm text-muted-foreground">
                        AI-рекомендации будут доступны при наличии API-ключа
                        (GROQ_API_KEY)
                    </p>
                </div>
            )}
        </section>
    );
};
