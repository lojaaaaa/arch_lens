import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import type { LayerType, NodeKind } from '@/shared/model/types';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

import { LAYER_COLORS } from '../../lib/config';

const NODE_TOOLTIPS: Record<NodeKind, string> = {
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

type LayerGroupProps = {
    layer: LayerType;
    label: string;
    kinds: { kind: NodeKind; label: string }[];
    onAddNode: (kind: NodeKind) => void;
};

export const SidebarLayerGroup = ({
    layer,
    label,
    kinds,
    onAddNode,
}: LayerGroupProps) => {
    const [isOpen, setIsOpen] = useState(true);
    const colors = LAYER_COLORS[layer];

    return (
        <div className="flex flex-col">
            <Button
                variant="none"
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
            </Button>

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
                                {NODE_TOOLTIPS[kind]}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            )}
        </div>
    );
};
