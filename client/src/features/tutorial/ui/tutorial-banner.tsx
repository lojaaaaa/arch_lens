import { Lightbulb, X } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

export type TutorialBannerProps = {
    hint: string;
    onDismiss: () => void;
    className?: string;
};

export const TutorialBanner = ({
    hint,
    onDismiss,
    className,
}: TutorialBannerProps) => {
    return (
        <div
            className={cn(
                'bg-primary/5 border-primary/20 flex items-center gap-3 rounded-lg border px-3 py-2 shadow-sm',
                className,
            )}
            role="status"
            aria-live="polite"
        >
            <Lightbulb className="text-primary size-4 shrink-0 opacity-70" />
            <p className="text-foreground/90 min-w-0 flex-1 text-sm">{hint}</p>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="size-7 shrink-0"
                aria-label="Закрыть подсказку"
            >
                <X className="size-3.5" />
            </Button>
        </div>
    );
};
