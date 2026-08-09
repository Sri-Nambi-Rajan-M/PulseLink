//#region node_modules/.nitro/vite/services/ssr/assets/api-DTZYjuPk.js
var TOKEN_KEY = "pulselink_token";
var USER_KEY = "pulselink_user";
function getToken() {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(TOKEN_KEY);
}
function getStoredUser() {
	if (typeof window === "undefined") return null;
	const raw = localStorage.getItem(USER_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
function setAuth(token, user) {
	if (typeof window === "undefined") return;
	localStorage.setItem(TOKEN_KEY, token);
	localStorage.setItem(USER_KEY, JSON.stringify(user));
}
function clearAuth() {
	if (typeof window === "undefined") return;
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
}
function isAuthenticated() {
	return !!getToken();
}
var apiBase = "http://localhost:5000";
var ApiError = class extends Error {
	status;
	type;
	constructor(status, message, type) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.type = type;
	}
};
function authHeaders() {
	const token = getToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}
function handleUnauthorized() {
	if (typeof window === "undefined") return;
	clearAuth();
	if (window.location.pathname !== "/login") window.location.href = "/login";
}
async function toApiError(res) {
	if (res.status === 401) handleUnauthorized();
	const rawText = await res.text();
	try {
		const parsed = rawText ? JSON.parse(rawText) : null;
		const message = parsed?.message || `Request failed with status ${res.status}`;
		return new ApiError(res.status, message, parsed?.type);
	} catch {
		return new ApiError(res.status, `Request failed with status ${res.status}`);
	}
}
async function apiGet(path) {
	const res = await fetch(`${apiBase}${path}`, { headers: {
		"Content-Type": "application/json",
		...authHeaders()
	} });
	if (!res.ok) throw await toApiError(res);
	return res.json();
}
async function apiPost(path, body) {
	const res = await fetch(`${apiBase}${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...authHeaders()
		},
		body: body !== void 0 ? JSON.stringify(body) : void 0
	});
	if (!res.ok) throw await toApiError(res);
	return res.json();
}
async function apiPut(path, body) {
	const res = await fetch(`${apiBase}${path}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			...authHeaders()
		},
		body: body !== void 0 ? JSON.stringify(body) : void 0
	});
	if (!res.ok) throw await toApiError(res);
	return res.json();
}
async function apiPatch(path, body) {
	const res = await fetch(`${apiBase}${path}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			...authHeaders()
		},
		body: body !== void 0 ? JSON.stringify(body) : void 0
	});
	if (!res.ok) throw await toApiError(res);
	return res.json();
}
async function apiDelete(path) {
	const res = await fetch(`${apiBase}${path}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
			...authHeaders()
		}
	});
	if (!res.ok) throw await toApiError(res);
	return res.json();
}
//#endregion
export { apiPatch as a, clearAuth as c, isAuthenticated as d, setAuth as f, apiGet as i, getStoredUser as l, apiBase as n, apiPost as o, apiDelete as r, apiPut as s, ApiError as t, getToken as u };
