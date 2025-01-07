import { ApiResponse, UserData, SyncRequest, SyncResponseData } from '@/types/api';

const API_BASE_URL = '/api/v1';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();
  if (!response.ok) {
    throw data.error || new Error('An error occurred while fetching the data.');
  }
  return data;
}

// Helper function to get headers
function getHeaders(): HeadersInit {
  // TODO: Add actual auth token handling
  return {
    'Content-Type': 'application/json',
    'X-User-ID': 'test-user-id', // TODO: Replace with actual user ID from auth
  };
}

// API Functions
export async function fetchUserData(): Promise<ApiResponse<UserData>> {
  const response = await fetch(`${API_BASE_URL}/user-data`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse<UserData>(response);
}

export async function syncChanges(request: SyncRequest): Promise<ApiResponse<SyncResponseData>> {
  const response = await fetch(`${API_BASE_URL}/sync`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(request),
  });
  return handleResponse<SyncResponseData>(response);
}

// Error retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
} as const;

// Helper function for exponential backoff
export function getRetryDelay(attempt: number): number {
  const delay = Math.min(
    RETRY_CONFIG.maxDelay,
    RETRY_CONFIG.baseDelay * Math.pow(2, attempt)
  );
  // Add some randomness to prevent thundering herd
  return delay + (Math.random() * 1000);
} 