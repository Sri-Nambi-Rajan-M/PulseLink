import { clearAuth, getToken } from "./auth";

export const apiBase = import.meta.env.VITE_API_BASE ?? "http://localhost:5000";

// Errors thrown by apiGet/apiPost/apiPut/apiDelete carry the parsed backend
// message (and its type, when the backend classified it) instead of the raw
// "Request failed 400: {...}" JSON blob — that raw text used to get dumped
// straight into user-facing toasts via `error.message`.
export class ApiError extends Error {
  status: number;
  type?: string;

  constructor(status: number, message: string, type?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.type = type;
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// A 401 means the token is missing/expired/invalid — clear it and bounce to
// the login screen rather than leaving the app stuck showing failed queries.
function handleUnauthorized() {
  if (typeof window === "undefined") return;
  clearAuth();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  if (res.status === 401) {
    handleUnauthorized();
  }
  const rawText = await res.text();
  try {
    const parsed = rawText ? JSON.parse(rawText) : null;
    const message = parsed?.message || `Request failed with status ${res.status}`;
    return new ApiError(res.status, message, parsed?.type);
  } catch {
    // Backend didn't return JSON (e.g. a proxy error page) — fall back to
    // a generic message rather than showing raw HTML/text to the user.
    return new ApiError(res.status, `Request failed with status ${res.status}`);
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    throw await toApiError(res);
  }

  return res.json();
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw await toApiError(res);
  }

  return res.json();
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw await toApiError(res);
  }

  return res.json();
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw await toApiError(res);
  }

  return res.json();
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    throw await toApiError(res);
  }

  return res.json();
}
