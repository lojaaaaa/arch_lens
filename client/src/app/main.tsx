import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { applyTheme, getStoredTheme } from '@/features/theme';
import { ErrorBoundary } from '@/shared/ui/error-boundary';

import { router } from './router/router';

import '@xyflow/react/dist/style.css';
import './styles/index.css';

const initialTheme = getStoredTheme() ?? 'light';
applyTheme(initialTheme);

const root = document.getElementById('root');
if (!root) {
    throw new Error('Root element #root not found');
}

createRoot(root).render(
    <StrictMode>
        <ErrorBoundary>
            <RouterProvider router={router} />
        </ErrorBoundary>
    </StrictMode>,
);
