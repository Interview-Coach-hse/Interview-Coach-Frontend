declare global {
  interface Window {
    __APP_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

const runtimeApiBaseUrl = window.__APP_CONFIG__?.apiBaseUrl;

export const env = {
  apiBaseUrl: runtimeApiBaseUrl ?? import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
};
