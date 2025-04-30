import { IHttpClient } from './http.client.interface';
import { getAuthTokens } from '@/actions/auth.action';

export interface BaseHttpClientConfig {
    baseUrl?: string;
    headers?: Record<string, string>;
}

export class BaseHttpClient implements IHttpClient {
    baseUrl: string;
    headers?: Record<string, string>;

    constructor(config: BaseHttpClientConfig) {
        this.baseUrl = config.baseUrl ?? '';
        this.headers = config.headers ?? {};
    }

    getDefaultHeaders(): Record<string, string> {
        return {
            'Content-Type': 'application/json',
        };
    }

    async getAuthTokens() {
        const { accessToken } = await getAuthTokens();
        return { accessToken };
    }

    handleError(error: unknown): never {
        throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        return response.json() as T;
    }

    updateConfig(config: BaseHttpClientConfig): void {
        if (config.baseUrl) this.baseUrl = config.baseUrl;
        if (config.headers) this.headers = { ...this.headers, ...config.headers };
    }

    private async buildHeaders(
        headers: Record<string, string> = {},
    ): Promise<Record<string, string>> {
        const { accessToken } = await this.getAuthTokens();
        return {
            ...this.getDefaultHeaders(),
            ...this.headers,
            ...headers,
            Authorization: `Bearer ${accessToken}`,
        };
    }

    private async makeRequest<T>(url: string, config: RequestInit): Promise<T> {
        try {
            const headers = await this.buildHeaders(config.headers as Record<string, string>);
            const requestOptions = {
                ...config,
                headers,
            };

            if (config.method === 'GET' || config.method === 'HEAD') {
                delete requestOptions.body;
            }

            const response = await fetch(`${this.baseUrl}${url}`, requestOptions);

            if (!response.ok)
                return this.handleError({
                    ...(await response.json()),
                    status: await response.status,
                });
            return await this.handleResponse<T>(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    async get<T>(url: string, config?: RequestInit): Promise<T> {
        return this.makeRequest<T>(url, {
            ...config,
            method: 'GET',
        });
    }

    async post<T>(url: string, data?: object, config?: RequestInit): Promise<T> {
        return this.makeRequest<T>(url, {
            ...config,
            body: JSON.stringify(data),
            method: 'POST',
        });
    }

    async patch<T>(url: string, data?: object, config?: RequestInit): Promise<T> {
        return this.makeRequest<T>(url, {
            ...config,
            body: JSON.stringify(data),
            method: 'PATCH',
        });
    }

    async delete<T>(url: string, config?: RequestInit): Promise<T> {
        return this.makeRequest<T>(url, {
            ...config,
            method: 'DELETE',
        });
    }

    async put<T>(url: string, data?: object, config?: RequestInit): Promise<T> {
        return this.makeRequest<T>(url, {
            ...config,
            body: JSON.stringify(data),
            method: 'PUT',
        });
    }
}

const httpClient = new BaseHttpClient({
    baseUrl:
        typeof window === 'undefined'
            ? (process.env.BACKEND_API_URL ?? '') // Server-side
            : (process.env.NEXT_PUBLIC_BACKEND_API_URL ?? ''), // Client-side
});

export default httpClient;
