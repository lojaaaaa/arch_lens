import { useCallback, useEffect, useState } from 'react';
import { Panel } from '@xyflow/react';
import { Search, X } from 'lucide-react';

import { useGraphHighlightStore } from '@/features/graph-highlight';
import { GraphSearch } from '@/features/graph-search';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { NODE_LABELS } from '../../lib/config';
import { useArchitectureNodes } from '../../model/selectors';

export const CanvasSearchTrigger = () => {
    const [open, setOpen] = useState(false);
    const nodes = useArchitectureNodes();
    const setHighlightedNodeIds = useGraphHighlightStore(
        (state) => state.setHighlightedNodeIds,
    );
    const setHighlightPreventAutoClear = useGraphHighlightStore(
        (state) => state.setHighlightPreventAutoClear,
    );
    const clearHighlight = useGraphHighlightStore(
        (state) => state.clearHighlight,
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleOpen = useCallback(() => setOpen(true), []);

    return (
        <Panel
            position="bottom-right"
            className="bg-card/70 flex items-center gap-2 rounded-md border px-1 py-1 shadow-sm backdrop-blur-sm"
        >
            {open ? (
                <div className="flex items-center gap-1">
                    <GraphSearch
                        nodes={nodes}
                        nodeLabels={NODE_LABELS}
                        onHighlight={setHighlightedNodeIds}
                        onClearHighlight={clearHighlight}
                        onPreventAutoClear={setHighlightPreventAutoClear}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0"
                        onClick={() => setOpen(false)}
                        aria-label="Свернуть поиск"
                    >
                        <X className="size-3.5" />
                    </Button>
                </div>
            ) : (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={handleOpen}
                            aria-label="Поиск по графу (⌘F)"
                        >
                            <Search className="size-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        Поиск по графу (⌘F)
                    </TooltipContent>
                </Tooltip>
            )}
        </Panel>
    );
};
