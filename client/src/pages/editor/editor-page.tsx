import { ReactFlowProvider } from '@xyflow/react';

import { Separator } from '@/shared/ui/separator';
import { SidebarInset } from '@/shared/ui/sidebar';

import { ArchitectureCanvas } from './ui/canvas/architecture-canvas';
import { Header } from './ui/header/header';
import { EdgePropertiesSheet } from './ui/properties/edge-properties-sheet';
import { NodePropertiesSheet } from './ui/properties/node-properties-sheet';
import { Sidebar } from './ui/sidebar/sidebar';

const EditorPage = () => {
    return (
        <ReactFlowProvider>
            <Sidebar />
            <SidebarInset className="min-h-svh">
                <Header />
                <Separator />

                <div className="relative flex-1">
                    <NodePropertiesSheet />
                    <EdgePropertiesSheet />
                    <ArchitectureCanvas />
                </div>
            </SidebarInset>
        </ReactFlowProvider>
    );
};

export const Component = EditorPage;
