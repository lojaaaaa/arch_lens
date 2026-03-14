export const env = {
    get apiBaseUrl(): string {
        const url = import.meta.env.VITE_API_URL;
        if (url !== undefined && url !== '') {
            return url;
        }
        return import.meta.env.PROD ? '' : 'http://localhost:3000';
    },
} as const;
