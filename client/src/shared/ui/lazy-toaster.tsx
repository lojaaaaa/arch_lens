import { lazy, Suspense } from 'react';

const Toaster = lazy(() =>
    import('sonner').then((m) => ({
        default: () => <m.Toaster position="bottom-right" richColors />,
    })),
);

export const LazyToaster = () => (
    <Suspense fallback={null}>
        <Toaster />
    </Suspense>
);
