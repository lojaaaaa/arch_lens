import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';

import { useAnalysisStore } from '@/pages/analysis/model/store';
import type { NodeKind } from '@/shared/model/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { NODE_LABELS } from '../../lib/config';
import { useArchitectureSelectors } from '../../model/selectors';

const matchNode = (
    query: string,
    nodeId: string,
    node: { kind?: NodeKind; displayName?: string },
): boolean => {
    const q = query.trim().toLowerCase();
    if (!q) {
        return false;
    }
    const kind = node?.kind ?? '';
    const kindLabel = NODE_LABELS[kind as NodeKind] ?? kind;
    const displayName = (node?.displayName ?? '').toLowerCase();
    return (
        kind.toLowerCase().includes(q) ||
        kindLabel.toLowerCase().includes(q) ||
        displayName.includes(q) ||
        nodeId.toLowerCase().includes(q)
    );
};

export const GraphSearch = () => {
    const { nodes } = useArchitectureSelectors();
    const setHighlightedNodeIds = useAnalysisStore(
        (state) => state.setHighlightedNodeIds,
    );
    const setHighlightPreventAutoClear = useAnalysisStore(
        (state) => state.setHighlightPreventAutoClear,
    );
    const clearHighlight = useAnalysisStore((state) => state.clearHighlight);

    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 150);
        return () => clearTimeout(timer);
    }, [query]);

    const matchedIds = useMemo(() => {
        if (!debouncedQuery.trim()) {
            return [];
        }
        return nodes
            .filter((n) => {
                const data = n.data as {
                    node?: { kind?: NodeKind; displayName?: string };
                };
                return matchNode(debouncedQuery, n.id, data?.node ?? {});
            })
            .map((n) => n.id);
    }, [nodes, debouncedQuery]);

    const applyHighlight = useCallback(() => {
        if (debouncedQuery.trim()) {
            if (matchedIds.length > 0) {
                setHighlightPreventAutoClear(true);
                setHighlightedNodeIds(matchedIds);
            } else {
                setHighlightPreventAutoClear(false);
                clearHighlight();
            }
        } else {
            setHighlightPreventAutoClear(false);
        }
    }, [
        debouncedQuery,
        matchedIds,
        setHighlightedNodeIds,
        setHighlightPreventAutoClear,
        clearHighlight,
    ]);

    useEffect(() => {
        applyHighlight();
    }, [applyHighlight]);

    const handleClear = useCallback(() => {
        setQuery('');
        clearHighlight();
    }, [clearHighlight]);

    return (
        <div className="flex items-center gap-1">
            <div className="relative">
                <Search className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2" />
                <Input
                    type="search"
                    placeholder="Поиск по графу…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-8 w-40 pl-7 pr-7 text-sm md:w-48"
                    aria-label="Поиск нод по имени или типу"
                />
                {query && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-1/2 size-7 -translate-y-1/2"
                                onClick={handleClear}
                                aria-label="Очистить поиск"
                            >
                                <X className="size-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            Очистить поиск
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
            {debouncedQuery && (
                <span className="text-muted-foreground text-xs tabular-nums">
                    {matchedIds.length}
                </span>
            )}
        </div>
    );
};
