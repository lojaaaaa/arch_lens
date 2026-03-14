export const Routes = {
    editor: '/',
    analysis: '/analysis',
    docs: '/docs',
    not_found: '*',
} as const;

export type RoutesType = (typeof Routes)[keyof typeof Routes];
