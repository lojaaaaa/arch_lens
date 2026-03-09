import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Node } from '@xyflow/react';
import { Search, X } from 'lucide-react';

import type { NodeKind } from '@/shared/model/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { matchNode } from '../lib/match-node';

const DEBOUNCE_MS = 150;

export type GraphSearchProps = {
    nodes: Node[];
    nodeLabels: Partial<Record<NodeKind, string>>;
    onHighlight: (nodeIds: string[]) => void;
    onClearHighlight: () => void;
    onPreventAutoClear: (value: boolean) => void;
};

export const GraphSearch = ({
    nodes,
    nodeLabels,
    onHighlight,
    onClearHighlight,
    onPreventAutoClear,
}: GraphSearchProps) => {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [query]);

    const matchedIds = useMemo(() => {
        if (!debouncedQuery.trim()) {
            return [];
        }
        return nodes
            .filter((node) => {
                const data = node.data as {
                    node?: { kind?: NodeKind; displayName?: string };
                };
                return matchNode(
                    debouncedQuery,
                    node.id,
                    data?.node ?? {},
                    nodeLabels,
                );
            })
            .map((node) => node.id);
    }, [nodes, debouncedQuery, nodeLabels]);

    const applyHighlight = useCallback(() => {
        if (debouncedQuery.trim()) {
            if (matchedIds.length > 0) {
                onPreventAutoClear(true);
                onHighlight(matchedIds);
            } else {
                onPreventAutoClear(false);
                onClearHighlight();
            }
        } else {
            onPreventAutoClear(false);
        }
    }, [
        debouncedQuery,
        matchedIds,
        onHighlight,
        onClearHighlight,
        onPreventAutoClear,
    ]);

    useEffect(() => {
        applyHighlight();
    }, [applyHighlight]);

    const handleClear = useCallback(() => {
        setQuery('');
        onClearHighlight();
    }, [onClearHighlight]);

    return (
        <div className="flex items-center gap-1">
            <div className="relative">
                <Search className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2" />
                <Input
                    type="search"
                    placeholder="Поиск по графу…"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
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
