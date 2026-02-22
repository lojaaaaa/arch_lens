import { Panel } from '@xyflow/react';
import { LayoutGrid } from 'lucide-react';

export const CanvasEmptyState = () => {
    return (
        <Panel
            position="top-center"
            className="!pointer-events-none !m-0 flex h-full w-full items-center justify-center"
        >
            <div className="flex flex-col items-center gap-3 text-center">
                <LayoutGrid className="text-muted-foreground/40 size-10" />
                <p className="text-muted-foreground text-sm">
                    Добавьте элемент из панели слева,
                    <br />
                    чтобы начать проектирование
                </p>
            </div>
        </Panel>
    );
};
