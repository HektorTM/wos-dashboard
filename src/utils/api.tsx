
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
    const res = await fetch(input, { credentials: 'include', ...init });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
}
export async function apiFetchJson<T>(input: string, init: RequestInit = {}): Promise<T> {
    const res = await apiFetch(input, init);
    return res.json() as Promise<T>;
}