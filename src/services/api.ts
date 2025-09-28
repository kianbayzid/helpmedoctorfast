// src/services/api.ts

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  'http://localhost:3000/api';

function buildUrl(endpoint: string, params?: Record<string, any>) {
  const url = new URL(endpoint, API_BASE_URL);
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
    });
  }
  return url.toString();
}

async function request<T>(
  endpoint: string,
  {
    method = 'GET',
    body,
    params,
    headers = {},
  }: {
    method?: HttpMethod;
    body?: any;
    params?: Record<string, any>;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  // Only set Content-Type for non-FormData JSON requests
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const defaultHeaders: Record<string, string> = {};
  if (!isFormData) defaultHeaders['Content-Type'] = 'application/json';
  if (token) defaultHeaders['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(buildUrl(endpoint, params), {
    method,
    headers: { ...defaultHeaders, ...headers },
    body: body == null || method === 'GET' ? undefined : isFormData ? body : JSON.stringify(body),
    credentials: 'include', // optional; remove if not using cookies
  });

  // Handle 204/empty responses
  if (resp.status === 204) return undefined as unknown as T;

  const text = await resp.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // non-JSON response
    data = text;
  }

  if (!resp.ok) {
    const message =
      (data && (data.message || data.error || data.msg)) ||
      `HTTP ${resp.status} ${resp.statusText}`;
    const err: any = new Error(message);
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, any>) =>
    request<T>(endpoint, { method: 'GET', params }),
  post: <T>(endpoint: string, body?: any, params?: Record<string, any>) =>
    request<T>(endpoint, { method: 'POST', body, params }),
  put: <T>(endpoint: string, body?: any, params?: Record<string, any>) =>
    request<T>(endpoint, { method: 'PUT', body, params }),
  patch: <T>(endpoint: string, body?: any, params?: Record<string, any>) =>
    request<T>(endpoint, { method: 'PATCH', body, params }),
  delete: <T>(endpoint: string, params?: Record<string, any>) =>
    request<T>(endpoint, { method: 'DELETE', params }),
};
