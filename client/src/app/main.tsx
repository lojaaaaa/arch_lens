import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { applyTheme, getStoredTheme } from '@/shared/lib/theme';

import { router } from './router/router';

import '@xyflow/react/dist/style.css';
import './styles/index.css';

const initialTheme = getStoredTheme() ?? 'light';
applyTheme(initialTheme);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
