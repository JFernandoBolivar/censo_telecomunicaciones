import { auth } from "@/auth";
import { cookies } from "next/headers";
import { API } from "@/shared/commons/api";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

async function request<T>(
  path: string,
  options: { method?: HttpMethod; body?: unknown; params?: Record<string, string> } = {},
): Promise<T> {
  const session = await auth();
  let token = session?.user?.djAccess;

  const url = new URL(path, API.url);
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const buildFetch = (t: string | undefined) =>
    fetch(url.toString(), {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

  let res = await buildFetch(token);

  if (res.status === 401 && session?.user.djRefresh) {
    const refreshOk = await tryRefreshToken(session.user.djRefresh);
    if (refreshOk) {
      const refreshedSession = await auth();
      token = refreshedSession?.user?.djAccess;
      res = await buildFetch(token);
    }
  }

  if (res.status === 401) {
    const { SessionExpiredError } = await import("./errors");
    throw new SessionExpiredError();
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Error de red" }));
    throw new Error(err.message ?? err.detail ?? "Error desconocido");
  }

  return res.json();
}

async function tryRefreshToken(refreshToken: string): Promise<boolean> {
  try {
    const refreshUrl = new URL("token/refresh/", API.url);
    const refreshRes = await fetch(refreshUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!refreshRes.ok) return false;

    const data: { access: string } = await refreshRes.json();
    const cookieStore = await cookies();
    cookieStore.set("dj_access", data.access, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 8 * 60 * 60,
      path: "/",
    });
    return true;
  } catch {
    return false;
  }
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, string>) =>
    request<T>(path, { method: "GET", params }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),
};
