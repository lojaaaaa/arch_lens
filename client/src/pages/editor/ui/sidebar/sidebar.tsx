import { useCallback, useRef, useState } from 'react';

import { ARCHITECTURE_PRESETS } from '@/features/architecture-presets';
import { clearFlowFromStorage } from '@/shared/lib/flow-storage';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import {
    Sidebar as UISidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/shared/ui/sidebar';

import { SidebarClear } from './sidebar-clear';
import { SidebarLayerGroup } from './sidebar-layer-group';
import { SidebarPresets } from './sidebar-presets';
import { LAYER_NODE_KINDS } from '../../lib/config';
import { toFlowEdge, toFlowNode } from '../../lib/utils';
import { useArchitectureActions } from '../../model/selectors';

export const Sidebar = () => {
    const { addNode, setNodes, setEdges } = useArchitectureActions();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const pendingAction = useRef<(() => void) | null>(null);

    const requestConfirm = useCallback((action: () => void) => {
        pendingAction.current = action;
        setConfirmOpen(true);
    }, []);

    const handleConfirm = useCallback(() => {
        pendingAction.current?.();
        pendingAction.current = null;
        setConfirmOpen(false);
    }, []);

    const handleCancel = useCallback(() => {
        pendingAction.current = null;
        setConfirmOpen(false);
    }, []);

    const handleApplyPreset = (presetId: string) => {
        const preset = ARCHITECTURE_PRESETS.find(
            (item) => item.id === presetId,
        );
        if (!preset) {
            return;
        }
        requestConfirm(() => {
            const { nodes, edges } = preset.build();
            setNodes(nodes.map((node) => toFlowNode(node)));
            setEdges(edges.map((edge) => toFlowEdge(edge)));
        });
    };

    const handleClear = () => {
        requestConfirm(() => {
            clearFlowFromStorage();
            setNodes([]);
            setEdges([]);
        });
    };

    return (
        <>
            <UISidebar side="left" variant="inset">
                <SidebarHeader className="border-sidebar-border/40 border-b px-4 py-3">
                    <div className="text-sm font-semibold tracking-tight text-sidebar-foreground">
                        Элементы
                    </div>
                </SidebarHeader>

                <SidebarContent className="gap-3 p-3">
                    <SidebarPresets
                        presets={ARCHITECTURE_PRESETS}
                        onApplyPreset={handleApplyPreset}
                    />
                    {LAYER_NODE_KINDS.map(({ layer, label, kinds }) => (
                        <SidebarLayerGroup
                            key={layer}
                            layer={layer}
                            label={label}
                            kinds={kinds}
                            onAddNode={addNode}
                        />
                    ))}
                </SidebarContent>

                <SidebarFooter className="border-sidebar-border/40 border-t p-3">
                    <SidebarClear onClear={handleClear} />
                </SidebarFooter>
            </UISidebar>

            <ConfirmDialog
                open={confirmOpen}
                title="Подтверждение"
                description="Текущая схема будет заменена. Это действие нельзя отменить."
                confirmLabel="Заменить"
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </>
    );
};
