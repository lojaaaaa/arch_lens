import { lazy, Suspense, useEffect } from 'react';
import { Link2, X } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { SidebarContent, SidebarFooter } from '@/shared/ui/sidebar';

import { EdgePropertiesContent } from './edge-properties-content';
import { useSelectedEdge } from './use-selected-edge';
import { useSelectedNode } from './use-selected-node';
import { NODE_LABELS } from '../../lib/config';
import { useArchitectureActions } from '../../model/selectors';
import { usePropertiesPanelStore } from '../../model/use-properties-panel-store';

const NodePropertiesFields = lazy(() =>
    import('./node-properties-fields').then((m) => ({
        default: m.NodePropertiesFields,
    })),
);

export const PropertiesPanel = () => {
    const open = usePropertiesPanelStore((state) => state.open);
    const setOpen = usePropertiesPanelStore((state) => state.setOpen);

    const { selectedArchitectureNode, isSystemNode } = useSelectedNode();
    const { graphEdge, selectedEdgeId } = useSelectedEdge();
    const { selectNode, removeNode, updateNode } = useArchitectureActions();

    useEffect(() => {
        if (selectedArchitectureNode || graphEdge) {
            usePropertiesPanelStore.getState().setOpen(true);
        }
    }, [selectedArchitectureNode, graphEdge]);

    if (!open) {
        return null;
    }

    const hasSelection = Boolean(selectedArchitectureNode || graphEdge);

    return (
        <aside className="flex w-[22rem] min-w-[22rem] shrink-0 flex-col overflow-hidden rounded-xl border border-sidebar-border/40 bg-sidebar/60 shadow-sm backdrop-blur-sm dark:bg-sidebar/40">
            <header className="border-sidebar-border/40 bg-sidebar/80 flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3 backdrop-blur-sm">
                <span className="text-sidebar-foreground text-sm font-semibold tracking-tight">
                    Свойства
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-sidebar-border/40 hover:text-sidebar-foreground size-8 rounded-md"
                    onClick={() => setOpen(false)}
                >
                    <X className="size-4" />
                    <span className="sr-only">Закрыть</span>
                </Button>
            </header>

            <SidebarContent className="text-sidebar-foreground flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-sidebar-border/60 hover:[&::-webkit-scrollbar-thumb]:bg-sidebar-border">
                {!hasSelection ? (
                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-center text-sm">
                        <Link2 className="size-10 opacity-40" />
                        <p>Выберите ноду или связь</p>
                        <p className="text-xs">Кликните по элементу на схеме</p>
                    </div>
                ) : selectedArchitectureNode ? (
                    <div className="flex flex-col gap-4">
                        <p className="text-muted-foreground text-xs">
                            {NODE_LABELS[selectedArchitectureNode.kind]}
                        </p>
                        <Suspense fallback={null}>
                            <NodePropertiesFields
                                node={selectedArchitectureNode}
                                onChange={updateNode}
                            />
                        </Suspense>
                    </div>
                ) : graphEdge && selectedEdgeId ? (
                    <EdgePropertiesContent
                        graphEdge={graphEdge}
                        selectedEdgeId={selectedEdgeId}
                    />
                ) : null}
            </SidebarContent>

            {selectedArchitectureNode && (
                <SidebarFooter className="border-sidebar-border/40 shrink-0 border-t px-4 py-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSystemNode}
                        className="w-full"
                        onClick={() => {
                            if (!selectedArchitectureNode || isSystemNode) {
                                return;
                            }
                            removeNode(selectedArchitectureNode.id);
                            selectNode(null);
                        }}
                    >
                        Удалить узел
                    </Button>
                </SidebarFooter>
            )}
        </aside>
    );
};
