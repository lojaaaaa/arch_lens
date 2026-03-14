import { useCallback, useEffect, useRef } from 'react';

import { Button } from './button';

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'destructive' | 'default';
    onConfirm: () => void;
    onCancel: () => void;
};

export const ConfirmDialog = ({
    open,
    title,
    description,
    confirmLabel = 'Подтвердить',
    cancelLabel = 'Отмена',
    variant = 'destructive',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        },
        [onCancel],
    );

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [open, handleKeyDown]);

    if (!open) {
        return null;
    }

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={(e) => {
                if (e.target === overlayRef.current) {
                    onCancel();
                }
            }}
        >
            <div className="mx-4 w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    {description}
                </p>
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    <Button variant={variant} size="sm" onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};
