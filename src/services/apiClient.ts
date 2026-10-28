/**
 * Secure API client for communicating with the backend Express / MongoDB API endpoints.
 * Never exposes MongoDB connection string to the browser.
 */

const API_BASE = '/api';

export class ApiClient {
  private static getToken(): string | null {
    return localStorage.getItem('smart_campus_jwt_token');
  }

  static async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: string; status: number }> {
    const url = endpoint.startsWith('/') ? `${API_BASE}${endpoint}` : `${API_BASE}/${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type');
      let data: any = null;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : null;
      }

      if (!response.ok) {
        return {
          error: data?.error || data?.message || `HTTP ${response.status}: Request failed`,
          status: response.status,
          data,
        };
      }

      return { data, status: response.status };
    } catch (err: any) {
      return {
        error: err?.message || 'Network error connecting to backend service.',
        status: 0,
      };
    }
  }

  static get<T = any>(endpoint: string): Promise<{ data?: T; error?: string; status: number }> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static post<T = any>(endpoint: string, body?: any): Promise<{ data?: T; error?: string; status: number }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static put<T = any>(endpoint: string, body?: any): Promise<{ data?: T; error?: string; status: number }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static delete<T = any>(endpoint: string): Promise<{ data?: T; error?: string; status: number }> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
