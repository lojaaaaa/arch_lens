import { useState } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import type { LayerType, NodeKind } from '@/shared/model/types';
import { Button } from '@/shared/ui/button';
import {
    Sidebar as UISidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/shared/ui/sidebar';

import { LAYER_COLORS, LAYER_NODE_KINDS } from '../../lib/config';
import { useArchitectureActions } from '../../model/selectors';

const LayerGroup = ({
    layer,
    label,
    kinds,
    onAddNode,
}: {
    layer: LayerType;
    label: string;
    kinds: { kind: NodeKind; label: string }[];
    onAddNode: (kind: NodeKind) => void;
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const colors = LAYER_COLORS[layer];

    return (
        <div className="flex flex-col">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(
                    'flex items-center justify-between rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                    colors.bg,
                    colors.text,
                )}
            >
                {label}
                <ChevronDown
                    className={cn(
                        'size-3.5 transition-transform',
                        !isOpen && '-rotate-90',
                    )}
                />
            </button>

            {isOpen && (
                <div className="mt-0.5 flex flex-col gap-0.5 pl-1">
                    {kinds.map(({ kind, label: kindLabel }) => (
                        <Button
                            key={kind}
                            onClick={() => onAddNode(kind)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-full justify-start gap-2 text-xs"
                        >
                            <Plus className="size-3 opacity-50" />
                            {kindLabel}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const Sidebar = () => {
    const { addNode, setNodes, setEdges } = useArchitectureActions();

    const handleClear = () => {
        setNodes([]);
        setEdges([]);
    };

    return (
        <UISidebar side="left" variant="inset">
            <SidebarHeader>
                <div className="text-sm font-medium">Элементы</div>
            </SidebarHeader>

            <SidebarContent className="gap-2 p-2">
                {LAYER_NODE_KINDS.map(({ layer, label, kinds }) => (
                    <LayerGroup
                        key={layer}
                        layer={layer}
                        label={label}
                        kinds={kinds}
                        onAddNode={addNode}
                    />
                ))}
            </SidebarContent>

            <SidebarFooter className="p-2">
                <Button
                    onClick={handleClear}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-destructive"
                >
                    <Trash2 className="size-3" />
                    Очистить схему
                </Button>
            </SidebarFooter>
        </UISidebar>
    );
};
