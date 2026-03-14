import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { Loader2 } from 'lucide-react';

export const RouteLoadingLayout = () => (
    <div className="flex h-screen items-center justify-center">
        <p>Loading application...</p>
    </div>
);

export const AppLayout = () => <Outlet />;

const AnalysisPageFallback = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="text-primary size-10 animate-spin" />
        <p className="text-muted-foreground text-sm">Загрузка…</p>
    </div>
);

export const AnalysisLayout = () => (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
            <Suspense fallback={<AnalysisPageFallback />}>
                <Outlet />
            </Suspense>
        </main>
    </div>
);

export const DocsLayout = () => (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-10 pb-10">
            <Suspense fallback={<AnalysisPageFallback />}>
                <Outlet />
            </Suspense>
        </main>
    </div>
);
