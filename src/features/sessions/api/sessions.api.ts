import { request } from "@/api";
import type {
  CreateSessionRequest,
  PageSessionMessageResponse,
  PageSessionResponse,
  ReportResponse,
  SendMessageRequest,
  SendMessageResponse,
  SessionResponse,
  SessionState,
  SessionStateResponse,
  UUID,
} from "@/api/generated/schema";

export type HistoryFilters = {
  state?: SessionState | "";
  profileId?: string;
  direction?: string;
  level?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  size?: number;
};

export const sessionsApi = {
  create: (payload: CreateSessionRequest) =>
    request<SessionResponse>("/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  get: (sessionId: UUID) =>
    request<SessionResponse>(`/sessions/${sessionId}`),
  start: (sessionId: UUID) =>
    request<SessionStateResponse>(`/sessions/${sessionId}/start`, { method: "POST" }),
  pause: (sessionId: UUID) =>
    request<SessionStateResponse>(`/sessions/${sessionId}/pause`, { method: "POST" }),
  resume: (sessionId: UUID) =>
    request<SessionStateResponse>(`/sessions/${sessionId}/resume`, { method: "POST" }),
  cancel: (sessionId: UUID) =>
    request<SessionStateResponse>(`/sessions/${sessionId}/cancel`, { method: "POST" }),
  finish: (sessionId: UUID) =>
    request<SessionResponse>(`/sessions/${sessionId}/finish`, { method: "POST" }),
  messages: (sessionId: UUID, page = 0, size = 50) =>
    request<PageSessionMessageResponse>(`/sessions/${sessionId}/messages`, {
      query: { page, size },
    }),
  sendMessage: (sessionId: UUID, payload: SendMessageRequest) =>
    request<SendMessageResponse>(`/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  report: (sessionId: UUID) =>
    request<ReportResponse>(`/sessions/${sessionId}/report`),
  history: (filters: HistoryFilters) =>
    request<PageSessionResponse>("/history/sessions", {
      query: filters,
    }),
};
