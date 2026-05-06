import { supabase } from './supabase';
async function getAuthHeader() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
}
export async function apiFetch(path, options = {}) {
    const authHeaders = await getAuthHeader();
    const res = await fetch(path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
            ...options.headers,
        },
    });
    const json = await res.json();
    if (!res.ok)
        return { error: json.error || 'Request failed' };
    return json;
}
