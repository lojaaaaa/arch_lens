import { Button } from '@/shared/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/shared/ui/sheet';

import { NodePropertiesFields } from './node-properties-fields';
import { useSelectedNode } from './use-selected-node';
import { NODE_LABELS } from '../../lib/config';
import { useArchitectureActions } from '../../model/selectors';

export const NodePropertiesSheet = () => {
    const { selectNode, removeNode, updateNode } = useArchitectureActions();

    const { selectedArchitectureNode, isSheetOpen, isSystemNode } =
        useSelectedNode();

    return (
        <Sheet
            open={isSheetOpen}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    selectNode(null);
                }
            }}
        >
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Параметры узла</SheetTitle>
                    <SheetDescription>
                        Тип:{' '}
                        <span className="font-medium">
                            {selectedArchitectureNode
                                ? NODE_LABELS[selectedArchitectureNode.kind]
                                : ''}
                        </span>
                    </SheetDescription>
                </SheetHeader>

                {!selectedArchitectureNode ? (
                    <div className="p-4 text-sm text-muted-foreground">
                        Выберите узел на схеме, чтобы редактировать параметры.
                    </div>
                ) : (
                    <NodePropertiesFields
                        node={selectedArchitectureNode}
                        onChange={updateNode}
                    />
                )}

                <SheetFooter>
                    <Button
                        type="button"
                        disabled={!selectedArchitectureNode || isSystemNode}
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
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
