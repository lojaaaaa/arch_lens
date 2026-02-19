export const Routes = {
    editor: '/',
    analysis: '/analysis',
    not_found: '*',
} as const;

export type RoutesType = (typeof Routes)[keyof typeof Routes];
