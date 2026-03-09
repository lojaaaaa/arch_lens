import { Separator } from '@/shared/ui/separator';
import { SidebarInset } from '@/shared/ui/sidebar';

import { Header } from './header/header';
import { PropertiesPanel } from './properties/properties-panel';
import { EditorCanvasArea } from './editor-canvas-area';

export const EditorLayout = () => {
    return (
        <SidebarInset className="h-svh min-h-svh overflow-hidden">
            <Header />
            <Separator />
            <div className="flex flex-1 min-h-0">
                <EditorCanvasArea />
                <PropertiesPanel />
            </div>
        </SidebarInset>
    );
};
