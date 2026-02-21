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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { LAYER_COLORS, LAYER_NODE_KINDS } from '../../lib/config';
import { ARCHITECTURE_PRESETS } from '../../lib/presets';
import { toFlowEdge, toFlowNode } from '../../lib/utils';
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
    const tooltips: Record<NodeKind, string> = {
        system: 'Системный компонент, объединяющий все другие компоненты.',
        ui_page: 'UI-страница приложения. Например, /login.',
        ui_component: 'UI-компонент. Например, форма или кнопка.',
        state_store: 'Хранилище состояния. Например, Zustand/Redux.',
        api_gateway: 'Точка входа API. Например, gateway.',
        service: 'Бэкенд-сервис с логикой. Например, user-service.',
        database: 'База данных. Например, PostgreSQL.',
        cache: 'Кэш. Например, Redis.',
        external_system: 'Внешняя система. Например, платежный сервис.',
    };

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
                        <Tooltip key={kind}>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => onAddNode(kind)}
                                    onDragStart={(event) => {
                                        event.dataTransfer.setData(
                                            'application/archlens-node',
                                            kind,
                                        );
                                        event.dataTransfer.effectAllowed =
                                            'move';
                                    }}
                                    draggable
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-full justify-start gap-2 text-xs"
                                >
                                    <Plus className="size-3 opacity-50" />
                                    {kindLabel}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-60">
                                {tooltips[kind]}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            )}
        </div>
    );
};

export const Sidebar = () => {
    const { addNode, setNodes, setEdges } = useArchitectureActions();

    const handleApplyPreset = (presetId: string) => {
        const preset = ARCHITECTURE_PRESETS.find(
            (item) => item.id === presetId,
        );
        if (!preset) {
            return;
        }
        const { nodes, edges } = preset.build();
        setNodes(nodes.map((node) => toFlowNode(node)));
        setEdges(edges.map((edge) => toFlowEdge(edge)));
    };

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
                <div className="flex flex-col gap-2 rounded-md border bg-card/60 p-2">
                    <div className="text-xs font-semibold text-muted-foreground">
                        Шаблоны
                    </div>
                    <div className="flex flex-col gap-1">
                        {ARCHITECTURE_PRESETS.map((preset) => (
                            <Button
                                key={preset.id}
                                onClick={() => handleApplyPreset(preset.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-full justify-start gap-2 text-xs"
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>
                </div>
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
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={handleClear}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="size-3" />
                            Очистить схему
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-60">
                        Удаляет все ноды и связи на canvas.
                    </TooltipContent>
                </Tooltip>
            </SidebarFooter>
        </UISidebar>
    );
};
