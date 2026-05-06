import { supabase } from './supabase';

// In dev, Vite proxies /api to localhost:3001.
// In production, set VITE_API_URL to your Render server URL.
const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers as Record<string, string>),
    },
  });

  const json = await res.json();
  if (!res.ok) return { error: json.error || 'Request failed' };
  return json;
}
