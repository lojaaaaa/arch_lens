export const env = {
    get apiBaseUrl(): string {
        return import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    },
} as const;
