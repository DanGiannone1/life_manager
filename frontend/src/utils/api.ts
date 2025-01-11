import { Task, UUID } from './types';

const API_BASE_URL = 'http://localhost:5000/api/v1';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    metadata?: {
        timestamp: string;
        requestId: string;
        pagination?: {
            total: number;
            page: number;
            pageSize: number;
            hasMore: boolean;
        };
    };
}

interface UserData {
    tasks: Record<UUID, Task>;
    lastSyncedAt: string;
}

interface SyncRequest {
    changes: Array<{
        type: 'task';
        operation: 'create' | 'update' | 'delete';
        id?: UUID;
        data?: Partial<Task>;
        timestamp: string;
        changeType?: 'text' | 'status' | 'priority' | 'drag';
    }>;
    clientLastSync: string;
}

interface SyncResponse {
    serverChanges?: Array<{
        type: 'task';
        operation: 'create' | 'update' | 'delete';
        id: UUID;
        data?: any;
        timestamp: string;
    }>;
    syncedAt: string;
}

class ApiClient {
    private userId: string = 'temp-user-id'; // TODO: Replace with actual auth

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'X-User-ID': this.userId,
            'X-Request-ID': crypto.randomUUID(),
            ...options.headers,
        };

        try {
            const response = await fetch(url, { ...options, headers });
            const data: ApiResponse<T> = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'An error occurred');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async getUserData(): Promise<UserData> {
        const response = await this.request<UserData>('/user-data');
        return response.data!;
    }

    async sync(changes: SyncRequest): Promise<SyncResponse> {
        const response = await this.request<SyncResponse>('/sync', {
            method: 'POST',
            body: JSON.stringify(changes),
        });
        return response.data!;
    }
}

export const api = new ApiClient(); 