import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/shared/lib/use-theme';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

type ThemeToggleProps = {
    className?: string;
};

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    aria-label={
                        theme === 'light'
                            ? 'Включить тёмную тему'
                            : 'Включить светлую тему'
                    }
                    className={cn('size-8', className)}
                >
                    {theme === 'light' ? (
                        <Moon className="size-4" />
                    ) : (
                        <Sun className="size-4" />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            </TooltipContent>
        </Tooltip>
    );
};
