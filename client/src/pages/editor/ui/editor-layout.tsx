import { Separator } from '@/shared/ui/separator';
import { SidebarInset } from '@/shared/ui/sidebar';

import { Header } from './header/header';
import { EditorCanvasArea } from './editor-canvas-area';

export const EditorLayout = () => {
    return (
        <SidebarInset className="h-svh min-h-svh">
            <Header />
            <Separator />
            <EditorCanvasArea />
        </SidebarInset>
    );
};
