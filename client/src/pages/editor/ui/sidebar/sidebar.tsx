import { Button } from '@/shared/ui/button';
import {
    Sidebar as UISidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/shared/ui/sidebar';

import { NODE_KINDS } from '../../lib/config';
import { useArchitectureActions } from '../../model/selectors';

export const Sidebar = () => {
    const { addNode, setNodes, setEdges } = useArchitectureActions();

    const onClear = () => {
        setNodes([]);
        setEdges([]);
    };

    return (
        <UISidebar side="left" variant="inset">
            <SidebarHeader>
                <div className="text-xl font-medium">Новые узлы</div>
            </SidebarHeader>

            <SidebarContent className="gap-1 p-2">
                {NODE_KINDS.map(({ kind, label }) => (
                    <Button
                        key={kind}
                        onClick={() => addNode(kind)}
                        variant="ghost"
                        className="w-full justify-start"
                    >
                        {label}
                    </Button>
                ))}
            </SidebarContent>
            <Button onClick={onClear} className="w-full justify-start">
                Очистить узлы
            </Button>
            <SidebarFooter />
        </UISidebar>
    );
};
