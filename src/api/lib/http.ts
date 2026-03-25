import { env } from "@/shared/config/env";
import { authStore } from "@/features/auth/hooks/auth-store";
import { HttpError, NetworkError } from "@/shared/lib/error";
import type { ErrorResponse } from "@/api/generated/schema";

type RequestOptions = RequestInit & {
  auth?: boolean;
  retry?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const baseUrl = env.apiBaseUrl.endsWith("/") ? env.apiBaseUrl : `${env.apiBaseUrl}/`;
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(normalizedPath, baseUrl);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

async function tryRefresh() {
  const refreshToken = authStore.getState().tokens?.refreshToken;

  if (!refreshToken) {
    return false;
  }

  const response = await fetch(buildUrl("/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    authStore.getState().clearSession();
    return false;
  }

  const data = (await response.json()) as {
    accessToken: string;
    refreshToken: string;
  };

  authStore.getState().setTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  return true;
}

export async function request<T>(path: string, options: RequestOptions = {}) {
  const { auth = true, retry = true, headers, query, ...init } = options;
  const token = auth ? authStore.getState().tokens?.accessToken : null;
  const url = buildUrl(path, query);

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("API network error", {
        url,
        apiBaseUrl: env.apiBaseUrl,
        error,
      });
    }

    throw new NetworkError(
      url,
      `Не удалось подключиться к backend. Проверьте VITE_API_BASE_URL (${env.apiBaseUrl}), доступность сервера и CORS.`,
    );
  }

  // Some Spring Security setups return 403 for expired/invalid bearer tokens
  // after auth filters run. We optimistically try one refresh on both 401 and 403.
  if ((response.status === 401 || response.status === 403) && auth && retry && token) {
    const refreshed = await tryRefresh();

    if (refreshed) {
      return request<T>(path, { ...options, retry: false });
    }

    authStore.getState().clearSession();
  }

  if (!response.ok) {
    let payload: ErrorResponse | undefined;

    try {
      payload = (await response.json()) as ErrorResponse;
    } catch {
      payload = undefined;
    }

    throw new HttpError(response.status, payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
