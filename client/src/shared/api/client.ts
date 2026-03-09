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

export type ApiRequestOptions = {
    /** Таймаут в мс. По умолчанию 60_000. */
    timeout?: number;
    /** Внешний AbortSignal для отмены (например, при unmount). */
    signal?: AbortSignal;
};

const DEFAULT_TIMEOUT_MS = 60_000;

export const apiRequest = async <ResponseBody>(
    path: string,
    fetchOptions: FetchOptions = {},
    apiOptions: ApiRequestOptions = {},
): Promise<ResponseBody> => {
    const baseUrl = env.apiBaseUrl.replace(/\/$/, '');
    const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const timeoutMs = apiOptions.timeout ?? DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const externalSignal = apiOptions.signal;
    if (externalSignal) {
        externalSignal.addEventListener('abort', () => controller.abort());
    }

    try {
        const mergedOptions: FetchOptions = {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...fetchOptions.headers,
            },
        };

        const response = await fetch(url, mergedOptions);
        return await handleResponse<ResponseBody>(response);
    } finally {
        clearTimeout(timeoutId);
    }
};
