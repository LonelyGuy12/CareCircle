const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
    constructor(
        public status: number,
        public code: string,
        message: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    let res: Response;
    try {
        res = await fetch(`${BASE_URL}${path}`, {
            ...init,
            headers: { 'Content-Type': 'application/json', ...init.headers },
            signal: AbortSignal.timeout(8000),
        });
    } catch {
        throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the CareCircle API.');
    }

    if (!res.ok) {
        let code = 'UNKNOWN_ERROR';
        let message = `API request failed with status ${res.status}.`;
        try {
            const body = (await res.json()) as { error?: { code?: string; message?: string } };
            if (body.error) {
                code = body.error.code ?? code;
                message = body.error.message ?? message;
            }
        } catch {
            // response was not JSON, keep the defaults
        }
        throw new ApiError(res.status, code, message);
    }

    return (await res.json()) as T;
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown = {}) =>
        request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
