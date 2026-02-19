import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

import { SidebarProvider } from '@/shared/ui/sidebar';

const queryClient = new QueryClient();

export const AppProviders = ({ children }: { children: ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <SidebarProvider defaultOpen={false}>{children}</SidebarProvider>
            <Toaster position="bottom-right" richColors />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
};
