import { Copy, FileText, Pencil, Trash2 } from 'lucide-react';

type CanvasContextMenuState =
    | { type: 'node'; id: string; x: number; y: number }
    | { type: 'edge'; id: string; x: number; y: number }
    | { type: 'pane'; x: number; y: number };

type CanvasContextMenuProps = {
    contextMenu: CanvasContextMenuState;
    canDelete: boolean;
    canDuplicate: boolean;
    canEdit?: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onAddTextBlock?: () => void;
};

export const CanvasContextMenu = ({
    contextMenu,
    canDelete,
    canDuplicate,
    canEdit = true,
    onClose,
    onEdit,
    onDuplicate,
    onDelete,
    onAddTextBlock,
}: CanvasContextMenuProps) => {
    const isPane = contextMenu.type === 'pane';

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
                {isPane ? (
                    onAddTextBlock && (
                        <button
                            type="button"
                            onClick={() => {
                                onAddTextBlock();
                                onClose();
                            }}
                            className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                        >
                            <FileText className="size-3.5 opacity-60" />
                            Добавить текстовый блок
                        </button>
                    )
                ) : (
                    <>
                        {canEdit && (
                            <button
                                type="button"
                                onClick={onEdit}
                                className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
                            >
                                <Pencil className="size-3.5 opacity-60" />
                                Редактировать
                            </button>
                        )}
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
                    </>
                )}
            </div>
        </>
    );
};
