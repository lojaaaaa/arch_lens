import type { ReactNode } from 'react';

import { LazyToaster } from '@/shared/ui/lazy-toaster';
import { SidebarProvider } from '@/shared/ui/sidebar';

export const AppProviders = ({ children }: { children: ReactNode }) => {
    return (
        <SidebarProvider defaultOpen={false}>
            {children}
            <LazyToaster />
        </SidebarProvider>
    );
};
