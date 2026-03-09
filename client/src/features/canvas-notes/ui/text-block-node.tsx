import type { MouseEvent as ReactMouseEvent } from 'react';
import { memo, useCallback, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { NodeProps } from '@xyflow/react';
import { GripVertical } from 'lucide-react';
import remarkGfm from 'remark-gfm';

import { canvasNotesMarkdownComponents } from '../lib/markdown-components';
import { useCanvasNotesStore } from '../model/store';

const DEFAULT_WIDTH = 240;
const DEFAULT_HEIGHT = 120;

type TextBlockData = {
    content: string;
    width?: number;
    height?: number;
};

export const TextBlockNode = memo(
    ({ data, id }: NodeProps & { data: TextBlockData }) => {
        const updateContent = useCanvasNotesStore(
            (state) => state.updateContent,
        );
        const updateSize = useCanvasNotesStore((state) => state.updateSize);
        const content = data.content ?? '';
        const width = data.width ?? DEFAULT_WIDTH;
        const height = data.height ?? DEFAULT_HEIGHT;

        const [isEditing, setIsEditing] = useState(false);
        const [draft, setDraft] = useState(content);
        const resizeRef = useRef<{
            startX: number;
            startY: number;
            startW: number;
            startH: number;
        } | null>(null);

        const handleStartEdit = () => {
            setDraft(content);
            setIsEditing(true);
        };

        const handleSave = () => {
            updateContent(id, draft);
            setIsEditing(false);
        };

        const handleCancel = () => {
            setDraft(content);
            setIsEditing(false);
        };

        const handleResizeStart = useCallback(
            (e: ReactMouseEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();
                resizeRef.current = {
                    startX: e.clientX,
                    startY: e.clientY,
                    startW: width,
                    startH: height,
                };
                const onMove = (moveE: MouseEvent) => {
                    if (!resizeRef.current) {
                        return;
                    }
                    const dx = moveE.clientX - resizeRef.current.startX;
                    const dy = moveE.clientY - resizeRef.current.startY;
                    const newW = Math.max(120, resizeRef.current.startW + dx);
                    const newH = Math.max(60, resizeRef.current.startH + dy);
                    updateSize(id, { width: newW, height: newH });
                };
                const onUp = () => {
                    resizeRef.current = null;
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            },
            [id, width, height, updateSize],
        );

        return (
            <div
                className="group/block nopan relative flex flex-col overflow-hidden rounded-lg border border-border bg-background/95 shadow-sm backdrop-blur-sm"
                style={{ width, minHeight: height }}
            >
                <div
                    className="flex cursor-grab items-center justify-end border-b border-border/50 bg-muted/30 px-2 py-1 active:cursor-grabbing"
                    style={{ minHeight: 24 }}
                >
                    <GripVertical
                        className="size-3.5 text-muted-foreground"
                        aria-hidden
                    />
                </div>
                <div className="nodrag flex flex-1 flex-col overflow-hidden px-3 py-2">
                    {isEditing ? (
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    handleCancel();
                                }
                                if (
                                    (e.metaKey || e.ctrlKey) &&
                                    e.key === 'Enter'
                                ) {
                                    e.preventDefault();
                                    handleSave();
                                }
                            }}
                            placeholder="Заметка… Поддерживается **Markdown** (Shift+Enter — новая строка)"
                            className="nodrag min-h-0 flex-1 resize-none bg-transparent text-sm outline-none"
                            autoFocus
                            style={{ minHeight: height - 56 }}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={handleStartEdit}
                            onDoubleClick={handleStartEdit}
                            className="nodrag w-full flex-1 text-left"
                        >
                            {content ? (
                                <div className="text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={
                                            canvasNotesMarkdownComponents
                                        }
                                    >
                                        {content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <span className="text-muted-foreground italic">
                                    Клик для ввода заметки…
                                </span>
                            )}
                        </button>
                    )}
                </div>
                <div
                    className="nodrag absolute bottom-0 right-0 cursor-se-resize p-1"
                    onMouseDown={handleResizeStart}
                    aria-label="Изменить размер"
                >
                    <div className="size-2 rotate-45 border-b border-r border-muted-foreground/40" />
                </div>
            </div>
        );
    },
);

TextBlockNode.displayName = 'TextBlockNode';
