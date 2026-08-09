export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const TOKEN_KEY = "pulselink_token";
const USER_KEY = "pulselink_user";

// SSR-safe: this app renders on the server first (TanStack Start), where
// `window`/`localStorage` don't exist. Every accessor here guards for that
// and simply reports "not authenticated" during SSR — the client re-checks
// on hydration.
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
