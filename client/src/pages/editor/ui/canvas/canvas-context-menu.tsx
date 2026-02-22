import { Copy, Pencil, Trash2 } from 'lucide-react';

type CanvasContextMenuState = {
    type: 'node' | 'edge';
    id: string;
    x: number;
    y: number;
};

type CanvasContextMenuProps = {
    contextMenu: CanvasContextMenuState;
    canDelete: boolean;
    canDuplicate: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
};

export const CanvasContextMenu = ({
    contextMenu,
    canDelete,
    canDuplicate,
    onClose,
    onEdit,
    onDuplicate,
    onDelete,
}: CanvasContextMenuProps) => {
    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
                onContextMenu={(event) => {
                    event.preventDefault();
                    onClose();
                }}
            />
            <div
                className="bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 fixed z-50 min-w-[10rem] overflow-hidden rounded-md border p-1 shadow-md"
                style={{
                    left: contextMenu.x,
                    top: contextMenu.y,
                }}
            >
                <button
                    type="button"
                    onClick={onEdit}
                    className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                >
                    <Pencil className="size-3.5 opacity-60" />
                    Редактировать
                </button>
                {canDuplicate ? (
                    <button
                        type="button"
                        onClick={onDuplicate}
                        className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                    >
                        <Copy className="size-3.5 opacity-60" />
                        Дублировать
                    </button>
                ) : null}
                {canDelete ? (
                    <>
                        <div className="bg-border -mx-1 my-1 h-px" />
                        <button
                            type="button"
                            onClick={onDelete}
                            className="hover:bg-destructive/10 text-destructive flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                        >
                            <Trash2 className="size-3.5 opacity-60" />
                            Удалить
                        </button>
                    </>
                ) : null}
            </div>
        </>
    );
};
