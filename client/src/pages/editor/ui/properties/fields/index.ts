import { lazy } from 'react';

export const UiPageFields = lazy(() =>
    import('./ui-page-fields').then((m) => ({
        default: m.UiPageFields,
    })),
);
export const UiComponentFields = lazy(() =>
    import('./ui-component-fields').then((m) => ({
        default: m.UiComponentFields,
    })),
);
export const StateStoreFields = lazy(() =>
    import('./state-store-fields').then((m) => ({
        default: m.StateStoreFields,
    })),
);
export const ApiGatewayFields = lazy(() =>
    import('./api-gateway-fields').then((m) => ({
        default: m.ApiGatewayFields,
    })),
);
export const ServiceFields = lazy(() =>
    import('./service-fields').then((m) => ({
        default: m.ServiceFields,
    })),
);
export const DatabaseFields = lazy(() =>
    import('./database-fields').then((m) => ({
        default: m.DatabaseFields,
    })),
);
export const CacheFields = lazy(() =>
    import('./cache-fields').then((m) => ({
        default: m.CacheFields,
    })),
);
export const ExternalSystemFields = lazy(() =>
    import('./external-system-fields').then((m) => ({
        default: m.ExternalSystemFields,
    })),
);
