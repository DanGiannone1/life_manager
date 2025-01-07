import { Task, Goal, Category, Dashboard } from './index';

// API Response Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiMetadata {
  timestamp: string;
  requestId: string;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ApiMetadata;
}

// API Request Types
export interface SyncChange {
  type: 'task' | 'goal' | 'category' | 'dashboard';
  operation: 'create' | 'update' | 'delete';
  id?: string;
  data?: any;
  timestamp: string;
  changeType?: 'text' | 'status' | 'priority' | 'drag';
}

export interface SyncRequest {
  changes: SyncChange[];
  clientLastSync: string;
}

// API Response Data Types
export interface UserData {
  tasks: Record<string, Task>;
  goals: Record<string, Goal>;
  categories: Record<string, Category>;
  dashboard: Dashboard | null;
  lastSyncedAt: string;
}

export interface SyncResponseData {
  serverChanges?: SyncChange[];
  syncedAt: string;
}

// API Error Codes
export const API_ERROR_CODES = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES]; 