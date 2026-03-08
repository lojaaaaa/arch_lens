import { LayoutGrid } from 'lucide-react';

export const CanvasEmptyState = () => {
    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
                <LayoutGrid className="text-muted-foreground/40 size-10" />
                <p className="text-muted-foreground text-sm">
                    Добавьте элемент из панели слева —
                    <br />
                    начните с Frontend, затем Backend и Data
                </p>
            </div>
        </div>
    );
};
