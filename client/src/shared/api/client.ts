import { env } from '../config/env';

export class ApiError extends Error {
    readonly statusCode: number;
    readonly response?: unknown;

    constructor(message: string, statusCode: number, response?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.response = response;
    }
}

const handleResponse = async <ResponseBody>(
    response: Response,
): Promise<ResponseBody> => {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
        const errorBody = isJson
            ? await response.json().catch(() => ({}))
            : await response.text();
        throw new ApiError(
            `Request failed: ${response.status} ${response.statusText}`,
            response.status,
            errorBody,
        );
    }

    if (isJson) {
        return response.json();
    }

    return response.text() as unknown as ResponseBody;
};

type FetchOptions = NonNullable<Parameters<typeof fetch>[1]>;

export const apiRequest = async <ResponseBody>(
    path: string,
    options: FetchOptions = {},
): Promise<ResponseBody> => {
    const baseUrl = env.apiBaseUrl.replace(/\/$/, '');
    const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const mergedOptions: FetchOptions = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    const response = await fetch(url, mergedOptions);
    return handleResponse<ResponseBody>(response);
};
