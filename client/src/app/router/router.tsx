import { Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';

import { Routes } from '@/shared/model/routes';
import {
    AnalysisLayout,
    AppLayout,
    DocsLayout,
    RouteLoadingLayout,
} from '@/shared/ui/layouts';

import { AppProviders } from '../providers/app-providers';

export const router = createBrowserRouter([
    {
        element: (
            <div className="flex h-full min-h-0 flex-col">
                <Suspense fallback={<RouteLoadingLayout />}>
                    <AppProviders>
                        <Outlet />
                    </AppProviders>
                </Suspense>
            </div>
        ),
        children: [
            {
                element: <AppLayout />,
                children: [
                    {
                        path: Routes.editor,
                        lazy: () => import('@/pages/editor/editor-page'),
                    },
                    {
                        path: Routes.analysis,
                        element: <AnalysisLayout />,
                        children: [
                            {
                                index: true,
                                lazy: () =>
                                    import('@/pages/analysis/analysis-page'),
                            },
                        ],
                    },
                    {
                        path: Routes.docs,
                        element: <DocsLayout />,
                        children: [
                            {
                                index: true,
                                lazy: () =>
                                    import('@/pages/documents/docs-page'),
                            },
                        ],
                    },
                    {
                        path: Routes.not_found,
                        lazy: () => import('@/pages/not-found/not-found-page'),
                    },
                ],
            },
            {
                path: '/',
                element: <Navigate to={Routes.editor} replace />,
            },
            {
                path: Routes.not_found,
                lazy: () => import('@/pages/not-found/not-found-page'),
            },
        ],
    },
]);
