import { Button } from '@/shared/ui/button';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

type AnalysisEmptyProps = {
    onBack: () => void;
};

export const AnalysisEmpty = ({ onBack }: AnalysisEmptyProps) => {
    return (
        <div className="relative flex flex-col items-center justify-center gap-4 py-12">
            <div className="absolute right-0 top-0">
                <ThemeToggle />
            </div>
            <h1 className="text-xl font-semibold">Страница анализа</h1>
            <p className="text-muted-foreground text-center">
                Создайте схему в редакторе и нажмите «Анализ» для получения
                результатов.
            </p>
            <Button onClick={onBack}>Перейти в редактор</Button>
        </div>
    );
};
